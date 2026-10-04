function validDate(value){
  if(!value)return false;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return false;
  const date=new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
}

function dateYearsAgo(years){
  const today=new Date();
  const date=new Date(Date.UTC(today.getUTCFullYear()-years,today.getUTCMonth(),today.getUTCDate()));
  return date.toISOString().slice(0,10);
}

async function nextGeneratedId(connection,oracledb,{sequence,table,column,prefix}){
  for(let attempt=0;attempt<100;attempt++){
    const result=await connection.execute(`SELECT ${sequence}.NEXTVAL NEXT_VALUE FROM DUAL`,{},{
      outFormat:oracledb.OUT_FORMAT_OBJECT
    });
    const value=Number(result.rows[0].NEXT_VALUE);
    const id=`${prefix}${String(value).padStart(3,'0')}`;
    const existing=await connection.execute(`SELECT COUNT(*) MATCH_COUNT FROM ${table} WHERE ${column}=:id`,{id},{
      outFormat:oracledb.OUT_FORMAT_OBJECT
    });
    if(!Number(existing.rows[0].MATCH_COUNT))return id;
  }
  throw Object.assign(new Error(`Could not generate a unique ${prefix} identifier`),{status:500});
}

async function hasActiveRole(connection,oracledb,{userId,personId,roleName}){
  const result=await connection.execute(`SELECT COUNT(*) ROLE_COUNT
    FROM SYSTEM_USER u JOIN SYSTEM_USER_ROLE ur ON ur.USER_ID=u.USER_ID
    WHERE u.USER_ID=:userId AND u.PERSON_ID=:personId
      AND u.USER_STATUS='ACTIVE' AND ur.ROLE_NAME=:roleName`,{
    userId,personId,roleName
  },{outFormat:oracledb.OUT_FORMAT_OBJECT});
  return Number(result.rows[0].ROLE_COUNT)>0;
}

function normalizeRescuePetBody(body){
  const name=String(body.petName||body.name||'').trim();
  const species=String(body.species||'').trim();
  const intakeDate=body.intakeDate||body.rescueDate;
  const missing=[];
  if(!name)missing.push('petName');
  if(!species)missing.push('species');
  if(!intakeDate)missing.push('intakeDate');
  if(missing.length)return {missing};
  if(!validDate(intakeDate))return {error:'Intake Date must be a valid date'};
  let dob=body.dob||null;
  if(dob&&!validDate(dob))return {error:'Date of Birth must be a valid date'};
  if(!dob&&body.approximateAge!==undefined&&body.approximateAge!==null&&body.approximateAge!==''){
    const age=Number(body.approximateAge);
    if(!Number.isFinite(age)||age<0)return {error:'Approximate age cannot be negative'};
    dob=dateYearsAgo(Math.floor(age));
  }
  const weight=body.weight===''||body.weight===undefined||body.weight===null?null:Number(body.weight);
  if(weight!==null&&(!Number.isFinite(weight)||weight<0))return {error:'Weight cannot be negative'};
  const statusMap={NOT_READY:'ON_HOLD',ON_HOLD:'ON_HOLD',AVAILABLE:'AVAILABLE',PENDING:'PENDING',ADOPTED:'ADOPTED'};
  const adoptionStatus=statusMap[String(body.adoptionStatus||'ON_HOLD').toUpperCase()];
  if(!adoptionStatus)return {error:'Adoption Status must be Available, Pending, Adopted or On Hold'};
  const gender=String(body.gender||'UNKNOWN').toUpperCase();
  if(!['MALE','FEMALE','UNKNOWN'].includes(gender))return {error:'Gender must be Male, Female or Unknown'};
  return {
    value:{
      name,
      species,
      intakeDate,
      dob,
      breed:body.breed||null,
      weight,
      gender,
      adoptionStatus
    }
  };
}

async function insertRescuedLocalPet(connection,oracledb,{rescueId,shelterId,registeredBy,pet}){
  const inserted=await connection.execute(`INSERT INTO PET(PET_ID,NAME,DOB,BREED,SPECIES,WEIGHT,GENDER)
    VALUES(NULL,:name,TO_DATE(:dob,'YYYY-MM-DD'),:breed,:species,:weight,:gender)
    RETURNING PET_ID INTO :petId`,{
    name:pet.name,
    dob:pet.dob,
    breed:pet.breed,
    species:pet.species,
    weight:pet.weight,
    gender:pet.gender,
    petId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
  });
  const petId=inserted.outBinds.petId[0];
  await connection.execute(`INSERT INTO LOCAL_PET(PET_ID,ADOPTION_STATUS,IN_TAKE_DATE)
    VALUES(:petId,:adoptionStatus,TO_DATE(:intakeDate,'YYYY-MM-DD'))`,{
    petId,adoptionStatus:pet.adoptionStatus,intakeDate:pet.intakeDate
  });
  await connection.execute(`INSERT INTO PET_SHELTER(PET_ID,SHELTER_ID) VALUES(:petId,:shelterId)`,{
    petId,shelterId
  });
  await connection.execute(`INSERT INTO RESCUE_PET(RESCUE_ID,PET_ID,INTAKE_DATE,REGISTERED_BY)
    VALUES(:rescueId,:petId,TO_DATE(:intakeDate,'YYYY-MM-DD'),:registeredBy)`,{
    rescueId,petId,intakeDate:pet.intakeDate,registeredBy
  });
  return petId;
}

module.exports = function createRescueController(deps) {
  const {
      safe,
      required,
      writeRoles,
      managementRoles,
      staffRoles,
      careRoles,
      makeId,
      bcrypt,
      jwt,
      crypto,
      oracledb,
      withConnection,
      select,
      execute,
      transaction,
      authenticate,
      authorize,
      queryCatalog
    } = deps;

  return {
    listShelters: async(req,res)=>{
  const rows=await withConnection(async connection=>{
    const activeRole=await hasActiveRole(connection,oracledb,{
      userId:req.user.userId,personId:req.user.personId,roleName:'VOLUNTEER'
    });
    if(!activeRole)throw Object.assign(new Error('An active Volunteer role is required to select a receiving shelter'),{status:403});
    const result=await connection.execute(`SELECT DISTINCT s.SHELTER_ID,s.ROOM_TYPE
      FROM SHELTER s
      JOIN SHELTER_SUPERVISION ss ON ss.SHELTER_ID=s.SHELTER_ID
      JOIN SYSTEM_USER u ON u.PERSON_ID=ss.SUPERVISOR_ID AND u.USER_STATUS='ACTIVE'
      JOIN SYSTEM_USER_ROLE ur ON ur.USER_ID=u.USER_ID AND ur.ROLE_NAME='SUPERVISOR'
      ORDER BY s.SHELTER_ID`,{},{
      outFormat:oracledb.OUT_FORMAT_OBJECT
    });
    return result.rows;
  });
  res.json(rows);
},

    listRescues: async(req,res)=>{
  let filter='';
  const binds={};
  const activeRole=(await select(`SELECT COUNT(*) ROLE_COUNT
    FROM SYSTEM_USER u JOIN SYSTEM_USER_ROLE ur ON ur.USER_ID=u.USER_ID
    WHERE u.USER_ID=:userId AND u.PERSON_ID=:personId
      AND u.USER_STATUS='ACTIVE' AND ur.ROLE_NAME=:roleName`,{
    userId:req.user.userId,personId:req.user.personId,roleName:req.user.role
  }))[0]?.ROLE_COUNT||0;
  if(!Number(activeRole))return res.status(403).json({error:`An active ${req.user.role} role is required to view rescue reports`});
  if(req.user.role==='VOLUNTEER'){
    filter='WHERE VOLUNTEER_ID=:personId';
    binds.personId=req.user.personId;
  }else if(req.user.role==='SUPERVISOR'){
    filter='WHERE SUPERVISOR_ID=:personId';
    binds.personId=req.user.personId;
  }else if(req.user.role!=='ADMIN'){
    return res.status(403).json({error:'Insufficient role'});
  }
  res.json(await select(`SELECT * FROM VW_RESCUE_DETAILS ${filter} ORDER BY RESCUE_DATE DESC,RESCUE_ID DESC`,binds));
},

    listIntakeQueue: async(req,res)=>{
  const rows=await withConnection(async connection=>{
    const activeRole=await hasActiveRole(connection,oracledb,{
      userId:req.user.userId,personId:req.user.personId,roleName:'SUPERVISOR'
    });
    if(!activeRole)throw Object.assign(new Error('An active Supervisor role is required to view rescue intake'),{status:403});
    const result=await connection.execute(`SELECT * FROM VW_RESCUE_DETAILS
      WHERE SUPERVISOR_ID=:personId
      ORDER BY RESCUE_DATE DESC,RESCUE_ID DESC`,{personId:req.user.personId},{
      outFormat:oracledb.OUT_FORMAT_OBJECT
    });
    return result.rows;
  });
  res.json(rows);
},

    createRescue: async(req,res)=>{
  const body=req.body||{};const missing=required(body,['rescueDate','location','shelterId']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(!validDate(body.rescueDate))return res.status(400).json({error:'Rescue Date must be a valid date'});
  const petInput=normalizeRescuePetBody(body);
  if(petInput.missing?.length)return res.status(400).json({error:`Required: ${petInput.missing.join(', ')}`});
  if(petInput.error)return res.status(400).json({error:petInput.error});
  const shelterId=String(body.shelterId||'').trim();
  if(!shelterId)return res.status(400).json({error:'Select a receiving shelter'});
  const activeRole=(await select(`SELECT COUNT(*) ROLE_COUNT
    FROM SYSTEM_USER u JOIN SYSTEM_USER_ROLE ur ON ur.USER_ID=u.USER_ID
    WHERE u.USER_ID=:userId AND u.PERSON_ID=:personId
      AND u.USER_STATUS='ACTIVE' AND ur.ROLE_NAME='VOLUNTEER'`,{
    userId:req.user.userId,personId:req.user.personId
  }))[0]?.ROLE_COUNT||0;
  if(!Number(activeRole))return res.status(403).json({error:'An active Volunteer role is required to submit rescue reports'});
  const shelter=(await select(`SELECT DISTINCT s.SHELTER_ID
    FROM SHELTER s
    JOIN SHELTER_SUPERVISION ss ON ss.SHELTER_ID=s.SHELTER_ID
    JOIN SYSTEM_USER u ON u.PERSON_ID=ss.SUPERVISOR_ID AND u.USER_STATUS='ACTIVE'
    JOIN SYSTEM_USER_ROLE ur ON ur.USER_ID=u.USER_ID AND ur.ROLE_NAME='SUPERVISOR'
    WHERE s.SHELTER_ID=:shelterId`,{shelterId}))[0];
  if(!shelter)return res.status(400).json({error:'Select a receiving shelter with an active assigned Supervisor'});
  let rescueId;
  let petId;
  await transaction(async connection=>{
    rescueId=await nextGeneratedId(connection,oracledb,{
      sequence:'RESCUE_ID_SEQ',table:'RESCUE',column:'RESCUE_ID',prefix:'R'
    });
    await connection.execute(`INSERT INTO RESCUE(RESCUE_ID,RESCUE_DATE,LOCATION,STATUS)
      VALUES(:rescueId,TO_DATE(:rescueDate,'YYYY-MM-DD'),:location,'INTAKE_IN_PROGRESS')`,{
      rescueId,rescueDate:body.rescueDate,location:body.location
    });
    await connection.execute(`INSERT INTO RESCUE_SHELTER(RESCUE_ID,SHELTER_ID) VALUES(:rescueId,:shelterId)`,{rescueId,shelterId});
    await connection.execute(`INSERT INTO VOLUNTEER_RESCUE(VOLUNTEER_ID,RESCUE_ID) VALUES(:volunteerId,:rescueId)`,{volunteerId:req.user.personId,rescueId});
    petId=await insertRescuedLocalPet(connection,oracledb,{
      rescueId,shelterId,registeredBy:req.user.personId,pet:petInput.value
    });
  });
  res.status(201).json({message:`Your rescue report was recorded and pet ${petId} was added to the receiving shelter`,rescueId,petId});
},

    registerRescuePet: async(req,res)=>{
  const body=req.body||{};
  const petInput=normalizeRescuePetBody(body);
  if(petInput.missing?.length)return res.status(400).json({error:`Required: ${petInput.missing.join(', ')}`});
  if(petInput.error)return res.status(400).json({error:petInput.error});
  let petId;
  await transaction(async connection=>{
    const activeRole=await hasActiveRole(connection,oracledb,{
      userId:req.user.userId,personId:req.user.personId,roleName:'SUPERVISOR'
    });
    if(!activeRole)throw Object.assign(new Error('An active Supervisor role is required to process rescue intake'),{status:403});
    const rescueResult=await connection.execute(`SELECT r.RESCUE_ID,r.STATUS,rs.SHELTER_ID
      FROM RESCUE r
      JOIN RESCUE_SHELTER rs ON rs.RESCUE_ID=r.RESCUE_ID
      JOIN SHELTER_SUPERVISION ss ON ss.SHELTER_ID=rs.SHELTER_ID
      WHERE r.RESCUE_ID=:rescueId AND ss.SUPERVISOR_ID=:supervisorId
      FOR UPDATE`,{
      rescueId:req.params.rescueId,supervisorId:req.user.personId
    },{outFormat:oracledb.OUT_FORMAT_OBJECT});
    const rescue=rescueResult.rows[0];
    if(!rescue)throw Object.assign(new Error('Only the Supervisor assigned to the receiving shelter can process this rescue intake'),{status:403});
    if(rescue.STATUS==='CANCELLED')throw Object.assign(new Error('Cannot register pets for a cancelled rescue'),{status:409});
    if(rescue.STATUS==='INTAKE_COMPLETED')throw Object.assign(new Error('This rescue intake has already been completed'),{status:409});
    petId=await insertRescuedLocalPet(connection,oracledb,{
      rescueId:req.params.rescueId,
      shelterId:rescue.SHELTER_ID,
      registeredBy:req.user.personId,
      pet:petInput.value
    });
    await connection.execute(`UPDATE RESCUE SET STATUS='INTAKE_IN_PROGRESS'
      WHERE RESCUE_ID=:rescueId AND STATUS='PENDING_INTAKE'`,{rescueId:req.params.rescueId});
  });
  res.status(201).json({message:`Pet ${petId} registered for rescue ${req.params.rescueId}`,petId});
},

    completeIntake: async(req,res)=>{
  await transaction(async connection=>{
    const activeRole=await hasActiveRole(connection,oracledb,{
      userId:req.user.userId,personId:req.user.personId,roleName:'SUPERVISOR'
    });
    if(!activeRole)throw Object.assign(new Error('An active Supervisor role is required to complete rescue intake'),{status:403});
    const rescueResult=await connection.execute(`SELECT r.RESCUE_ID,r.STATUS
      FROM RESCUE r
      JOIN RESCUE_SHELTER rs ON rs.RESCUE_ID=r.RESCUE_ID
      JOIN SHELTER_SUPERVISION ss ON ss.SHELTER_ID=rs.SHELTER_ID
      WHERE r.RESCUE_ID=:rescueId AND ss.SUPERVISOR_ID=:supervisorId
      FOR UPDATE`,{
      rescueId:req.params.rescueId,supervisorId:req.user.personId
    },{outFormat:oracledb.OUT_FORMAT_OBJECT});
    const rescue=rescueResult.rows[0];
    if(!rescue)throw Object.assign(new Error('Only the Supervisor assigned to the receiving shelter can complete this rescue intake'),{status:403});
    if(rescue.STATUS==='CANCELLED')throw Object.assign(new Error('Cannot complete intake for a cancelled rescue'),{status:409});
    if(rescue.STATUS==='INTAKE_COMPLETED')throw Object.assign(new Error('This rescue intake has already been completed'),{status:409});
    const pets=await connection.execute(`SELECT COUNT(*) PET_COUNT FROM RESCUE_PET WHERE RESCUE_ID=:rescueId`,{
      rescueId:req.params.rescueId
    },{outFormat:oracledb.OUT_FORMAT_OBJECT});
    if(!Number(pets.rows[0].PET_COUNT))throw Object.assign(new Error('Register at least one rescued pet before completing intake'),{status:400});
    await connection.execute(`UPDATE RESCUE SET STATUS='INTAKE_COMPLETED' WHERE RESCUE_ID=:rescueId`,{rescueId:req.params.rescueId});
  });
  res.json({message:`Rescue ${req.params.rescueId} intake completed`});
}
  };
};

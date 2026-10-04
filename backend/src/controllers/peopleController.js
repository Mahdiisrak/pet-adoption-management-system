function validDateOfBirth(value){
  if(!value)return true;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return false;
  const date=new Date(`${value}T00:00:00Z`);
  if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==value)return false;
  const today=new Date();
  const oldest=new Date(Date.UTC(today.getUTCFullYear()-120,today.getUTCMonth(),today.getUTCDate()));
  return date<=today&&date>=oldest;
}

module.exports = function createPeopleController(deps) {
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
    listPeople: async(req,res)=>{
  const search=String(req.query.search||'').trim()||null;
  const rows=await select(`SELECT v.PERSON_ID,v.FIRST_NAME,v.LAST_NAME,v.DATE_OF_BIRTH,v.GENDER,v.EMAIL,v.AGE,
    (SELECT LISTAGG(ur.ROLE_NAME,',') WITHIN GROUP (ORDER BY ur.ROLE_NAME)
       FROM SYSTEM_USER u JOIN SYSTEM_USER_ROLE ur ON ur.USER_ID=u.USER_ID
      WHERE u.PERSON_ID=v.PERSON_ID AND u.USER_STATUS='ACTIVE') ROLES
    FROM VW_PERSON_ROLES v
    WHERE :search IS NULL
       OR UPPER(v.PERSON_ID)=UPPER(:search)
       OR UPPER(TRIM(v.FIRST_NAME||' '||v.LAST_NAME))=UPPER(:search)
       OR UPP
       \
       R(v.FIRST_NAME)=UPPER(:search)
       OR UPPER(v.LAST_NAME)=UPPER(:search)
       OR UPPER(v.EMAIL)=UPPER(:search)
    ORDER BY v.PERSON_ID DESC`,{search});
  res.json(rows);
},

    createPerson: async(req,res)=>{
  const body=req.body||{};
  const role=String(body.role||'').toUpperCase();
  const missing=required(body,['firstName','lastName','role','username','password']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(!['DOCTOR','EMPLOYEE','VOLUNTEER'].includes(role))return res.status(400).json({error:'Staff role must be Doctor, Employee or Volunteer'});
  if(!validDateOfBirth(body.dateOfBirth))return res.status(400).json({error:'Date of birth must be a valid past date and age cannot exceed 120 years'});
  if(String(body.password).length<6)return res.status(400).json({error:'Temporary password must contain at least 6 characters'});
  const passwordHash=await bcrypt.hash(body.password,10);
  let personId;
  let userId;
  await transaction(async connection=>{
    const personResult=await connection.execute(`INSERT INTO PERSON(PERSON_ID,FIRST_NAME,LAST_NAME,DATE_OF_BIRTH,GENDER,EMAIL)
      VALUES(NULL,:firstName,:lastName,TO_DATE(:dateOfBirth,'YYYY-MM-DD'),:gender,:email)
      RETURNING PERSON_ID INTO :personId`,{
      firstName:body.firstName,lastName:body.lastName,dateOfBirth:body.dateOfBirth||null,gender:body.gender||null,email:body.email||null,
      personId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
    });
    personId=personResult.outBinds.personId[0];
    for(const phone of body.phones||[]){
      if(phone)await connection.execute(`INSERT INTO PERSON_PHONE(PERSON_ID,PHONE) VALUES(:personId,:phone)`,{personId,phone});
    }
    for(const address of body.addresses||[]){
      if(address.houseNo&&address.street&&address.city){
        await connection.execute(`INSERT INTO PERSON_ADDRESS(PERSON_ID,HOUSE_NO,STREET,CITY) VALUES(:personId,:houseNo,:street,:city)`,{personId,...address});
      }
    }
    if(role==='DOCTOR'){
      await connection.execute(`INSERT INTO DOCTOR(PERSON_ID,SALARY,SPECIALIZATION)
        VALUES(:personId,:salary,:details)`,{
        personId,salary:body.salary||null,details:body.details||null
      });
    }else if(role==='EMPLOYEE'){
      await connection.execute(`INSERT INTO EMPLOYEE(PERSON_ID,OCCUPATION,HIRE_DATE,POSITION,SALARY)
        VALUES(:personId,:occupation,TO_DATE(:hireDate,'YYYY-MM-DD'),:position,:salary)`,{
        personId,occupation:body.occupation||null,hireDate:body.hireDate||null,
        position:body.details||null,salary:body.salary||null
      });
    }else{
      await connection.execute(`INSERT INTO VOLUNTEER(PERSON_ID,SKILL)
        VALUES(:personId,:details)`,{personId,details:body.details||null});
    }
    const userResult=await connection.execute(`INSERT INTO SYSTEM_USER(USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
      VALUES(NULL,:personId,:username,:passwordHash,:role,'ACTIVE')
      RETURNING USER_ID INTO :userId`,{
      personId,username:body.username,passwordHash,role,
      userId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
    });
    userId=userResult.outBinds.userId[0];
    await connection.execute(`INSERT INTO SYSTEM_USER_ROLE(USER_ID,ROLE_NAME,GRANTED_BY_USER_ID)
      VALUES(:userId,:role,:grantedBy)`,{userId,role,grantedBy:req.user.userId});
  });
  res.status(201).json({
    message:`${role} profile and login account created successfully`,
    personId,userId,role
  });
},

    updatePerson: async(req,res)=>{
  const body=req.body||{};
  const role=String(body.role||'').toUpperCase();
  const missing=required(body,['firstName','lastName']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(!validDateOfBirth(body.dateOfBirth))return res.status(400).json({error:'Date of birth must be a valid past date and age cannot exceed 120 years'});
  if(role&&!['DOCTOR','EMPLOYEE','VOLUNTEER'].includes(role))return res.status(400).json({error:'Staff role must be Doctor, Employee or Volunteer'});

  await transaction(async connection=>{
    const updated=await connection.execute(`UPDATE PERSON SET FIRST_NAME=:firstName,LAST_NAME=:lastName,
      DATE_OF_BIRTH=TO_DATE(:dateOfBirth,'YYYY-MM-DD'),GENDER=:gender,EMAIL=:email WHERE PERSON_ID=:personId`,{
      personId:req.params.personId,firstName:body.firstName,lastName:body.lastName,
      dateOfBirth:body.dateOfBirth||null,gender:body.gender||null,email:body.email||null
    });
    if(!updated.rowsAffected)throw Object.assign(new Error('Person not found'),{status:404});
    if(!role)return;

    if(role==='DOCTOR'){
      await connection.execute(`MERGE INTO DOCTOR d USING (SELECT :personId PERSON_ID FROM DUAL) source
        ON (d.PERSON_ID=source.PERSON_ID)
        WHEN MATCHED THEN UPDATE SET d.SALARY=:salary,d.SPECIALIZATION=:details
        WHEN NOT MATCHED THEN INSERT (PERSON_ID,SALARY,SPECIALIZATION) VALUES (:personId,:salary,:details)`,
        {personId:req.params.personId,salary:body.salary||null,details:body.details||null});
    }else if(role==='EMPLOYEE'){
      await connection.execute(`MERGE INTO EMPLOYEE e USING (SELECT :personId PERSON_ID FROM DUAL) source
        ON (e.PERSON_ID=source.PERSON_ID)
        WHEN MATCHED THEN UPDATE SET e.OCCUPATION=:occupation,e.HIRE_DATE=TO_DATE(:hireDate,'YYYY-MM-DD'),e.POSITION=:position,e.SALARY=:salary
        WHEN NOT MATCHED THEN INSERT (PERSON_ID,OCCUPATION,HIRE_DATE,POSITION,SALARY)
        VALUES (:personId,:occupation,TO_DATE(:hireDate,'YYYY-MM-DD'),:position,:salary)`,{
        personId:req.params.personId,occupation:body.occupation||null,hireDate:body.hireDate||null,
        position:body.details||null,salary:body.salary||null
      });
    }else{
      await connection.execute(`MERGE INTO VOLUNTEER v USING (SELECT :personId PERSON_ID FROM DUAL) source
        ON (v.PERSON_ID=source.PERSON_ID)
        WHEN MATCHED THEN UPDATE SET v.SKILL=:details
        WHEN NOT MATCHED THEN INSERT (PERSON_ID,SKILL) VALUES (:personId,:details)`,
        {personId:req.params.personId,details:body.details||null});
    }

    const accountResult=await connection.execute(`SELECT USER_ID FROM SYSTEM_USER WHERE PERSON_ID=:personId`,
      {personId:req.params.personId},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    let userId=accountResult.rows[0]?.USER_ID;
    if(!userId){
      if(!body.username||!body.password)throw Object.assign(new Error('Username and temporary password are required to activate a role for a person without an account'),{status:400});
      if(String(body.password).length<6)throw Object.assign(new Error('Temporary password must contain at least 6 characters'),{status:400});
      const passwordHash=await bcrypt.hash(body.password,10);
      const userResult=await connection.execute(`INSERT INTO SYSTEM_USER(USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
        VALUES(NULL,:personId,:username,:passwordHash,:role,'ACTIVE')
        RETURNING USER_ID INTO :userId`,{
        personId:req.params.personId,username:body.username,passwordHash,role,
        userId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
      });
      userId=userResult.outBinds.userId[0];
    }
    await connection.execute(`MERGE INTO SYSTEM_USER_ROLE target
      USING (SELECT :userId USER_ID,:role ROLE_NAME FROM DUAL) source
      ON (target.USER_ID=source.USER_ID AND target.ROLE_NAME=source.ROLE_NAME)
      WHEN NOT MATCHED THEN INSERT (USER_ID,ROLE_NAME,GRANTED_BY_USER_ID)
      VALUES (:userId,:role,:grantedBy)`,{userId,role,grantedBy:req.user.userId});
  });
  res.json({message:role?'Person details and staff role updated':'Person details updated'});
},

    listEmergencyContacts: async(req,res)=>{
  const canViewAll=req.user.role==='ADMIN';
  const canViewStaff=req.user.role==='SUPERVISOR';
  const rows=await select(`SELECT e.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME PERSON_NAME,e.E_NAME,e.RELATION,e.PHONE,
    CASE WHEN e.PERSON_ID=:personId THEN 1 ELSE 0 END CAN_MANAGE
    FROM EMERGENCY_NO e JOIN PERSON p ON p.PERSON_ID=e.PERSON_ID
    WHERE :canViewAll=1
       OR (:canViewStaff=1 AND (
         EXISTS (SELECT 1 FROM DOCTOR d WHERE d.PERSON_ID=e.PERSON_ID)
         OR EXISTS (SELECT 1 FROM EMPLOYEE emp WHERE emp.PERSON_ID=e.PERSON_ID)
         OR EXISTS (SELECT 1 FROM VOLUNTEER v WHERE v.PERSON_ID=e.PERSON_ID)
         OR EXISTS (SELECT 1 FROM SUPERVISOR s WHERE s.PERSON_ID=e.PERSON_ID)
       ))
       OR e.PERSON_ID=:personId
    ORDER BY e.PERSON_ID,e.E_NAME`,{
    personId:req.user.personId,canViewAll:canViewAll?1:0,canViewStaff:canViewStaff?1:0
  });
  res.json(rows);
},

    createEmergencyContact: async(req,res)=>{
  const body=req.body||{};const missing=required(body,['eName','relation','phone']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  await execute(`INSERT INTO EMERGENCY_NO(PERSON_ID,E_NAME,RELATION,PHONE) VALUES(:personId,:eName,:relation,:phone)`,{
    personId:req.user.personId,eName:body.eName,relation:body.relation,phone:body.phone
  });
  res.status(201).json({message:'Your emergency contact was added'});
},

    updateEmergencyContact: async(req,res)=>{
  const body=req.body||{};const missing=required(body,['eName','relation','phone']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  const result=await execute(`UPDATE EMERGENCY_NO SET E_NAME=:eName,RELATION=:relation,PHONE=:phone
    WHERE PERSON_ID=:personId AND E_NAME=:currentName`,{
    personId:req.user.personId,currentName:req.params.currentName,eName:body.eName,relation:body.relation,phone:body.phone
  });
  if(!result.rowsAffected)return res.status(404).json({error:'You can update only your own emergency contact'});
  res.json({message:'Your emergency contact was updated'});
},

    deleteEmergencyContact: async(req,res)=>{
  const result=await execute(`DELETE FROM EMERGENCY_NO WHERE PERSON_ID=:personId AND E_NAME=:eName`,{
    personId:req.user.personId,eName:req.params.eName
  });
  if(!result.rowsAffected)return res.status(404).json({error:'You can remove only your own emergency contact'});
  res.json({message:'Your emergency contact was removed'});
}
  };
};

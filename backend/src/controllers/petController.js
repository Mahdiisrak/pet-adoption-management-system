module.exports = function createPetController(deps) {
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
    listPets: async(req,res)=>{
  const search=String(req.query.search||'').trim()||null;
  const rows=await select(`SELECT * FROM VW_PET_DETAILS
    WHERE :search IS NULL
       OR UPPER(PET_ID)=UPPER(:search)
       OR UPPER(NAME)=UPPER(:search)
       OR UPPER(SPECIES)=UPPER(:search)
       OR UPPER(BREED)=UPPER(:search)
       OR UPPER(RESPONSIBLE_ID)=UPPER(:search)
       OR UPPER(RESPONSIBLE_NAME)=UPPER(:search)
       OR UPPER(SHELTER_ID)=UPPER(:search)
       OR UPPER(SOURCE_RESCUE_ID)=UPPER(:search)
    ORDER BY PET_ID`,{search});
  res.json(rows);
},

    listOwners: async(req,res)=>{
  const search=String(req.query.search||'').trim()||null;
  const result=await withConnection(async connection=>{
    const callResult=await connection.execute(
      `BEGIN PR_OWNER_DIRECTORY(:search,:message,:rows); END;`,
      {
        search,
        message:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:200},
        rows:{dir:oracledb.BIND_OUT,type:oracledb.CURSOR}
      },
      {outFormat:oracledb.OUT_FORMAT_OBJECT}
    );
    const resultSet=callResult.outBinds.rows;
    try{
      return {
        message:callResult.outBinds.message,
        rows:await resultSet.getRows()
      };
    }finally{
      await resultSet.close();
    }
  });
  res.json(result);
},

    listMyOwnedPets: async(req,res)=>{
  const rows=await select(`SELECT p.PET_ID,p.NAME PET_NAME,p.SPECIES,p.BREED,
    TO_CHAR(g.CHECK_IN_DATE,'YYYY-MM-DD') CHECK_IN_DATE,g.RELEVANT_TIME
    FROM GUEST_PET_OWNER gpo JOIN GUEST_PET g ON g.PET_ID=gpo.PET_ID
    JOIN PET p ON p.PET_ID=g.PET_ID
    WHERE gpo.OWNER_ID=:personId ORDER BY p.NAME`,{personId:req.user.personId});
  res.json(rows);
},

    createPet: async(req,res)=>{
  const body=req.body||{};const missing=required(body,['name','species','petType','shelterId']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(!['LOCAL','GUEST'].includes(body.petType))return res.status(400).json({error:'petType must be LOCAL or GUEST'});
  let petId;
  await transaction(async connection=>{
    await connection.execute(`BEGIN PETCARE_ID_CONTEXT.SET_PET_PREFIX(:prefix); END;`,{
      prefix:body.petType==='GUEST'?'GP':'LP'
    });
    let insertResult;
    try{
      insertResult=await connection.execute(`INSERT INTO PET(PET_ID,NAME,DOB,BREED,SPECIES,WEIGHT)
        VALUES(NULL,:name,TO_DATE(:dob,'YYYY-MM-DD'),:breed,:species,:weight)
        RETURNING PET_ID INTO :petId`,{
        name:body.name,dob:body.dob||null,breed:body.breed||null,species:body.species,weight:body.weight||null,
        petId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
      });
    }finally{
      await connection.execute(`BEGIN PETCARE_ID_CONTEXT.CLEAR_PET_PREFIX; END;`);
    }
    petId=insertResult.outBinds.petId[0];
    if(body.petType==='LOCAL'){
      await connection.execute(`INSERT INTO LOCAL_PET(PET_ID,ADOPTION_STATUS,IN_TAKE_DATE) VALUES(:petId,:status,TO_DATE(:dateValue,'YYYY-MM-DD'))`,{petId,status:body.adoptionStatus||'AVAILABLE',dateValue:body.intakeDate||new Date().toISOString().slice(0,10)});
    }else{
      await connection.execute(`INSERT INTO GUEST_PET(PET_ID,CHECK_IN_DATE,RELEVANT_TIME) VALUES(:petId,TO_DATE(:dateValue,'YYYY-MM-DD'),:relevantTime)`,{petId,dateValue:body.checkInDate||new Date().toISOString().slice(0,10),relevantTime:body.relevantTime||null});
      if(!body.ownerId)throw Object.assign(new Error('Owner ID is required for a guest pet'),{status:400});
      if(String(body.ownerIsNew).toUpperCase()==='YES'){
        const ownerMissing=required(body,['ownerFirstName','ownerLastName','ownerPhone']);
        if(ownerMissing.length)throw Object.assign(new Error(`Required for new owner: ${ownerMissing.join(', ')}`),{status:400});
        await connection.execute(`INSERT INTO PERSON(PERSON_ID,FIRST_NAME,LAST_NAME,GENDER,EMAIL) VALUES(:personId,:firstName,:lastName,:gender,:email)`,{
          personId:body.ownerId,firstName:body.ownerFirstName,lastName:body.ownerLastName,gender:body.ownerGender||null,email:body.ownerEmail||null
        });
        await connection.execute(`INSERT INTO PERSON_PHONE(PERSON_ID,PHONE) VALUES(:personId,:phone)`,{personId:body.ownerId,phone:body.ownerPhone});
        if(body.ownerHouseNo&&body.ownerStreet&&body.ownerCity)await connection.execute(`INSERT INTO PERSON_ADDRESS(PERSON_ID,HOUSE_NO,STREET,CITY) VALUES(:personId,:houseNo,:street,:city)`,{
          personId:body.ownerId,houseNo:body.ownerHouseNo,street:body.ownerStreet,city:body.ownerCity
        });
        await connection.execute(`INSERT INTO OWNER(PERSON_ID,OCCUPATION) VALUES(:personId,:occupation)`,{personId:body.ownerId,occupation:body.ownerOccupation||null});
      }
      await connection.execute(`INSERT INTO GUEST_PET_OWNER(PET_ID,OWNER_ID) VALUES(:petId,:ownerId)`,{petId,ownerId:body.ownerId});
    }
    await connection.execute(`INSERT INTO PET_SHELTER(PET_ID,SHELTER_ID) VALUES(:petId,:shelterId)`,{
      petId,shelterId:body.shelterId
    });
  });
  res.status(201).json({message:`Pet ${petId} and subtype created with COMMIT`,petId});
}
  };
};

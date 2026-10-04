module.exports = function createUserController(deps) {
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
    listSupervisorUsers: async(req,res)=>{
  const rows=await select(`SELECT u.USER_ID,u.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME FULL_NAME,u.USERNAME,u.USER_ROLE,u.USER_STATUS
    FROM SYSTEM_USER u JOIN PERSON p ON p.PERSON_ID=u.PERSON_ID WHERE u.USER_ROLE='SUPERVISOR' ORDER BY u.USERNAME`);
  res.json(rows);
},

    createSupervisorUser: async(req,res)=>{
  const body=req.body||{};
  const missing=required(body,['firstName','lastName','email','phone','username','password']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(String(body.password).length<6)return res.status(400).json({error:'Temporary password must contain at least 6 characters'});
  const duplicate=(await select(`SELECT
      (SELECT COUNT(*) FROM PERSON WHERE UPPER(EMAIL)=UPPER(:email)) EMAIL_COUNT,
      (SELECT COUNT(*) FROM SYSTEM_USER WHERE UPPER(USERNAME)=UPPER(:username)) USERNAME_COUNT
    FROM DUAL`,{email:body.email,username:body.username}))[0];
  if(Number(duplicate?.EMAIL_COUNT||0)>0)return res.status(409).json({error:'This email is already used by another person. Use a different email or update the existing person.'});
  if(Number(duplicate?.USERNAME_COUNT||0)>0)return res.status(409).json({error:'This username is already used by another account. Choose a different username.'});
  const passwordHash=await bcrypt.hash(body.password,10);
  let personId;
  let userId;
  await transaction(async connection=>{
    const personResult=await connection.execute(`INSERT INTO PERSON(PERSON_ID,FIRST_NAME,LAST_NAME,DATE_OF_BIRTH,GENDER,EMAIL)
      VALUES(NULL,:firstName,:lastName,TO_DATE(:dateOfBirth,'YYYY-MM-DD'),:gender,:email)
      RETURNING PERSON_ID INTO :personId`,{
      firstName:body.firstName,lastName:body.lastName,dateOfBirth:body.dateOfBirth||null,gender:body.gender||null,email:body.email,
      personId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
    });
    personId=personResult.outBinds.personId[0];
    await connection.execute(`INSERT INTO PERSON_PHONE(PERSON_ID,PHONE) VALUES(:personId,:phone)`,{personId,phone:body.phone});
    if(body.houseNo&&body.street&&body.city)await connection.execute(`INSERT INTO PERSON_ADDRESS(PERSON_ID,HOUSE_NO,STREET,CITY) VALUES(:personId,:houseNo,:street,:city)`,{personId,houseNo:body.houseNo,street:body.street,city:body.city});
    await connection.execute(`INSERT INTO SUPERVISOR(PERSON_ID) VALUES(:personId)`,{personId});
    const userResult=await connection.execute(`INSERT INTO SYSTEM_USER(USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
      VALUES(NULL,:personId,:username,:passwordHash,'SUPERVISOR','ACTIVE')
      RETURNING USER_ID INTO :userId`,{
      personId,username:body.username,passwordHash,
      userId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
    });
    userId=userResult.outBinds.userId[0];
    await connection.execute(`INSERT INTO SYSTEM_USER_ROLE(USER_ID,ROLE_NAME,GRANTED_BY_USER_ID)
      VALUES(:userId,'SUPERVISOR',:grantedBy)`,{userId,grantedBy:req.user.userId});
  });
  res.status(201).json({message:'Supervisor profile and account created',personId,userId});
},

    updateSupervisorUserStatus: async(req,res)=>{
  const status=String(req.body?.status||'').toUpperCase();
  if(!['ACTIVE','INACTIVE'].includes(status))return res.status(400).json({error:'Status must be ACTIVE or INACTIVE'});
  const result=await execute(`UPDATE SYSTEM_USER SET USER_STATUS=:status WHERE USER_ID=:userId AND USER_ROLE='SUPERVISOR'`,{status,userId:req.params.userId});
  if(!result.rowsAffected)return res.status(404).json({error:'User account not found'});
  res.json({message:`Account ${status==='ACTIVE'?'activated':'deactivated'}`});
},

    listAdminEmployees: async(req,res)=>{
  const rows=await select(`SELECT e.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME FULL_NAME,
    e.OCCUPATION,e.POSITION,u.USERNAME,u.USER_STATUS
    FROM EMPLOYEE e
    JOIN PERSON p ON p.PERSON_ID=e.PERSON_ID
    JOIN SYSTEM_USER u ON u.PERSON_ID=e.PERSON_ID
    JOIN SYSTEM_USER_ROLE ur ON ur.USER_ID=u.USER_ID AND ur.ROLE_NAME='EMPLOYEE'
    WHERE u.USER_STATUS='ACTIVE'
    ORDER BY p.FIRST_NAME,p.LAST_NAME`);
  res.json(rows);
},

    layoffEmployee: async(req,res)=>{
  const personId=req.params.personId;
  const activeCases=(await select(`SELECT COUNT(*) CASE_COUNT FROM ADOPTION_PROCESS
    WHERE EMPLOYEE_ID=:personId AND STATUS='APPROVED'`,{personId}))[0]?.CASE_COUNT||0;
  if(Number(activeCases)>0)return res.status(409).json({error:'This employee has an active approved adoption case. Complete or reassign that case before layoff.'});

  let removed=0;
  await transaction(async connection=>{
    const account=await connection.execute(`SELECT USER_ID FROM SYSTEM_USER WHERE PERSON_ID=:personId FOR UPDATE`,
      {personId},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    const userId=account.rows[0]?.USER_ID;
    if(!userId)throw Object.assign(new Error('Employee account not found'),{status:404});
    const result=await connection.execute(`DELETE FROM SYSTEM_USER_ROLE WHERE USER_ID=:userId AND ROLE_NAME='EMPLOYEE'`,{userId});
    removed=result.rowsAffected||0;
    if(!removed)throw Object.assign(new Error('This person is not an active employee'),{status:404});
    await connection.execute(`UPDATE SYSTEM_USER u SET
      USER_ROLE=NVL((SELECT MIN(r.ROLE_NAME) FROM SYSTEM_USER_ROLE r WHERE r.USER_ID=u.USER_ID),u.USER_ROLE),
      USER_STATUS=CASE WHEN (SELECT COUNT(*) FROM SYSTEM_USER_ROLE r WHERE r.USER_ID=u.USER_ID)>0 THEN 'ACTIVE' ELSE 'INACTIVE' END
      WHERE u.USER_ID=:userId`,{userId});
  });
  res.json({message:'Employee laid off. Employee access and future assignment eligibility were removed; historical records were preserved.'});
},

    listRoles: async(req,res)=>res.json(await select(`SELECT r.ROLE_NAME,r.PERSON_ID,r.FULL_NAME,r.DETAILS
  FROM VW_ROLE_DIRECTORY r
  JOIN SYSTEM_USER u ON u.PERSON_ID=r.PERSON_ID AND u.USER_STATUS='ACTIVE'
  JOIN SYSTEM_USER_ROLE ur ON ur.USER_ID=u.USER_ID AND ur.ROLE_NAME=r.ROLE_NAME
  ORDER BY r.ROLE_NAME,r.PERSON_ID`)),

    createRole: async(req,res)=>{
  const body=req.body||{};
  const role=String(body.role||'').toUpperCase();
  const missing=required(body,['personId','username','password']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(String(body.password).length<6)return res.status(400).json({error:'Temporary password must contain at least 6 characters'});
  const statements={
    DOCTOR:{sql:`INSERT INTO DOCTOR(PERSON_ID,SALARY,SPECIALIZATION) VALUES(:personId,:amount,:details)`,binds:{personId:body.personId,amount:body.amount||null,details:body.details||null}},
    VOLUNTEER:{sql:`INSERT INTO VOLUNTEER(PERSON_ID,SKILL) VALUES(:personId,:details)`,binds:{personId:body.personId,details:body.details||null}},
    EMPLOYEE:{sql:`INSERT INTO EMPLOYEE(PERSON_ID,OCCUPATION,HIRE_DATE,POSITION,SALARY) VALUES(:personId,:occupation,TO_DATE(:hireDate,'YYYY-MM-DD'),:position,:salary)`,binds:{personId:body.personId,occupation:body.occupation||null,hireDate:body.hireDate||null,position:body.details||null,salary:body.amount||null}}
  };
  if(!body.personId||!statements[role])return res.status(400).json({error:'Valid role and personId are required'});
  const passwordHash=await bcrypt.hash(body.password,10);
  let userId;
  await transaction(async connection=>{
    await connection.execute(statements[role].sql,statements[role].binds);
    const userResult=await connection.execute(`INSERT INTO SYSTEM_USER(USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
      VALUES(NULL,:personId,:username,:passwordHash,:role,'ACTIVE')
      RETURNING USER_ID INTO :userId`,{
      personId:body.personId,username:body.username,passwordHash,role,
      userId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
    });
    userId=userResult.outBinds.userId[0];
    await connection.execute(`INSERT INTO SYSTEM_USER_ROLE(USER_ID,ROLE_NAME,GRANTED_BY_USER_ID)
      VALUES(:userId,:role,:grantedBy)`,{userId,role,grantedBy:req.user.userId});
  });
  res.status(201).json({message:`${role} role and login account created`,userId});
},

    deleteRole: async(req,res)=>{
  const role=String(req.params.role||'').toUpperCase();
  const tables={DOCTOR:'DOCTOR',EMPLOYEE:'EMPLOYEE',VOLUNTEER:'VOLUNTEER',SUPERVISOR:'SUPERVISOR'};
  if(!tables[role])return res.status(400).json({error:'Only Supervisor, Doctor, Employee and Volunteer roles can be removed here'});
  if(role==='SUPERVISOR'&&req.params.personId===req.user.personId)return res.status(403).json({error:'You cannot remove your own Supervisor role'});

  if(role==='EMPLOYEE'){
    const activeCases=(await select(`SELECT COUNT(*) CASE_COUNT FROM ADOPTION_PROCESS
      WHERE EMPLOYEE_ID=:personId AND STATUS='APPROVED'`,{personId:req.params.personId}))[0]?.CASE_COUNT||0;
    if(Number(activeCases)>0)return res.status(409).json({error:'This employee has an active approved adoption assignment. Complete or reassign that adoption before removing the Employee role.'});
  }
  if(role==='DOCTOR'){
    const activeTraining=(await select(`SELECT COUNT(*) TRAINING_COUNT FROM DOCTOR_TRAINING
      WHERE SENIOR_DOCTOR_ID=:personId OR JUNIOR_DOCTOR_ID=:personId`,{personId:req.params.personId}))[0]?.TRAINING_COUNT||0;
    if(Number(activeTraining)>0)return res.status(409).json({error:'This doctor is assigned to doctor training. Complete or reassign that training before removing the Doctor role.'});
  }
  if(role==='SUPERVISOR'){
    const activeShelters=(await select(`SELECT COUNT(*) SHELTER_COUNT FROM SHELTER_SUPERVISION
      WHERE SUPERVISOR_ID=:personId`,{personId:req.params.personId}))[0]?.SHELTER_COUNT||0;
    if(Number(activeShelters)>0)return res.status(409).json({error:'This supervisor is assigned to a shelter. Reassign that shelter before removing the Supervisor role.'});
  }

  await transaction(async connection=>{
    const account=await connection.execute(`SELECT USER_ID FROM SYSTEM_USER WHERE PERSON_ID=:personId FOR UPDATE`,
      {personId:req.params.personId},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    const userId=account.rows[0]?.USER_ID;
    if(!userId)throw Object.assign(new Error('User account not found for this person'),{status:404});
    const roleResult=await connection.execute(`DELETE FROM SYSTEM_USER_ROLE
      WHERE ROLE_NAME=:role AND USER_ID=:userId`,{userId,role});
    if(!roleResult.rowsAffected)throw Object.assign(new Error(`${role} role not found for this person`),{status:404});

    const subtype=await connection.execute(`SELECT PERSON_ID FROM ${tables[role]} WHERE PERSON_ID=:personId`,
      {personId:req.params.personId},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    if(!subtype.rows.length)throw Object.assign(new Error(`${role} role not found for this person`),{status:404});

    const historyChecks={
      EMPLOYEE:`SELECT COUNT(*) REF_COUNT FROM ADOPTION_PROCESS WHERE EMPLOYEE_ID=:personId`,
      DOCTOR:`SELECT COUNT(*) REF_COUNT FROM DOCTOR_TRAINING WHERE SENIOR_DOCTOR_ID=:personId OR JUNIOR_DOCTOR_ID=:personId`,
      VOLUNTEER:`SELECT COUNT(*) REF_COUNT FROM VOLUNTEER_RESCUE WHERE VOLUNTEER_ID=:personId`,
      SUPERVISOR:`SELECT
        (SELECT COUNT(*) FROM SHELTER_SUPERVISION WHERE SUPERVISOR_ID=:personId)+
        (SELECT COUNT(*) FROM ADOPTION_MANAGEMENT WHERE SUPERVISOR_ID=:personId)+
        (SELECT COUNT(*) FROM SALARY WHERE RECORDED_BY_SUPERVISOR_ID=:personId) REF_COUNT
        FROM DUAL`
    };
    const history=await connection.execute(historyChecks[role],{personId:req.params.personId},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    if(Number(history.rows[0]?.REF_COUNT||0)===0){
      await connection.execute(`DELETE FROM ${tables[role]} WHERE PERSON_ID=:personId`,{personId:req.params.personId});
    }

    await connection.execute(`UPDATE SYSTEM_USER u SET
      USER_ROLE=NVL((SELECT MIN(r.ROLE_NAME) FROM SYSTEM_USER_ROLE r WHERE r.USER_ID=u.USER_ID),u.USER_ROLE),
      USER_STATUS=CASE WHEN (SELECT COUNT(*) FROM SYSTEM_USER_ROLE r WHERE r.USER_ID=u.USER_ID)>0 THEN 'ACTIVE' ELSE 'INACTIVE' END
      WHERE u.USER_ID=:userId`,{userId});
  });
  res.json({message:`${role} role removed. Other roles and historical records were preserved.`});
}
  };
};

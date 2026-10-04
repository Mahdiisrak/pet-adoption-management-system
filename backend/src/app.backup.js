const express=require('express');
const cors=require('cors');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const {oracledb,withConnection,select,execute,transaction}=require('./db');
const {authenticate,authorize}=require('./middleware/auth');
const queryCatalog=require('./queryCatalog');

const app=express();
app.use(cors());
app.use(express.json({limit:'1mb'}));

const safe=handler=>(req,res,next)=>Promise.resolve(handler(req,res,next)).catch(next);
const required=(body,fields)=>fields.filter(field=>body[field]===undefined||body[field]===null||body[field]==='');
const writeRoles=authorize('SUPERVISOR','EMPLOYEE');
const managementRoles=authorize('ADMIN','SUPERVISOR');
const staffRoles=authorize('ADMIN','SUPERVISOR','EMPLOYEE');
const careRoles=authorize('ADMIN','EMPLOYEE','DOCTOR');
const makeId=prefix=>prefix+crypto.randomBytes(8).toString('hex').toUpperCase().slice(0,12-prefix.length);

app.get('/api/health',(req,res)=>res.json({ok:true,service:'pet-adoption-api',port:Number(process.env.PORT||5000)}));
app.get('/api/health/database',safe(async(req,res)=>{
  const rows=await select(`SELECT USER DATABASE_USER,'CONNECTED' DATABASE_STATUS FROM DUAL`);
  res.json({ok:true,...rows[0]});
}));

app.post('/api/auth/login',safe(async(req,res)=>{
  const {username,password}=req.body||{};
  if(!username||!password)return res.status(400).json({error:'Username and password are required'});
  const rows=await select(`SELECT USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS FROM SYSTEM_USER WHERE USERNAME=:username`,{username});
  const userRow=rows[0];
  if(!userRow||userRow.USER_STATUS!=='ACTIVE'||!(await bcrypt.compare(password,userRow.PASSWORD_HASH))){
    return res.status(401).json({error:'Invalid username or password'});
  }
  const user={userId:userRow.USER_ID,personId:userRow.PERSON_ID,username:userRow.USERNAME,role:userRow.USER_ROLE};
  const token=jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'8h'});
  res.json({token,user});
}));

app.post('/api/auth/register',safe(async(req,res)=>{
  const body=req.body||{};
  const missing=required(body,['firstName','lastName','email','phone','username','password','role']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  const role=String(body.role).toUpperCase();
  if(!['ADOPTER','DONOR'].includes(role))return res.status(400).json({error:'Public registration is available only for adopters and donors'});
  if(String(body.password).length<6)return res.status(400).json({error:'Password must contain at least 6 characters'});
  const personId=makeId('P');
  const userId=makeId('U');
  const passwordHash=await bcrypt.hash(body.password,10);
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO PERSON(PERSON_ID,FIRST_NAME,LAST_NAME,DATE_OF_BIRTH,GENDER,EMAIL)
      VALUES(:personId,:firstName,:lastName,TO_DATE(:dateOfBirth,'YYYY-MM-DD'),:gender,:email)`,{
      personId,firstName:body.firstName,lastName:body.lastName,dateOfBirth:body.dateOfBirth||null,gender:body.gender||null,email:body.email
    });
    await connection.execute(`INSERT INTO PERSON_PHONE(PERSON_ID,PHONE) VALUES(:personId,:phone)`,{personId,phone:body.phone});
    if(body.houseNo&&body.street&&body.city)await connection.execute(
      `INSERT INTO PERSON_ADDRESS(PERSON_ID,HOUSE_NO,STREET,CITY) VALUES(:personId,:houseNo,:street,:city)`,
      {personId,houseNo:body.houseNo,street:body.street,city:body.city}
    );
    if(role==='ADOPTER')await connection.execute(`INSERT INTO ADOPTER(PERSON_ID,OCCUPATION) VALUES(:personId,:occupation)`,{personId,occupation:body.occupation||null});
    else await connection.execute(`INSERT INTO DONOR(PERSON_ID,DONATION_AMOUNT,OCCUPATION) VALUES(:personId,0,:occupation)`,{personId,occupation:body.occupation||null});
    await connection.execute(`INSERT INTO SYSTEM_USER(USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
      VALUES(:userId,:personId,:username,:passwordHash,:role,'ACTIVE')`,{userId,personId,username:body.username,passwordHash,role});
  });
  res.status(201).json({message:`${role==='ADOPTER'?'Adopter':'Donor'} account created. You can now sign in.`,personId});
}));

app.use('/api',authenticate);

app.get('/api/dashboard',safe(async(req,res)=>{
  const base=(await select(`SELECT * FROM VW_DASHBOARD_STATS`))[0]||{};
  const extra=(await select(`SELECT
    (SELECT COUNT(*) FROM MEDICAL_RECORD) MEDICAL_RECORD_COUNT,
    (SELECT COUNT(*) FROM MEDICINE) MEDICINE_COUNT,
    (SELECT COUNT(*) FROM VACCINATION) VACCINATION_COUNT,
    (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE ADOPTER_ID=:personId) MY_ADOPTION_COUNT,
    (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE STATUS='PENDING') PENDING_REVIEW_COUNT,
    (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE EMPLOYEE_ID=:personId AND STATUS='APPROVED') MY_ASSIGNED_ADOPTION_COUNT,
    (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE EMPLOYEE_ID=:personId AND STATUS='ADOPTED') MY_ADOPTED_ADOPTION_COUNT,
    (SELECT COUNT(*) FROM VOLUNTEER_RESCUE WHERE VOLUNTEER_ID=:personId) MY_ASSIGNED_RESCUE_COUNT,
    (SELECT COUNT(*) FROM DONATION WHERE DONOR_ID=:personId) MY_DONATION_COUNT,
    (SELECT NVL(SUM(i.AMOUNT),0) FROM DONATION d JOIN INCOME i ON i.SOURCE_ID=d.SOURCE_ID WHERE d.DONOR_ID=:personId) MY_DONATION_TOTAL
    FROM DUAL`,{personId:req.user.personId}))[0]||{};
  res.json({...base,...extra});
}));

app.get('/api/profile',safe(async(req,res)=>{
  const personal=(await select(`SELECT u.USER_ID,u.USERNAME,u.USER_ROLE,u.USER_STATUS,
    p.PERSON_ID,p.FIRST_NAME,p.LAST_NAME,p.FIRST_NAME||' '||p.LAST_NAME FULL_NAME,
    TO_CHAR(p.DATE_OF_BIRTH,'YYYY-MM-DD') DATE_OF_BIRTH,
    TRUNC(MONTHS_BETWEEN(SYSDATE,p.DATE_OF_BIRTH)/12) AGE,p.GENDER,p.EMAIL,
    RTRIM(
      CASE WHEN d.PERSON_ID IS NOT NULL THEN 'DOCTOR,' END||
      CASE WHEN v.PERSON_ID IS NOT NULL THEN 'VOLUNTEER,' END||
      CASE WHEN s.PERSON_ID IS NOT NULL THEN 'SUPERVISOR,' END||
      CASE WHEN e.PERSON_ID IS NOT NULL THEN 'EMPLOYEE,' END||
      CASE WHEN a.PERSON_ID IS NOT NULL THEN 'ADOPTER,' END||
      CASE WHEN o.PERSON_ID IS NOT NULL THEN 'OWNER,' END||
      CASE WHEN dn.PERSON_ID IS NOT NULL THEN 'DONOR,' END,',') PERSON_ROLES
    FROM SYSTEM_USER u JOIN PERSON p ON p.PERSON_ID=u.PERSON_ID
    LEFT JOIN DOCTOR d ON d.PERSON_ID=p.PERSON_ID
    LEFT JOIN VOLUNTEER v ON v.PERSON_ID=p.PERSON_ID
    LEFT JOIN SUPERVISOR s ON s.PERSON_ID=p.PERSON_ID
    LEFT JOIN EMPLOYEE e ON e.PERSON_ID=p.PERSON_ID
    LEFT JOIN ADOPTER a ON a.PERSON_ID=p.PERSON_ID
    LEFT JOIN OWNER o ON o.PERSON_ID=p.PERSON_ID
    LEFT JOIN DONOR dn ON dn.PERSON_ID=p.PERSON_ID
    WHERE u.USER_ID=:userId`,{userId:req.user.userId}))[0];
  if(!personal)return res.status(404).json({error:'Profile not found'});
  const [phones,addresses,emergencyContacts,workRows]=await Promise.all([
    select(`SELECT PHONE FROM PERSON_PHONE WHERE PERSON_ID=:personId ORDER BY PHONE`,{personId:req.user.personId}),
    select(`SELECT HOUSE_NO,STREET,CITY FROM PERSON_ADDRESS WHERE PERSON_ID=:personId ORDER BY CITY,STREET`,{personId:req.user.personId}),
    select(`SELECT E_NAME,RELATION,PHONE FROM EMERGENCY_NO WHERE PERSON_ID=:personId ORDER BY E_NAME`,{personId:req.user.personId}),
    select(`SELECT e.OCCUPATION EMPLOYEE_OCCUPATION,TO_CHAR(e.HIRE_DATE,'YYYY-MM-DD') HIRE_DATE,e.POSITION,e.SALARY EMPLOYEE_SALARY,
      d.SPECIALIZATION,d.SALARY DOCTOR_SALARY,v.SKILL,a.OCCUPATION ADOPTER_OCCUPATION,
      o.OCCUPATION OWNER_OCCUPATION,dn.OCCUPATION DONOR_OCCUPATION,dn.DONATION_AMOUNT
      FROM PERSON p
      LEFT JOIN EMPLOYEE e ON e.PERSON_ID=p.PERSON_ID
      LEFT JOIN DOCTOR d ON d.PERSON_ID=p.PERSON_ID
      LEFT JOIN VOLUNTEER v ON v.PERSON_ID=p.PERSON_ID
      LEFT JOIN ADOPTER a ON a.PERSON_ID=p.PERSON_ID
      LEFT JOIN OWNER o ON o.PERSON_ID=p.PERSON_ID
      LEFT JOIN DONOR dn ON dn.PERSON_ID=p.PERSON_ID
      WHERE p.PERSON_ID=:personId`,{personId:req.user.personId})
  ]);
  res.json({personal,phones,addresses,emergencyContacts,work:workRows[0]||{}});
}));

app.put('/api/auth/change-password',safe(async(req,res)=>{
  const {currentPassword,newPassword}=req.body||{};
  if(!currentPassword||!newPassword)return res.status(400).json({error:'Current password and new password are required'});
  if(String(newPassword).length<6)return res.status(400).json({error:'New password must contain at least 6 characters'});
  const userRow=(await select(`SELECT PASSWORD_HASH FROM SYSTEM_USER WHERE USER_ID=:userId`,{userId:req.user.userId}))[0];
  if(!userRow||!(await bcrypt.compare(currentPassword,userRow.PASSWORD_HASH)))return res.status(400).json({error:'Current password is incorrect'});
  const passwordHash=await bcrypt.hash(newPassword,10);
  await execute(`UPDATE SYSTEM_USER SET PASSWORD_HASH=:passwordHash WHERE USER_ID=:userId`,{passwordHash,userId:req.user.userId});
  res.json({message:'Password changed successfully'});
}));

app.get('/api/users',authorize('ADMIN'),safe(async(req,res)=>{
  const rows=await select(`SELECT u.USER_ID,u.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME FULL_NAME,u.USERNAME,u.USER_ROLE,u.USER_STATUS
    FROM SYSTEM_USER u JOIN PERSON p ON p.PERSON_ID=u.PERSON_ID WHERE u.USER_ROLE='SUPERVISOR' ORDER BY u.USERNAME`);
  res.json(rows);
}));

app.post('/api/users',authorize('ADMIN'),safe(async(req,res)=>{
  const body=req.body||{};
  const missing=required(body,['firstName','lastName','email','phone','username','password']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(String(body.password).length<6)return res.status(400).json({error:'Temporary password must contain at least 6 characters'});
  const personId=makeId('P');
  const userId=makeId('U');
  const passwordHash=await bcrypt.hash(body.password,10);
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO PERSON(PERSON_ID,FIRST_NAME,LAST_NAME,DATE_OF_BIRTH,GENDER,EMAIL)
      VALUES(:personId,:firstName,:lastName,TO_DATE(:dateOfBirth,'YYYY-MM-DD'),:gender,:email)`,{
      personId,firstName:body.firstName,lastName:body.lastName,dateOfBirth:body.dateOfBirth||null,gender:body.gender||null,email:body.email
    });
    await connection.execute(`INSERT INTO PERSON_PHONE(PERSON_ID,PHONE) VALUES(:personId,:phone)`,{personId,phone:body.phone});
    if(body.houseNo&&body.street&&body.city)await connection.execute(`INSERT INTO PERSON_ADDRESS(PERSON_ID,HOUSE_NO,STREET,CITY) VALUES(:personId,:houseNo,:street,:city)`,{personId,houseNo:body.houseNo,street:body.street,city:body.city});
    await connection.execute(`INSERT INTO SUPERVISOR(PERSON_ID) VALUES(:personId)`,{personId});
    await connection.execute(`INSERT INTO SYSTEM_USER(USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
      VALUES(:userId,:personId,:username,:passwordHash,'SUPERVISOR','ACTIVE')`,{userId,personId,username:body.username,passwordHash});
  });
  res.status(201).json({message:'Supervisor profile and account created',personId});
}));

app.put('/api/users/:userId/status',authorize('ADMIN'),safe(async(req,res)=>{
  const status=String(req.body?.status||'').toUpperCase();
  if(!['ACTIVE','INACTIVE'].includes(status))return res.status(400).json({error:'Status must be ACTIVE or INACTIVE'});
  const result=await execute(`UPDATE SYSTEM_USER SET USER_STATUS=:status WHERE USER_ID=:userId AND USER_ROLE='SUPERVISOR'`,{status,userId:req.params.userId});
  if(!result.rowsAffected)return res.status(404).json({error:'User account not found'});
  res.json({message:`Account ${status==='ACTIVE'?'activated':'deactivated'}`});
}));

app.get('/api/people',staffRoles,safe(async(req,res)=>{
  const search=req.query.search?`%${req.query.search}%`:null;
  const rows=await select(`SELECT * FROM VW_PERSON_ROLES WHERE (:search IS NULL OR UPPER(FIRST_NAME||' '||LAST_NAME) LIKE UPPER(:search)) ORDER BY PERSON_ID`,{search});
  res.json(rows);
}));

app.post('/api/people',authorize('SUPERVISOR'),safe(async(req,res)=>{
  const body=req.body||{};
  const missing=required(body,['personId','firstName','lastName']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO PERSON(PERSON_ID,FIRST_NAME,LAST_NAME,DATE_OF_BIRTH,GENDER,EMAIL) VALUES(:personId,:firstName,:lastName,TO_DATE(:dateOfBirth,'YYYY-MM-DD'),:gender,:email)`,{
      personId:body.personId,firstName:body.firstName,lastName:body.lastName,dateOfBirth:body.dateOfBirth||null,gender:body.gender||null,email:body.email||null
    });
    for(const phone of body.phones||[]){
      if(phone)await connection.execute(`INSERT INTO PERSON_PHONE(PERSON_ID,PHONE) VALUES(:personId,:phone)`,{personId:body.personId,phone});
    }
    for(const address of body.addresses||[]){
      if(address.houseNo&&address.street&&address.city){
        await connection.execute(`INSERT INTO PERSON_ADDRESS(PERSON_ID,HOUSE_NO,STREET,CITY) VALUES(:personId,:houseNo,:street,:city)`,{personId:body.personId,...address});
      }
    }
  });
  res.status(201).json({message:'Person created with COMMIT',personId:body.personId});
}));

app.put('/api/people/:personId',writeRoles,safe(async(req,res)=>{
  const body=req.body||{};
  const result=await execute(`UPDATE PERSON SET FIRST_NAME=:firstName,LAST_NAME=:lastName,GENDER=:gender,EMAIL=:email WHERE PERSON_ID=:personId`,{
    personId:req.params.personId,firstName:body.firstName,lastName:body.lastName,gender:body.gender||null,email:body.email||null
  });
  res.json({message:'Person updated',...result});
}));

app.get('/api/emergency',safe(async(req,res)=>{
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
}));

app.post('/api/emergency',safe(async(req,res)=>{
  const body=req.body||{};const missing=required(body,['eName','relation','phone']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  await execute(`INSERT INTO EMERGENCY_NO(PERSON_ID,E_NAME,RELATION,PHONE) VALUES(:personId,:eName,:relation,:phone)`,{
    personId:req.user.personId,eName:body.eName,relation:body.relation,phone:body.phone
  });
  res.status(201).json({message:'Your emergency contact was added'});
}));

app.put('/api/emergency/:currentName',safe(async(req,res)=>{
  const body=req.body||{};const missing=required(body,['eName','relation','phone']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  const result=await execute(`UPDATE EMERGENCY_NO SET E_NAME=:eName,RELATION=:relation,PHONE=:phone
    WHERE PERSON_ID=:personId AND E_NAME=:currentName`,{
    personId:req.user.personId,currentName:req.params.currentName,eName:body.eName,relation:body.relation,phone:body.phone
  });
  if(!result.rowsAffected)return res.status(404).json({error:'You can update only your own emergency contact'});
  res.json({message:'Your emergency contact was updated'});
}));

app.delete('/api/emergency/:eName',safe(async(req,res)=>{
  const result=await execute(`DELETE FROM EMERGENCY_NO WHERE PERSON_ID=:personId AND E_NAME=:eName`,{
    personId:req.user.personId,eName:req.params.eName
  });
  if(!result.rowsAffected)return res.status(404).json({error:'You can remove only your own emergency contact'});
  res.json({message:'Your emergency contact was removed'});
}));

app.get('/api/roles',managementRoles,safe(async(req,res)=>res.json(await select(`SELECT * FROM VW_ROLE_DIRECTORY ORDER BY ROLE_NAME,PERSON_ID`))));
app.post('/api/roles',authorize('SUPERVISOR'),safe(async(req,res)=>{
  const body=req.body||{};
  const role=String(body.role||'').toUpperCase();
  const missing=required(body,['personId','userId','username','password']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(String(body.password).length<6)return res.status(400).json({error:'Temporary password must contain at least 6 characters'});
  const statements={
    DOCTOR:{sql:`INSERT INTO DOCTOR(PERSON_ID,SALARY,SPECIALIZATION) VALUES(:personId,:amount,:details)`,binds:{personId:body.personId,amount:body.amount||null,details:body.details||null}},
    VOLUNTEER:{sql:`INSERT INTO VOLUNTEER(PERSON_ID,SKILL) VALUES(:personId,:details)`,binds:{personId:body.personId,details:body.details||null}},
    EMPLOYEE:{sql:`INSERT INTO EMPLOYEE(PERSON_ID,OCCUPATION,HIRE_DATE,POSITION,SALARY) VALUES(:personId,:occupation,TO_DATE(:hireDate,'YYYY-MM-DD'),:position,:salary)`,binds:{personId:body.personId,occupation:body.occupation||null,hireDate:body.hireDate||null,position:body.details||null,salary:body.amount||null}}
  };
  if(!body.personId||!statements[role])return res.status(400).json({error:'Valid role and personId are required'});
  const passwordHash=await bcrypt.hash(body.password,10);
  await transaction(async connection=>{
    await connection.execute(statements[role].sql,statements[role].binds);
    await connection.execute(`INSERT INTO SYSTEM_USER(USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
      VALUES(:userId,:personId,:username,:passwordHash,:role,'ACTIVE')`,{
      userId:body.userId,personId:body.personId,username:body.username,passwordHash,role
    });
  });
  res.status(201).json({message:`${role} role and login account created`});
}));

app.delete('/api/roles/:role/:personId',authorize('SUPERVISOR'),safe(async(req,res)=>{
  const role=String(req.params.role||'').toUpperCase();
  const tables={DOCTOR:'DOCTOR',EMPLOYEE:'EMPLOYEE',VOLUNTEER:'VOLUNTEER'};
  if(!tables[role])return res.status(400).json({error:'Only Doctor, Employee and Volunteer roles can be removed here'});
  let removed=0;
  await transaction(async connection=>{
    await connection.execute(`UPDATE SYSTEM_USER SET USER_STATUS='INACTIVE' WHERE PERSON_ID=:personId AND USER_ROLE=:role`,{personId:req.params.personId,role});
    const result=await connection.execute(`DELETE FROM ${tables[role]} WHERE PERSON_ID=:personId`,{personId:req.params.personId});
    removed=result.rowsAffected||0;
  });
  if(!removed)return res.status(404).json({error:`${role} role not found for this person`});
  res.json({message:`${role} role removed and its matching login deactivated`});
}));

app.get('/api/shelters',staffRoles,safe(async(req,res)=>res.json(await select(`SELECT * FROM VW_SHELTER_OVERVIEW ORDER BY SHELTER_ID`))));
app.post('/api/shelters',writeRoles,safe(async(req,res)=>{
  const body=req.body||{};if(required(body,['shelterId','roomType']).length)return res.status(400).json({error:'shelterId and roomType are required'});
  await execute(`INSERT INTO SHELTER(SHELTER_ID,ROOM_TYPE) VALUES(:shelterId,:roomType)`,body);
  res.status(201).json({message:'Shelter created'});
}));

app.get('/api/pets',safe(async(req,res)=>res.json(await select(`SELECT * FROM VW_PET_DETAILS ORDER BY PET_ID`))));

app.get('/api/owners',authorize('ADMIN','SUPERVISOR','EMPLOYEE'),safe(async(req,res)=>{
  const search=req.query.search?`%${req.query.search}%`:null;
  const rows=await select(`SELECT o.PERSON_ID OWNER_ID,p.FIRST_NAME||' '||p.LAST_NAME OWNER_NAME,
    o.OCCUPATION,(SELECT MIN(pp.PHONE) FROM PERSON_PHONE pp WHERE pp.PERSON_ID=o.PERSON_ID) PHONE,
    pet.PET_ID,pet.NAME PET_NAME,pet.SPECIES,pet.BREED,
    TO_CHAR(gp.CHECK_IN_DATE,'YYYY-MM-DD') CHECK_IN_DATE,gp.RELEVANT_TIME
    FROM OWNER o JOIN PERSON p ON p.PERSON_ID=o.PERSON_ID
    LEFT JOIN GUEST_PET_OWNER gpo ON gpo.OWNER_ID=o.PERSON_ID
    LEFT JOIN GUEST_PET gp ON gp.PET_ID=gpo.PET_ID
    LEFT JOIN PET pet ON pet.PET_ID=gp.PET_ID
    WHERE :search IS NULL
       OR UPPER(o.PERSON_ID) LIKE UPPER(:search)
       OR UPPER(p.FIRST_NAME||' '||p.LAST_NAME) LIKE UPPER(:search)
       OR EXISTS (SELECT 1 FROM PERSON_PHONE pp WHERE pp.PERSON_ID=o.PERSON_ID AND pp.PHONE LIKE :search)
    ORDER BY p.FIRST_NAME,p.LAST_NAME,pet.NAME`,{search});
  res.json(rows);
}));

app.post('/api/pets',authorize('EMPLOYEE'),safe(async(req,res)=>{
  const body=req.body||{};const missing=required(body,['petId','name','species','petType']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  if(!['LOCAL','GUEST'].includes(body.petType))return res.status(400).json({error:'petType must be LOCAL or GUEST'});
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO PET(PET_ID,NAME,DOB,BREED,SPECIES,WEIGHT) VALUES(:petId,:name,TO_DATE(:dob,'YYYY-MM-DD'),:breed,:species,:weight)`,{
      petId:body.petId,name:body.name,dob:body.dob||null,breed:body.breed||null,species:body.species,weight:body.weight||null
    });
    if(body.petType==='LOCAL'){
      await connection.execute(`INSERT INTO LOCAL_PET(PET_ID,ADOPTION_STATUS,IN_TAKE_DATE) VALUES(:petId,:status,TO_DATE(:dateValue,'YYYY-MM-DD'))`,{petId:body.petId,status:body.adoptionStatus||'AVAILABLE',dateValue:body.intakeDate||new Date().toISOString().slice(0,10)});
    }else{
      await connection.execute(`INSERT INTO GUEST_PET(PET_ID,CHECK_IN_DATE,RELEVANT_TIME) VALUES(:petId,TO_DATE(:dateValue,'YYYY-MM-DD'),:relevantTime)`,{petId:body.petId,dateValue:body.checkInDate||new Date().toISOString().slice(0,10),relevantTime:body.relevantTime||null});
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
      await connection.execute(`INSERT INTO GUEST_PET_OWNER(PET_ID,OWNER_ID) VALUES(:petId,:ownerId)`,{petId:body.petId,ownerId:body.ownerId});
    }
  });
  res.status(201).json({message:'Pet and subtype created with COMMIT'});
}));

app.get('/api/rescues',authorize('ADMIN','SUPERVISOR','EMPLOYEE','VOLUNTEER'),safe(async(req,res)=>{
  const filter=req.user.role==='VOLUNTEER'?'WHERE VOLUNTEER_ID=:personId':'';
  const binds=req.user.role==='VOLUNTEER'?{personId:req.user.personId}:{};
  res.json(await select(`SELECT * FROM VW_RESCUE_DETAILS ${filter} ORDER BY RESCUE_DATE DESC`,binds));
}));
app.post('/api/rescues',writeRoles,safe(async(req,res)=>{
  const body=req.body||{};const missing=required(body,['rescueId','rescueDate','location']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO RESCUE(RESCUE_ID,RESCUE_DATE,LOCATION) VALUES(:rescueId,TO_DATE(:rescueDate,'YYYY-MM-DD'),:location)`,{rescueId:body.rescueId,rescueDate:body.rescueDate,location:body.location});
    if(body.shelterId)await connection.execute(`INSERT INTO RESCUE_SHELTER(RESCUE_ID,SHELTER_ID) VALUES(:rescueId,:shelterId)`,{rescueId:body.rescueId,shelterId:body.shelterId});
    if(body.volunteerId)await connection.execute(`INSERT INTO VOLUNTEER_RESCUE(VOLUNTEER_ID,RESCUE_ID) VALUES(:volunteerId,:rescueId)`,{volunteerId:body.volunteerId,rescueId:body.rescueId});
  });
  res.status(201).json({message:'Rescue transaction committed'});
}));

app.get('/api/adoptions',authorize('ADMIN','SUPERVISOR','EMPLOYEE','ADOPTER'),safe(async(req,res)=>{
  let filter='1=1';
  if(req.user.role==='ADOPTER')filter='ADOPTER_ID=:personId';
  if(req.user.role==='EMPLOYEE')filter='EMPLOYEE_ID=:personId';
  const binds=['ADOPTER','EMPLOYEE'].includes(req.user.role)?{personId:req.user.personId}:{};
  const rows=await select(`SELECT * FROM VW_ADOPTION_APPLICATIONS WHERE ${filter} ORDER BY APPLY_DATE DESC,ADOPTION_ID DESC`,binds);
  res.json(rows);
}));

app.get('/api/adoptions/available-pets',authorize('ADOPTER'),safe(async(req,res)=>{
  const rows=await select(`SELECT p.PET_ID,p.NAME,p.SPECIES,p.BREED
    FROM PET p JOIN LOCAL_PET l ON l.PET_ID=p.PET_ID
    WHERE l.ADOPTION_STATUS='AVAILABLE'
    ORDER BY p.NAME`);
  res.json(rows);
}));

app.get('/api/adoptions/employees',authorize('SUPERVISOR'),safe(async(req,res)=>{
  const rows=await select(`SELECT e.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME FULL_NAME,e.POSITION
    FROM EMPLOYEE e JOIN PERSON p ON p.PERSON_ID=e.PERSON_ID
    JOIN SYSTEM_USER u ON u.PERSON_ID=e.PERSON_ID
    WHERE u.USER_ROLE='EMPLOYEE' AND u.USER_STATUS='ACTIVE'
    ORDER BY p.FIRST_NAME,p.LAST_NAME`);
  res.json(rows);
}));

app.post('/api/adoptions',authorize('ADOPTER'),safe(async(req,res)=>{
  const localPetId=req.body?.localPetId;
  if(!localPetId)return res.status(400).json({error:'Select an available pet'});
  const result=await withConnection(connection=>connection.execute(
    `BEGIN PR_SUBMIT_ADOPTION(:adopterId,:localPetId,:adoptionId); END;`,
    {
      adopterId:req.user.personId,
      localPetId,
      adoptionId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
    }
  ));
  res.status(201).json({message:`Application ${result.outBinds.adoptionId} submitted for supervisor review`,adoptionId:result.outBinds.adoptionId});
}));

app.put('/api/adoptions/:adoptionId/review',authorize('SUPERVISOR'),safe(async(req,res)=>{
  const decision=String(req.body?.decision||'').toUpperCase();
  const employeeId=req.body?.employeeId||null;
  if(!['APPROVED','REJECTED'].includes(decision))return res.status(400).json({error:'Decision must be APPROVED or REJECTED'});
  if(decision==='APPROVED'&&!employeeId)return res.status(400).json({error:'Select an employee before approving'});
  await withConnection(connection=>connection.execute(
    `BEGIN PR_REVIEW_ADOPTION(:adoptionId,:supervisorId,:decision,:employeeId); END;`,
    {adoptionId:req.params.adoptionId,supervisorId:req.user.personId,decision,employeeId}
  ));
  res.json({message:decision==='APPROVED'?'Application approved and employee assigned':'Application rejected'});
}));

app.put('/api/adoptions/:adoptionId/adopt',authorize('EMPLOYEE'),safe(async(req,res)=>{
  await withConnection(connection=>connection.execute(
    `BEGIN PR_MARK_ADOPTED(:adoptionId,:employeeId); END;`,
    {adoptionId:req.params.adoptionId,employeeId:req.user.personId}
  ));
  res.json({message:'The adoption is finalized and the pet is now marked as adopted'});
}));

app.get('/api/medical',careRoles,safe(async(req,res)=>res.json(await select(`SELECT * FROM VW_MEDICAL_DETAILS ORDER BY RECORD_ID`))));
app.post('/api/medical',authorize('EMPLOYEE','DOCTOR'),safe(async(req,res)=>{
  const body=req.body||{};const missing=required(body,['recordId','petId','healthStatus']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO MEDICAL_RECORD(RECORD_ID,PET_ID,DIAGNOSIS,TREATMENT,HEALTH_STATUS) VALUES(:recordId,:petId,:diagnosis,:treatment,:healthStatus)`,{
      recordId:body.recordId,petId:body.petId,diagnosis:body.diagnosis||null,treatment:body.treatment||null,healthStatus:body.healthStatus
    });
    if(body.medicineId)await connection.execute(`INSERT INTO MEDICAL_RECORD_MEDICINE(RECORD_ID,MEDICINE_ID) VALUES(:recordId,:medicineId)`,body);
    if(body.vaccineId)await connection.execute(`INSERT INTO MEDICAL_RECORD_VACCINATION(RECORD_ID,VACCINE_ID) VALUES(:recordId,:vaccineId)`,body);
  });
  res.status(201).json({message:'Medical record transaction committed'});
}));

app.get('/api/medicines',careRoles,safe(async(req,res)=>res.json(await select(`SELECT * FROM MEDICINE ORDER BY MEDICINE_ID`))));
app.post('/api/medicines',authorize('EMPLOYEE','DOCTOR'),safe(async(req,res)=>{
  const body=req.body||{};if(required(body,['medicineId','dosage','price']).length)return res.status(400).json({error:'medicineId, dosage and price are required'});
  await execute(`INSERT INTO MEDICINE(MEDICINE_ID,DOSAGE,PRICE) VALUES(:medicineId,:dosage,:price)`,body);
  res.status(201).json({message:'Medicine created'});
}));

app.get('/api/vaccinations',careRoles,safe(async(req,res)=>res.json(await select(`SELECT * FROM VACCINATION ORDER BY VACCINE_ID`))));
app.post('/api/vaccinations',authorize('EMPLOYEE','DOCTOR'),safe(async(req,res)=>{
  const body=req.body||{};const missing=required(body,['vaccineId','vaccineName','vDate','numOfDose','price']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  await execute(`INSERT INTO VACCINATION(VACCINE_ID,VACCINE_NAME,V_DATE,NUM_OF_DOSE,NEXT_DOSE,PRICE) VALUES(:vaccineId,:vaccineName,TO_DATE(:vDate,'YYYY-MM-DD'),:numOfDose,TO_DATE(:nextDose,'YYYY-MM-DD'),:price)`,{...body,nextDose:body.nextDose||null});
  res.status(201).json({message:'Vaccination created'});
}));

app.get('/api/finance',managementRoles,safe(async(req,res)=>{
  const [summary,income,expenses]=await Promise.all([
    select(`SELECT * FROM VW_FINANCE_SUMMARY ORDER BY FINANCE_ID`),
    select(`SELECT * FROM INCOME ORDER BY SOURCE_ID`),
    select(`SELECT * FROM EXPENSES ORDER BY SOURCE_ID`)
  ]);
  res.json({summary,income,expenses});
}));

app.get('/api/donations',authorize('ADMIN','SUPERVISOR','DONOR'),safe(async(req,res)=>{
  const filter=req.user.role==='DONOR'?'WHERE d.DONOR_ID=:personId':'';
  const binds=req.user.role==='DONOR'?{personId:req.user.personId}:{};
  const rows=await select(`SELECT d.DONOR_ID,p.FIRST_NAME||' '||p.LAST_NAME DONOR_NAME,
    i.SOURCE_ID,TO_CHAR(SYSDATE,'YYYY-MM-DD') RECORDED_DATE,i.SOURCE_NAME,i.AMOUNT
    FROM DONATION d JOIN PERSON p ON p.PERSON_ID=d.DONOR_ID JOIN INCOME i ON i.SOURCE_ID=d.SOURCE_ID
    ${filter} ORDER BY i.SOURCE_ID DESC`,binds);
  res.json(rows);
}));

app.post('/api/donations',authorize('DONOR'),safe(async(req,res)=>{
  const amount=Number(req.body?.amount);
  if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({error:'Enter a donation amount greater than zero'});
  const financeId=(await select(`SELECT MIN(FINANCE_ID) FINANCE_ID FROM FINANCE`))[0]?.FINANCE_ID;
  if(!financeId)return res.status(400).json({error:'No finance account is configured'});
  const sourceId=makeId('I');
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO INCOME(SOURCE_ID,SOURCE_NAME,AMOUNT) VALUES(:sourceId,:sourceName,:amount)`,{
      sourceId,sourceName:`Donation by ${req.user.username}`,amount
    });
    await connection.execute(`INSERT INTO FINANCE_INCOME(FINANCE_ID,SOURCE_ID) VALUES(:financeId,:sourceId)`,{financeId,sourceId});
    await connection.execute(`INSERT INTO DONATION(DONOR_ID,SOURCE_ID) VALUES(:donorId,:sourceId)`,{donorId:req.user.personId,sourceId});
    await connection.execute(`UPDATE DONOR SET DONATION_AMOUNT=NVL(DONATION_AMOUNT,0)+:amount WHERE PERSON_ID=:donorId`,{amount,donorId:req.user.personId});
  });
  res.status(201).json({message:'Donation recorded successfully',sourceId});
}));
app.post('/api/income',writeRoles,safe(async(req,res)=>{
  const body=req.body||{};if(required(body,['sourceId','sourceName','amount','financeId']).length)return res.status(400).json({error:'sourceId, sourceName, amount and financeId are required'});
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO INCOME(SOURCE_ID,SOURCE_NAME,AMOUNT) VALUES(:sourceId,:sourceName,:amount)`,{sourceId:body.sourceId,sourceName:body.sourceName,amount:body.amount});
    await connection.execute(`INSERT INTO FINANCE_INCOME(FINANCE_ID,SOURCE_ID) VALUES(:financeId,:sourceId)`,{financeId:body.financeId,sourceId:body.sourceId});
  });
  res.status(201).json({message:'Income transaction committed'});
}));
app.post('/api/expenses',writeRoles,safe(async(req,res)=>{
  const body=req.body||{};if(required(body,['sourceId','sourceName','amount','financeId']).length)return res.status(400).json({error:'sourceId, sourceName, amount and financeId are required'});
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO EXPENSES(SOURCE_ID,SOURCE_NAME,AMOUNT) VALUES(:sourceId,:sourceName,:amount)`,{sourceId:body.sourceId,sourceName:body.sourceName,amount:body.amount});
    await connection.execute(`INSERT INTO FINANCE_EXPENSE(FINANCE_ID,SOURCE_ID) VALUES(:financeId,:sourceId)`,{financeId:body.financeId,sourceId:body.sourceId});
  });
  res.status(201).json({message:'Expense transaction committed'});
}));

app.get('/api/salaries',managementRoles,safe(async(req,res)=>res.json(await select(`SELECT * FROM VW_SALARY_DETAILS ORDER BY PAYMENT_DATE DESC,SALARY_ID DESC`))));

app.get('/api/salaries/payees',authorize('SUPERVISOR'),safe(async(req,res)=>{
  const rows=await select(`SELECT PAYEE_ROLE,PERSON_ID,FULL_NAME
    FROM (
      SELECT 'SUPERVISOR' AS PAYEE_ROLE,s.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME AS FULL_NAME
      FROM SUPERVISOR s JOIN PERSON p ON p.PERSON_ID=s.PERSON_ID
      UNION ALL
      SELECT 'EMPLOYEE' AS PAYEE_ROLE,e.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME AS FULL_NAME
      FROM EMPLOYEE e JOIN PERSON p ON p.PERSON_ID=e.PERSON_ID
      UNION ALL
      SELECT 'DOCTOR' AS PAYEE_ROLE,d.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME AS FULL_NAME
      FROM DOCTOR d JOIN PERSON p ON p.PERSON_ID=d.PERSON_ID
    )
    ORDER BY PAYEE_ROLE,FULL_NAME`);
  res.json(rows);
}));

app.post('/api/salaries',authorize('SUPERVISOR'),safe(async(req,res)=>{
  const body=req.body||{};const missing=required(body,['payeeId','payeeRole','salaryMonth','paymentDate','salaryAmount']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  const payeeRole=String(body.payeeRole).toUpperCase();
  const roleTables={SUPERVISOR:'SUPERVISOR',EMPLOYEE:'EMPLOYEE',DOCTOR:'DOCTOR'};
  if(!roleTables[payeeRole])return res.status(400).json({error:'Payee role must be Supervisor, Employee or Doctor'});
  const roleMatch=(await select(`SELECT COUNT(*) ROLE_COUNT FROM ${roleTables[payeeRole]} WHERE PERSON_ID=:payeeId`,{payeeId:body.payeeId}))[0];
  if(!roleMatch?.ROLE_COUNT)return res.status(400).json({error:'Selected person does not have the chosen payroll role'});
  const amount=Number(body.salaryAmount);
  if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({error:'Salary amount must be greater than zero'});
  const financeId=(await select(`SELECT MIN(FINANCE_ID) FINANCE_ID FROM FINANCE`))[0]?.FINANCE_ID;
  if(!financeId)return res.status(400).json({error:'No finance account is configured'});
  const salaryId=makeId('SL');
  const expenseSourceId=makeId('EX');
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO EXPENSES(SOURCE_ID,SOURCE_NAME,AMOUNT) VALUES(:sourceId,:sourceName,:amount)`,{
      sourceId:expenseSourceId,sourceName:`${body.salaryMonth} ${payeeRole} Salary`,amount
    });
    await connection.execute(`INSERT INTO FINANCE_EXPENSE(FINANCE_ID,SOURCE_ID) VALUES(:financeId,:sourceId)`,{financeId,sourceId:expenseSourceId});
    await connection.execute(`INSERT INTO SALARY(SALARY_ID,RECORDED_BY_SUPERVISOR_ID,PAYEE_ID,PAYEE_ROLE,EXPENSE_SOURCE_ID,SALARY_MONTH,PAYMENT_DATE,SALARY_AMOUNT)
      VALUES(:salaryId,:recordedBy,:payeeId,:payeeRole,:expenseSourceId,:salaryMonth,TO_DATE(:paymentDate,'YYYY-MM-DD'),:salaryAmount)`,{
      salaryId,recordedBy:req.user.personId,payeeId:body.payeeId,payeeRole,expenseSourceId,
      salaryMonth:body.salaryMonth,paymentDate:body.paymentDate,salaryAmount:amount
    });
  });
  res.status(201).json({message:`Salary payment recorded for ${body.payeeId}`,salaryId});
}));

app.get('/api/query-lab',managementRoles,safe(async(req,res)=>res.json(queryCatalog.map(({sql,...item})=>item))));
app.get('/api/query-lab/:key',managementRoles,safe(async(req,res)=>{
  const item=queryCatalog.find(query=>query.key===req.params.key);
  if(!item)return res.status(404).json({error:'Query demonstration not found'});
  const rows=await select(item.sql);
  const {sql,...report}=item;
  res.json({...report,rows});
}));

app.get('/api/plsql/function/:personId',authorize('ADMIN','SUPERVISOR','DOCTOR'),safe(async(req,res)=>{
  const rows=await select(`SELECT FN_PERSON_AGE(:personId) PERSON_AGE,FN_AVAILABLE_PET_COUNT AVAILABLE_PETS FROM DUAL`,{personId:req.params.personId});
  res.json({title:'Stored Function',description:'Calls FN_PERSON_AGE and FN_AVAILABLE_PET_COUNT.',rows});
}));
app.get('/api/plsql/cursor',authorize('ADMIN','SUPERVISOR','DOCTOR'),safe(async(req,res)=>{
  const result=await withConnection(connection=>connection.execute(
    `BEGIN PR_CURSOR_PET_SUMMARY(:total,:available); END;`,
    {total:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER},available:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}}
  ));
  res.json({title:'Explicit Cursor',description:'PR_CURSOR_PET_SUMMARY opens, fetches and closes an explicit cursor.',result:result.outBinds});
}));
app.get('/api/plsql/exception/:personId',authorize('ADMIN','SUPERVISOR','DOCTOR'),safe(async(req,res)=>{
  const result=await withConnection(connection=>connection.execute(
    `BEGIN PR_FIND_PERSON(:personId,:fullName,:message); END;`,
    {personId:req.params.personId,fullName:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:120},message:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:200}}
  ));
  res.json({title:'Exception Handling',description:'PR_FIND_PERSON handles NO_DATA_FOUND and other exceptions.',result:result.outBinds});
}));

app.use((req,res)=>res.status(404).json({error:'API endpoint not found'}));
app.use((error,req,res,next)=>{
  console.error(error);
  const message=String(error?.message||'');
  if(error?.status)return res.status(error.status).json({error:message});
  if(message.includes('Oracle environment is not configured'))return res.status(503).json({error:'Backend is running, but backend/.env does not contain DB_USER, DB_PASSWORD and DB_CONNECT_STRING.'});
  if(message.includes('ORA-01017'))return res.status(503).json({error:'Oracle username or password is incorrect.'});
  if(message.includes('NJS-')||message.includes('ORA-125')||message.includes('ORA-121'))return res.status(503).json({error:'Oracle database is unavailable. Start Oracle and confirm localhost:1521/XEPDB1.'});
  if(message.includes('ORA-00001'))return res.status(409).json({error:'A row with the same primary or unique key already exists.'});
  if(message.includes('ORA-02291'))return res.status(400).json({error:'A required parent record does not exist.'});
  if(message.includes('ORA-02292'))return res.status(409).json({error:'This staff role is used by existing records and cannot be removed. Keep historical records or remove their links first.'});
  if(message.includes('ORA-02290'))return res.status(400).json({error:'A CHECK constraint rejected the supplied value.'});
  const businessError=message.match(/ORA-20\d{3}:\s*([^\n]+)/);
  if(businessError)return res.status(400).json({error:businessError[1].trim()});
  if(message.includes('ORA-00942')||message.includes('ORA-04063'))return res.status(503).json({error:'Database objects are missing or invalid. Run database/run_all.sql with F5.'});
  res.status(500).json({error:'Request could not be completed. Check the backend terminal for the exact Oracle error.'});
});

module.exports=app;

module.exports = function createAuthController(deps) {
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
    login: async(req,res)=>{
  const {username,password}=req.body||{};
  if(!username||!password)return res.status(400).json({error:'Username and password are required'});
  const rows=await select(`SELECT USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS FROM SYSTEM_USER WHERE USERNAME=:username`,{username});
  const userRow=rows[0];
  if(!userRow||userRow.USER_STATUS!=='ACTIVE'||!(await bcrypt.compare(password,userRow.PASSWORD_HASH))){
    return res.status(401).json({error:'Invalid username or password'});
  }
  const roleRows=await select(`SELECT ROLE_NAME FROM SYSTEM_USER_ROLE WHERE USER_ID=:userId ORDER BY ROLE_NAME`,{userId:userRow.USER_ID});
  const roles=roleRows.map(row=>row.ROLE_NAME);
  const role=roles.includes(userRow.USER_ROLE)?userRow.USER_ROLE:roles[0];
  if(!role)return res.status(403).json({error:'This account has no approved active role'});
  const user={userId:userRow.USER_ID,personId:userRow.PERSON_ID,username:userRow.USERNAME,role,roles};
  const token=jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'8h'});
  res.json({token,user});
},

    switchRole: async(req,res)=>{
  const role=String(req.body?.role||'').toUpperCase();
  const roleRows=await select(`SELECT ROLE_NAME FROM SYSTEM_USER_ROLE WHERE USER_ID=:userId ORDER BY ROLE_NAME`,{userId:req.user.userId});
  const roles=roleRows.map(row=>row.ROLE_NAME);
  if(!roles.includes(role))return res.status(403).json({error:'That role has not been approved for your account'});
  const user={userId:req.user.userId,personId:req.user.personId,username:req.user.username,role,roles};
  const token=jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'8h'});
  res.json({token,user});
},

    register: async(req,res)=>{
  const body=req.body||{};
  const missing=required(body,['firstName','lastName','email','phone','username','password','role']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  const role=String(body.role).toUpperCase();
  if(!['ADOPTER','DONOR'].includes(role))return res.status(400).json({error:'Public registration is available only for adopters and donors'});
  if(String(body.password).length<6)return res.status(400).json({error:'Password must contain at least 6 characters'});
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
    if(body.houseNo&&body.street&&body.city)await connection.execute(
      `INSERT INTO PERSON_ADDRESS(PERSON_ID,HOUSE_NO,STREET,CITY) VALUES(:personId,:houseNo,:street,:city)`,
      {personId,houseNo:body.houseNo,street:body.street,city:body.city}
    );
    if(role==='ADOPTER')await connection.execute(`INSERT INTO ADOPTER(PERSON_ID,OCCUPATION) VALUES(:personId,:occupation)`,{personId,occupation:body.occupation||null});
    else await connection.execute(`INSERT INTO DONOR(PERSON_ID,DONATION_AMOUNT,OCCUPATION) VALUES(:personId,0,:occupation)`,{personId,occupation:body.occupation||null});
    const userResult=await connection.execute(`INSERT INTO SYSTEM_USER(USER_ID,PERSON_ID,USERNAME,PASSWORD_HASH,USER_ROLE,USER_STATUS)
      VALUES(NULL,:personId,:username,:passwordHash,:role,'ACTIVE')
      RETURNING USER_ID INTO :userId`,{
      personId,username:body.username,passwordHash,role,
      userId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
    });
    userId=userResult.outBinds.userId[0];
    await connection.execute(`INSERT INTO SYSTEM_USER_ROLE(USER_ID,ROLE_NAME) VALUES(:userId,:role)`,{userId,role});
  });
  res.status(201).json({message:`${role==='ADOPTER'?'Adopter':'Donor'} account created. You can now sign in.`,personId,userId});
}
  };
};

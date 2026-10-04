module.exports = function createPersonController(deps) {
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
    getProfile: async(req,res)=>{
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
},

    changePassword: async(req,res)=>{
  const {currentPassword,newPassword}=req.body||{};
  if(!currentPassword||!newPassword)return res.status(400).json({error:'Current password and new password are required'});
  if(String(newPassword).length<6)return res.status(400).json({error:'New password must contain at least 6 characters'});
  const userRow=(await select(`SELECT PASSWORD_HASH FROM SYSTEM_USER WHERE USER_ID=:userId`,{userId:req.user.userId}))[0];
  if(!userRow||!(await bcrypt.compare(currentPassword,userRow.PASSWORD_HASH)))return res.status(400).json({error:'Current password is incorrect'});
  const passwordHash=await bcrypt.hash(newPassword,10);
  await execute(`UPDATE SYSTEM_USER SET PASSWORD_HASH=:passwordHash WHERE USER_ID=:userId`,{passwordHash,userId:req.user.userId});
  res.json({message:'Password changed successfully'});
}
  };
};

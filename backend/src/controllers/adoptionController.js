module.exports = function createAdoptionController(deps) {
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
    listAdoptions: async(req,res)=>{
  let filter='1=1';
  if(req.user.role==='ADOPTER')filter='ADOPTER_ID=:personId';
  if(req.user.role==='EMPLOYEE')filter='EMPLOYEE_ID=:personId';
  const binds=['ADOPTER','EMPLOYEE'].includes(req.user.role)?{personId:req.user.personId}:{};
  const rows=await select(`SELECT * FROM VW_ADOPTION_APPLICATIONS WHERE ${filter} ORDER BY APPLY_DATE DESC,ADOPTION_ID DESC`,binds);
  res.json(rows);
},

    listAvailablePets: async(req,res)=>{
  const rows=await select(`SELECT p.PET_ID,p.NAME,p.SPECIES,p.BREED
    FROM PET p JOIN LOCAL_PET l ON l.PET_ID=p.PET_ID
    WHERE l.ADOPTION_STATUS='AVAILABLE'
    ORDER BY p.NAME`);
  res.json(rows);
},

    listAssignableEmployees: async(req,res)=>{
  const rows=await select(`SELECT e.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME FULL_NAME,e.POSITION
    FROM EMPLOYEE e JOIN PERSON p ON p.PERSON_ID=e.PERSON_ID
    JOIN SYSTEM_USER u ON u.PERSON_ID=e.PERSON_ID
    WHERE u.USER_STATUS='ACTIVE'
      AND EXISTS (
        SELECT 1 FROM SYSTEM_USER_ROLE ur
        WHERE ur.USER_ID=u.USER_ID AND ur.ROLE_NAME='EMPLOYEE'
      )
    ORDER BY p.FIRST_NAME,p.LAST_NAME`);
  res.json(rows);
},

    submitAdoption: async(req,res)=>{
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
},

    reviewAdoption: async(req,res)=>{
  const decision=String(req.body?.decision||'').toUpperCase();
  const employeeId=req.body?.employeeId||null;
  if(!['APPROVED','REJECTED'].includes(decision))return res.status(400).json({error:'Decision must be APPROVED or REJECTED'});
  if(decision==='APPROVED'&&!employeeId)return res.status(400).json({error:'Select an employee before approving'});
  await withConnection(connection=>connection.execute(
    `BEGIN
       PETCARE_AUDIT_CONTEXT.SET_ACTOR(:supervisorId);
       BEGIN
         PR_REVIEW_ADOPTION(:adoptionId,:supervisorId,:decision,:employeeId);
       EXCEPTION WHEN OTHERS THEN
         PETCARE_AUDIT_CONTEXT.CLEAR_ACTOR;
         RAISE;
       END;
       PETCARE_AUDIT_CONTEXT.CLEAR_ACTOR;
     END;`,
    {adoptionId:req.params.adoptionId,supervisorId:req.user.personId,decision,employeeId}
  ));
  res.json({message:decision==='APPROVED'?'Application approved and employee assigned':'Application rejected'});
},

    finalizeAdoption: async(req,res)=>{
  await withConnection(connection=>connection.execute(
    `BEGIN
       PETCARE_AUDIT_CONTEXT.SET_ACTOR(:employeeId);
       BEGIN
         PR_MARK_ADOPTED(:adoptionId,:employeeId);
       EXCEPTION WHEN OTHERS THEN
         PETCARE_AUDIT_CONTEXT.CLEAR_ACTOR;
         RAISE;
       END;
       PETCARE_AUDIT_CONTEXT.CLEAR_ACTOR;
     END;`,
    {adoptionId:req.params.adoptionId,employeeId:req.user.personId}
  ));
  res.json({message:'The adoption is finalized and the pet is now marked as adopted'});
}
  };
};

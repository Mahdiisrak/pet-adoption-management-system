const approverFor={
  SUPERVISOR:'ADMIN',
  DOCTOR:'SUPERVISOR',EMPLOYEE:'SUPERVISOR',VOLUNTEER:'SUPERVISOR',
  ADOPTER:'SUPERVISOR',DONOR:'SUPERVISOR'
};

module.exports = function createRoleApplicationController(deps) {
  const {makeId,select,transaction,oracledb}=deps;

  return {
    listRoleApplications: async(req,res)=>{
    const mine=await select(`SELECT ra.ROLE_APPLICATION_ID,ra.REQUESTED_ROLE,ra.DETAILS,ra.OCCUPATION,
      TO_CHAR(ra.HIRE_DATE,'YYYY-MM-DD') HIRE_DATE,ra.SALARY,ra.STATUS,
      TO_CHAR(ra.REQUESTED_AT,'YYYY-MM-DD') REQUESTED_AT,ra.REVIEWER_ROLE,
      TO_CHAR(ra.REVIEWED_AT,'YYYY-MM-DD') REVIEWED_AT,ra.REVIEW_NOTE
      FROM ROLE_APPLICATION ra WHERE ra.APPLICANT_USER_ID=:userId
      ORDER BY ra.REQUESTED_AT DESC`,{userId:req.user.userId});
    const reviewQueue=await select(`SELECT ra.ROLE_APPLICATION_ID,ra.REQUESTED_ROLE,ra.DETAILS,ra.OCCUPATION,
      TO_CHAR(ra.HIRE_DATE,'YYYY-MM-DD') HIRE_DATE,ra.SALARY,ra.STATUS,
      TO_CHAR(ra.REQUESTED_AT,'YYYY-MM-DD') REQUESTED_AT,
      u.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME APPLICANT_NAME,u.USERNAME
      FROM ROLE_APPLICATION ra
      JOIN SYSTEM_USER u ON u.USER_ID=ra.APPLICANT_USER_ID
      JOIN PERSON p ON p.PERSON_ID=u.PERSON_ID
      WHERE ra.STATUS='PENDING' AND (
        (:reviewerRole='ADMIN' AND ra.REQUESTED_ROLE='SUPERVISOR') OR
        (:reviewerRole='SUPERVISOR' AND ra.REQUESTED_ROLE IN ('DOCTOR','EMPLOYEE','VOLUNTEER','ADOPTER','DONOR'))
      ) ORDER BY ra.REQUESTED_AT`,{reviewerRole:req.user.role});
    const activeRoles=await select(`SELECT ROLE_NAME FROM SYSTEM_USER_ROLE WHERE USER_ID=:userId ORDER BY ROLE_NAME`,{userId:req.user.userId});
    res.json({mine,reviewQueue,activeRoles:activeRoles.map(row=>row.ROLE_NAME)});
  },

    createRoleApplication: async(req,res)=>{
    const body=req.body||{};
    const requestedRole=String(body.requestedRole||'').toUpperCase();
    if(!approverFor[requestedRole])return res.status(400).json({error:'Select a valid role'});
    const existing=(await select(`SELECT COUNT(*) ROLE_COUNT FROM SYSTEM_USER_ROLE
      WHERE USER_ID=:userId AND ROLE_NAME=:requestedRole`,{userId:req.user.userId,requestedRole}))[0];
    if(existing?.ROLE_COUNT)return res.status(409).json({error:'This role is already active on your account'});
    const pending=(await select(`SELECT COUNT(*) REQUEST_COUNT FROM ROLE_APPLICATION
      WHERE APPLICANT_USER_ID=:userId AND REQUESTED_ROLE=:requestedRole AND STATUS='PENDING'`,{userId:req.user.userId,requestedRole}))[0];
    if(pending?.REQUEST_COUNT)return res.status(409).json({error:'An application for this role is already pending'});
    const applicationId=makeId('RA');
    await transaction(connection=>connection.execute(`INSERT INTO ROLE_APPLICATION(
      ROLE_APPLICATION_ID,APPLICANT_USER_ID,REQUESTED_ROLE,DETAILS,OCCUPATION,HIRE_DATE,SALARY)
      VALUES(:applicationId,:userId,:requestedRole,:details,:occupation,TO_DATE(:hireDate,'YYYY-MM-DD'),:salary)`,{
      applicationId,userId:req.user.userId,requestedRole,details:body.details||null,
      occupation:body.occupation||null,hireDate:body.hireDate||null,salary:body.salary||null
    }));
    res.status(201).json({message:`${requestedRole} role application submitted for ${approverFor[requestedRole]} review`,applicationId});
  },

    reviewRoleApplication: async(req,res)=>{
    const decision=String(req.body?.decision||'').toUpperCase();
    if(!['APPROVED','REJECTED'].includes(decision))return res.status(400).json({error:'Decision must be APPROVED or REJECTED'});
    await transaction(async connection=>{
      const result=await connection.execute(`SELECT ra.*,u.PERSON_ID FROM ROLE_APPLICATION ra
        JOIN SYSTEM_USER u ON u.USER_ID=ra.APPLICANT_USER_ID
        WHERE ra.ROLE_APPLICATION_ID=:applicationId FOR UPDATE`,{applicationId:req.params.applicationId},{outFormat:oracledb.OUT_FORMAT_OBJECT});
      const application=result.rows[0];
      if(!application)throw Object.assign(new Error('Role application not found'),{status:404});
      if(application.STATUS!=='PENDING')throw Object.assign(new Error('This application has already been reviewed'),{status:409});
      if(approverFor[application.REQUESTED_ROLE]!==req.user.role)throw Object.assign(new Error(`${approverFor[application.REQUESTED_ROLE]} approval is required for this role`),{status:403});
      if(application.APPLICANT_USER_ID===req.user.userId)throw Object.assign(new Error('You cannot approve or reject your own role application'),{status:403});
      if(decision==='APPROVED'){
        const common={personId:application.PERSON_ID,details:application.DETAILS,occupation:application.OCCUPATION,salary:application.SALARY,hireDate:application.HIRE_DATE};
        const inserts={
          SUPERVISOR:[`INSERT INTO SUPERVISOR(PERSON_ID) SELECT :personId FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM SUPERVISOR WHERE PERSON_ID=:personId)`,{personId:common.personId}],
          DOCTOR:[`INSERT INTO DOCTOR(PERSON_ID,SALARY,SPECIALIZATION) SELECT :personId,:salary,:details FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DOCTOR WHERE PERSON_ID=:personId)`,{personId:common.personId,salary:common.salary,details:common.details}],
          EMPLOYEE:[`INSERT INTO EMPLOYEE(PERSON_ID,OCCUPATION,HIRE_DATE,POSITION,SALARY) SELECT :personId,:occupation,:hireDate,:details,:salary FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMPLOYEE WHERE PERSON_ID=:personId)`,common],
          VOLUNTEER:[`INSERT INTO VOLUNTEER(PERSON_ID,SKILL) SELECT :personId,:details FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM VOLUNTEER WHERE PERSON_ID=:personId)`,{personId:common.personId,details:common.details}],
          ADOPTER:[`INSERT INTO ADOPTER(PERSON_ID,OCCUPATION) SELECT :personId,:occupation FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM ADOPTER WHERE PERSON_ID=:personId)`,{personId:common.personId,occupation:common.occupation}],
          DONOR:[`INSERT INTO DONOR(PERSON_ID,DONATION_AMOUNT,OCCUPATION) SELECT :personId,0,:occupation FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DONOR WHERE PERSON_ID=:personId)`,{personId:common.personId,occupation:common.occupation}]
        };
        const [sql,binds]=inserts[application.REQUESTED_ROLE];
        await connection.execute(sql,binds);
        await connection.execute(`INSERT INTO SYSTEM_USER_ROLE(USER_ID,ROLE_NAME,GRANTED_BY_USER_ID)
          VALUES(:userId,:role,:grantedBy)`,{userId:application.APPLICANT_USER_ID,role:application.REQUESTED_ROLE,grantedBy:req.user.userId});
      }
      await connection.execute(`UPDATE ROLE_APPLICATION SET STATUS=:decision,REVIEWED_BY_USER_ID=:reviewedBy,
        REVIEWER_ROLE=:reviewerRole,REVIEWED_AT=SYSDATE,REVIEW_NOTE=:reviewNote
        WHERE ROLE_APPLICATION_ID=:applicationId`,{
        decision,reviewedBy:req.user.userId,reviewerRole:req.user.role,
        reviewNote:req.body?.reviewNote||null,applicationId:req.params.applicationId
      });
    });
    res.json({message:`Role application ${decision.toLowerCase()}`});
  }
  };
};

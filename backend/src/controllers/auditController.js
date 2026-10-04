module.exports = function createAuditController(deps) {
  const {select} = deps;

  return {
    listActivityLog: async(req,res)=>{
    const search=String(req.query.search||'').trim();
    const rows=await select(`SELECT 'AU'||LPAD(al.AUDIT_ID,3,'0') AUDIT_ID,
      ap.ADOPTION_ID APPLICATION_ID,
      adopter.FIRST_NAME||' '||adopter.LAST_NAME APPLICANT_NAME,
      pet.NAME PET_NAME,
      pet.PET_ID,
      CASE al.NEW_VALUE
        WHEN 'APPROVED' THEN 'Approved'
        WHEN 'REJECTED' THEN 'Rejected'
        WHEN 'ADOPTED' THEN 'Adopted'
        WHEN 'CANCELLED' THEN 'Cancelled'
        ELSE INITCAP(REPLACE(al.NEW_VALUE,'_',' '))
      END DECISION,
      CASE
        WHEN actor.PERSON_ID IS NOT NULL THEN actor.FIRST_NAME||' '||actor.LAST_NAME
        WHEN al.NEW_VALUE='ADOPTED' AND employee.PERSON_ID IS NOT NULL
          THEN employee.FIRST_NAME||' '||employee.LAST_NAME
        WHEN reviewer.PERSON_ID IS NOT NULL
          THEN reviewer.FIRST_NAME||' '||reviewer.LAST_NAME
        ELSE INITCAP(REPLACE(al.CHANGED_BY,'_',' '))
      END PERFORMED_BY,
      CASE
        WHEN actor.PERSON_ID IS NOT NULL AND al.NEW_VALUE='ADOPTED' THEN 'Employee'
        WHEN actor.PERSON_ID IS NOT NULL THEN 'Supervisor'
        WHEN al.NEW_VALUE IN ('APPROVED','REJECTED') AND reviewer.PERSON_ID IS NOT NULL THEN 'Supervisor'
        WHEN al.NEW_VALUE='ADOPTED' AND employee.PERSON_ID IS NOT NULL THEN 'Employee'
        ELSE 'Database User'
      END PERFORMED_BY_ROLE,
      al.CHANGED_AT ACTION_DATE
      FROM AUDIT_LOG al
      JOIN ADOPTION_PROCESS ap ON ap.ADOPTION_ID=al.ENTITY_ID
      JOIN PERSON adopter ON adopter.PERSON_ID=ap.ADOPTER_ID
      JOIN PET pet ON pet.PET_ID=ap.LOCAL_PET_ID
      LEFT JOIN PERSON actor ON actor.PERSON_ID=al.CHANGED_BY
      LEFT JOIN ADOPTION_MANAGEMENT am ON am.ADOPTION_ID=ap.ADOPTION_ID
      LEFT JOIN PERSON reviewer ON reviewer.PERSON_ID=am.SUPERVISOR_ID
      LEFT JOIN PERSON employee ON employee.PERSON_ID=ap.EMPLOYEE_ID
      WHERE al.ENTITY_NAME='ADOPTION_PROCESS'
        AND (:searchValue IS NULL
         OR UPPER(ap.ADOPTION_ID)=UPPER(:searchValue)
         OR UPPER(TRIM(adopter.FIRST_NAME||' '||adopter.LAST_NAME))=UPPER(:searchValue)
         OR UPPER(pet.PET_ID)=UPPER(:searchValue)
         OR UPPER(pet.NAME)=UPPER(:searchValue)
         OR UPPER(al.NEW_VALUE)=UPPER(:searchValue))
      ORDER BY al.AUDIT_ID DESC`,{searchValue:search||null});
    res.json(rows);
  }
  };
};

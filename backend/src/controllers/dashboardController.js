module.exports = function createDashboardController(deps) {
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
    getDashboard: async(req,res)=>{
  const base=(await select(`SELECT * FROM VW_DASHBOARD_STATS`))[0]||{};
  delete base.TOTAL_INCOME;
  delete base.TOTAL_EXPENSES;
  const extra=(await select(`SELECT
    (SELECT COUNT(*) FROM MEDICAL_RECORD) MEDICAL_RECORD_COUNT,
    (SELECT COUNT(*) FROM MEDICINE) MEDICINE_COUNT,
    (SELECT COUNT(*) FROM VACCINATION) VACCINATION_COUNT,
    (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE ADOPTER_ID=:personId) MY_ADOPTION_COUNT,
    (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE STATUS='PENDING') PENDING_REVIEW_COUNT,
    (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE EMPLOYEE_ID=:personId AND STATUS='APPROVED') MY_ASSIGNED_ADOPTION_COUNT,
    (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE EMPLOYEE_ID=:personId AND STATUS='ADOPTED') MY_ADOPTED_ADOPTION_COUNT,
    (SELECT COUNT(*) FROM VOLUNTEER_RESCUE WHERE VOLUNTEER_ID=:personId) MY_RESCUE_COUNT,
    (SELECT COUNT(*) FROM DONATION WHERE DONOR_ID=:personId) MY_DONATION_COUNT,
    (SELECT COUNT(*) FROM GUEST_PET_OWNER WHERE OWNER_ID=:personId) MY_OWNED_PET_COUNT,
    (SELECT NVL(SUM(i.AMOUNT),0) FROM DONATION d JOIN INCOME i ON i.SOURCE_ID=d.SOURCE_ID WHERE d.DONOR_ID=:personId) MY_DONATION_TOTAL
    FROM DUAL`,{personId:req.user.personId}))[0]||{};
  res.json({...base,...extra});
}
  };
};

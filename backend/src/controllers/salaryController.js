module.exports = function createSalaryController(deps) {
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
    listSalaries: async(req,res)=>res.json(await select(`SELECT * FROM VW_SALARY_DETAILS ORDER BY PAYMENT_DATE DESC,SALARY_ID DESC`)),

    listSalaryPayees: async(req,res)=>{
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
},

    createSalary: async(req,res)=>{
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
}
  };
};

module.exports = function createFinanceController(deps) {
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
    getFinance: async(req,res)=>{
  const [summary,income,expenses]=await Promise.all([
    select(`SELECT * FROM VW_FINANCE_SUMMARY`),
    select(`SELECT * FROM INCOME ORDER BY SOURCE_ID`),
    select(`SELECT * FROM EXPENSES ORDER BY SOURCE_ID`)
  ]);
  res.json({summary,income,expenses});
},

    listDonations: async(req,res)=>{
  if(req.user.role==='DONOR'){
    const rows=await select(`SELECT i.SOURCE_ID,i.SOURCE_NAME,i.AMOUNT
      FROM DONATION d JOIN INCOME i ON i.SOURCE_ID=d.SOURCE_ID
      WHERE d.DONOR_ID=:personId ORDER BY i.SOURCE_ID DESC`,{personId:req.user.personId});
    return res.json(rows);
  }
  const rows=await select(`SELECT i.SOURCE_ID,'RECORDED' STATUS
    FROM DONATION d JOIN INCOME i ON i.SOURCE_ID=d.SOURCE_ID
    ORDER BY i.SOURCE_ID DESC`);
  res.json(rows);
},

    createDonation: async(req,res)=>{
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
},

    createIncome: async(req,res)=>{
  const body=req.body||{};if(required(body,['sourceId','sourceName','amount','financeId']).length)return res.status(400).json({error:'sourceId, sourceName, amount and financeId are required'});
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO INCOME(SOURCE_ID,SOURCE_NAME,AMOUNT) VALUES(:sourceId,:sourceName,:amount)`,{sourceId:body.sourceId,sourceName:body.sourceName,amount:body.amount});
    await connection.execute(`INSERT INTO FINANCE_INCOME(FINANCE_ID,SOURCE_ID) VALUES(:financeId,:sourceId)`,{financeId:body.financeId,sourceId:body.sourceId});
  });
  res.status(201).json({message:'Income transaction committed'});
},

    createExpense: async(req,res)=>{
  const body=req.body||{};if(required(body,['sourceId','sourceName','amount','financeId']).length)return res.status(400).json({error:'sourceId, sourceName, amount and financeId are required'});
  await transaction(async connection=>{
    await connection.execute(`INSERT INTO EXPENSES(SOURCE_ID,SOURCE_NAME,AMOUNT) VALUES(:sourceId,:sourceName,:amount)`,{sourceId:body.sourceId,sourceName:body.sourceName,amount:body.amount});
    await connection.execute(`INSERT INTO FINANCE_EXPENSE(FINANCE_ID,SOURCE_ID) VALUES(:financeId,:sourceId)`,{financeId:body.financeId,sourceId:body.sourceId});
  });
  res.status(201).json({message:'Expense transaction committed'});
}
  };
};

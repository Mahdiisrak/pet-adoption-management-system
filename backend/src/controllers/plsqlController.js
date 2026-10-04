module.exports = function createPlsqlController(deps) {
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
    listQueryLabItems: async(req,res)=>res.json(queryCatalog.map(({sql,...item})=>item)),

    runQueryLabItem: async(req,res)=>{
  const item=queryCatalog.find(query=>query.key===req.params.key);
  if(!item)return res.status(404).json({error:'Query demonstration not found'});
  const rows=await select(item.sql);
  const {sql,...report}=item;
  res.json({...report,rows});
},

    runStoredFunctionDemo: async(req,res)=>{
  const rows=await select(`SELECT FN_PERSON_AGE(:personId) PERSON_AGE,
    CASE
      WHEN EXISTS (SELECT 1 FROM PERSON WHERE PERSON_ID=:personId) THEN 'Person found'
      ELSE 'NO_DATA_FOUND handled: person does not exist'
    END PERSON_AGE_STATUS,
    FN_AVAILABLE_PET_COUNT AVAILABLE_PETS
    FROM DUAL`,{personId:req.params.personId});
  res.json({title:'Stored Function',description:'Calls FN_PERSON_AGE and FN_AVAILABLE_PET_COUNT.',rows});
},

    runCursorDemo: async(req,res)=>{
  const result=await withConnection(connection=>connection.execute(
    `BEGIN PR_CURSOR_PET_SUMMARY(:total,:available); END;`,
    {total:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER},available:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}}
  ));
  res.json({title:'Explicit Cursor',description:'PR_CURSOR_PET_SUMMARY opens, fetches and closes an explicit cursor.',result:result.outBinds});
},

    runExceptionDemo: async(req,res)=>{
  const result=await withConnection(connection=>connection.execute(
    `BEGIN PR_FIND_PERSON(:personId,:fullName,:message); END;`,
    {personId:req.params.personId,fullName:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:120},message:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:200}}
  ));
  res.json({title:'Exception Handling',description:'PR_FIND_PERSON handles NO_DATA_FOUND and other exceptions.',result:result.outBinds});
}
  };
};

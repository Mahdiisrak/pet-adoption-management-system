module.exports = function createShelterController(deps) {
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
    listShelters: async(req,res)=>res.json(await select(`SELECT * FROM VW_SHELTER_OVERVIEW ORDER BY SHELTER_ID`)),

    listShelterSupervisors: async(req,res)=>{
  const rows=await select(`SELECT s.PERSON_ID,
    p.FIRST_NAME||' '||p.LAST_NAME FULL_NAME
    FROM SUPERVISOR s
    JOIN PERSON p ON p.PERSON_ID=s.PERSON_ID
    ORDER BY p.FIRST_NAME,p.LAST_NAME`);
  res.json(rows);
},

    createShelter: async(req,res)=>{
  const body=req.body||{};if(required(body,['shelterId','roomType']).length)return res.status(400).json({error:'shelterId and roomType are required'});
  await execute(`INSERT INTO SHELTER(SHELTER_ID,ROOM_TYPE) VALUES(:shelterId,:roomType)`,body);
  res.status(201).json({message:'Shelter created'});
},

    assignShelterSupervisor: async(req,res)=>{
  const supervisorId=String(req.body?.supervisorId||'').trim();
  if(!supervisorId)return res.status(400).json({error:'Select a Supervisor'});
  await transaction(async connection=>{
    const shelter=await connection.execute(`SELECT SHELTER_ID FROM SHELTER WHERE SHELTER_ID=:shelterId`,{shelterId:req.params.shelterId});
    if(!shelter.rows.length)throw Object.assign(new Error('Shelter was not found'),{status:404});
    const supervisor=await connection.execute(`SELECT PERSON_ID FROM SUPERVISOR WHERE PERSON_ID=:supervisorId`,{supervisorId});
    if(!supervisor.rows.length)throw Object.assign(new Error('Selected person is not a Supervisor'),{status:400});
    await connection.execute(`DELETE FROM SHELTER_SUPERVISION WHERE SHELTER_ID=:shelterId`,{shelterId:req.params.shelterId});
    await connection.execute(`INSERT INTO SHELTER_SUPERVISION(SUPERVISOR_ID,SHELTER_ID)
      VALUES(:supervisorId,:shelterId)`,{supervisorId,shelterId:req.params.shelterId});
  });
  res.json({message:'Shelter Supervisor assigned successfully'});
}
  };
};

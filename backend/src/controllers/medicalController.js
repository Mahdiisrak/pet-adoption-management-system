module.exports = function createMedicalController(deps) {
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
    listMedicalRecords: async(req,res)=>res.json(await select(`SELECT * FROM VW_MEDICAL_DETAILS ORDER BY RECORD_ID`)),

    createMedicalRecord: async(req,res)=>{
  const body=req.body||{};const missing=required(body,['petId','healthStatus']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  let recordId;
  await transaction(async connection=>{
    const recordResult=await connection.execute(`INSERT INTO MEDICAL_RECORD(RECORD_ID,PET_ID,DIAGNOSIS,TREATMENT,HEALTH_STATUS)
      VALUES(NULL,:petId,:diagnosis,:treatment,:healthStatus)
      RETURNING RECORD_ID INTO :recordId`,{
      petId:body.petId,diagnosis:body.diagnosis||null,treatment:body.treatment||null,healthStatus:body.healthStatus,
      recordId:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:12}
    });
    recordId=recordResult.outBinds.recordId[0];
    if(body.medicineId)await connection.execute(`INSERT INTO MEDICAL_RECORD_MEDICINE(RECORD_ID,MEDICINE_ID) VALUES(:recordId,:medicineId)`,{recordId,medicineId:body.medicineId});
    if(body.vaccineId)await connection.execute(`INSERT INTO MEDICAL_RECORD_VACCINATION(RECORD_ID,VACCINE_ID) VALUES(:recordId,:vaccineId)`,{recordId,vaccineId:body.vaccineId});
  });
  res.status(201).json({message:'Medical record transaction committed',recordId});
},

    listMedicines: async(req,res)=>res.json(await select(`SELECT * FROM MEDICINE ORDER BY MEDICINE_ID`)),

    createMedicine: async(req,res)=>{
  const body=req.body||{};if(required(body,['medicineId','dosage','price']).length)return res.status(400).json({error:'medicineId, dosage and price are required'});
  await execute(`INSERT INTO MEDICINE(MEDICINE_ID,DOSAGE,PRICE) VALUES(:medicineId,:dosage,:price)`,body);
  res.status(201).json({message:'Medicine created'});
},

    listVaccinations: async(req,res)=>res.json(await select(`SELECT * FROM VACCINATION ORDER BY VACCINE_ID`)),

    createVaccination: async(req,res)=>{
  const body=req.body||{};const missing=required(body,['vaccineId','vaccineName','vDate','numOfDose','price']);
  if(missing.length)return res.status(400).json({error:`Required: ${missing.join(', ')}`});
  await execute(`INSERT INTO VACCINATION(VACCINE_ID,VACCINE_NAME,V_DATE,NUM_OF_DOSE,NEXT_DOSE,PRICE) VALUES(:vaccineId,:vaccineName,TO_DATE(:vDate,'YYYY-MM-DD'),:numOfDose,TO_DATE(:nextDose,'YYYY-MM-DD'),:price)`,{...body,nextDose:body.nextDose||null});
  res.status(201).json({message:'Vaccination created'});
}
  };
};

const oracledb=require('oracledb');
require('dotenv').config();

// Oracle XE 11g requires node-oracledb Thick mode.  Later Oracle versions
// continue to work in Thin mode when ORACLE_CLIENT_LIB_DIR is left unset.
if(process.env.ORACLE_CLIENT_LIB_DIR){
  const path=require('path');
  const configDir=process.env.ORACLE_NETWORK_CONFIG_DIR
    ?path.resolve(process.env.ORACLE_NETWORK_CONFIG_DIR)
    :undefined;
  oracledb.initOracleClient({libDir:process.env.ORACLE_CLIENT_LIB_DIR,configDir});
}

let pool;

async function initPool(){
  if(pool)return pool;
  if(!process.env.DB_USER||!process.env.DB_PASSWORD||!process.env.DB_CONNECT_STRING){
    throw new Error('Oracle environment is not configured');
  }
  pool=await oracledb.createPool({
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    connectString:process.env.DB_CONNECT_STRING,
    poolMin:Number(process.env.DB_POOL_MIN||1),
    poolMax:Number(process.env.DB_POOL_MAX||5),
    poolIncrement:Number(process.env.DB_POOL_INCREMENT||1)
  });
  return pool;
}

async function withConnection(work){
  const activePool=await initPool();
  const connection=await activePool.getConnection();
  try{return await work(connection);}finally{await connection.close();}
}

async function select(sql,binds={}){
  return withConnection(async connection=>{
    const result=await connection.execute(sql,binds,{outFormat:oracledb.OUT_FORMAT_OBJECT});
    return result.rows;
  });
}

async function execute(sql,binds={}){
  return withConnection(async connection=>{
    const result=await connection.execute(sql,binds,{autoCommit:true});
    return {rowsAffected:result.rowsAffected||0,outBinds:result.outBinds};
  });
}

async function transaction(work){
  return withConnection(async connection=>{
    try{
      const result=await work(connection);
      await connection.commit();
      return result;
    }catch(error){
      await connection.rollback();
      throw error;
    }
  });
}

async function closePool(){
  if(pool){await pool.close(5);pool=null;}
}

module.exports={oracledb,initPool,withConnection,select,execute,transaction,closePool};

require('dotenv').config();
const app=require('./app');
const {closePool}=require('./db');

const port=Number(process.env.PORT||5000);
const server=app.listen(port,()=>console.log(`API listening on http://localhost:${port}`));

async function shutdown(){
  server.close(async()=>{
    await closePool();
    process.exit(0);
  });
}

process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const {
  oracledb,
  withConnection,
  select,
  execute,
  transaction
} = require('./db');

const {
  authenticate,
  authorize
} = require('./middleware/auth');

const queryCatalog = require('./queryCatalog');

const {
  safe,
  required
} = require('./utils');


/* ======================================
   FUNCTIONAL ROUTE MODULES
====================================== */

const registerAuthRoutes =
  require('./routes/authRoutes');

const registerDashboardRoutes =
  require('./routes/dashboardRoutes');

const registerPersonRoutes =
  require('./routes/personRoutes');

const registerPeopleRoutes =
  require('./routes/peopleRoutes');

const registerUserRoutes =
  require('./routes/userRoutes');

const registerPetRoutes =
  require('./routes/petRoutes');

const registerShelterRoutes =
  require('./routes/shelterRoutes');

const registerRescueRoutes =
  require('./routes/rescueRoutes');

const registerAdoptionRoutes =
  require('./routes/adoptionRoutes');

const registerMedicalRoutes =
  require('./routes/medicalRoutes');

const registerFinanceRoutes =
  require('./routes/financeRoutes');

const registerSalaryRoutes =
  require('./routes/salaryRoutes');

const registerPlsqlRoutes =
  require('./routes/plsqlRoutes');

const registerRoleApplicationRoutes =
  require('./routes/roleApplicationRoutes');

const registerAuditRoutes =
  require('./routes/auditRoutes');


const app = express();

app.use(cors());
app.use(express.json({limit:'1mb'}));


/* ======================================
   SHARED ROLE MIDDLEWARE
====================================== */

const writeRoles =
  authorize('SUPERVISOR','EMPLOYEE');

const managementRoles =
  authorize('ADMIN','SUPERVISOR');

const staffRoles =
  authorize('ADMIN','SUPERVISOR','EMPLOYEE');

const careRoles =
  authorize('ADMIN','EMPLOYEE','DOCTOR');


const makeId = prefix =>
  prefix +
  crypto
    .randomBytes(8)
    .toString('hex')
    .toUpperCase()
    .slice(0,12-prefix.length);


const deps = {
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
};


/* ======================================
   HEALTH
====================================== */

app.get('/api/health',(req,res)=>
  res.json({
    ok:true,
    service:'pet-adoption-api',
    port:Number(process.env.PORT||5000)
  })
);

app.get(
  '/api/health/database',
  safe(async(req,res)=>{
    const rows =
      await select(
        `SELECT USER DATABASE_USER,
                'CONNECTED' DATABASE_STATUS
           FROM DUAL`
      );

    res.json({
      ok:true,
      ...rows[0]
    });
  })
);


/* ======================================
   PUBLIC AUTH

   Login and public adopter/donor signup
   must remain before authenticate.
====================================== */

registerAuthRoutes(app,deps);


/* ======================================
   LOGIN REQUIRED FROM HERE
====================================== */

app.use('/api',authenticate);


/* ======================================
   DASHBOARD
====================================== */

registerDashboardRoutes(app,deps);


/* ======================================
   PEOPLE
====================================== */

registerPersonRoutes(app,deps);
registerPeopleRoutes(app,deps);
registerUserRoutes(app,deps);
registerRoleApplicationRoutes(app,deps);
registerAuditRoutes(app,deps);


/* ======================================
   PET OPERATIONS
====================================== */

registerPetRoutes(app,deps);
registerShelterRoutes(app,deps);
registerRescueRoutes(app,deps);


/* ======================================
   ADOPTION
====================================== */

registerAdoptionRoutes(app,deps);


/* ======================================
   HEALTH CARE
====================================== */

registerMedicalRoutes(app,deps);


/* ======================================
   FINANCE
====================================== */

registerFinanceRoutes(app,deps);
registerSalaryRoutes(app,deps);


/* ======================================
   DATABASE / PL-SQL DEMONSTRATION
====================================== */

registerPlsqlRoutes(app,deps);


/* ======================================
   404
====================================== */

app.use((req,res)=>
  res.status(404).json({
    error:'API endpoint not found'
  })
);


/* ======================================
   CENTRAL ERROR HANDLER
====================================== */

app.use((error,req,res,next)=>{

  console.error(error);

  const message =
    String(error?.message||'');


  if(error?.status)
    return res
      .status(error.status)
      .json({error:message});


  if(
    message.includes(
      'Oracle environment is not configured'
    )
  )
    return res.status(503).json({
      error:
        'Backend is running, but backend/.env does not contain DB_USER, DB_PASSWORD and DB_CONNECT_STRING.'
    });


  if(message.includes('ORA-01017'))
    return res.status(503).json({
      error:
        'Oracle username or password is incorrect.'
    });


  if(
    message.includes('NJS-') ||
    message.includes('ORA-125') ||
    message.includes('ORA-121')
  )
    return res.status(503).json({
      error:
        'Oracle database is unavailable. Check Oracle listener and DB connection.'
    });


  if(message.includes('ORA-00001')){
    if(message.includes('UK_SYSTEM_USER_USERNAME'))
      return res.status(409).json({
        error:
          'This username is already used by another account. Choose a different username.'
      });

    if(message.includes('UK_PERSON_EMAIL'))
      return res.status(409).json({
        error:
          'This email is already used by another person. Use a different email or update the existing person.'
      });

    if(message.includes('UK_SYSTEM_USER_PERSON'))
      return res.status(409).json({
        error:
          'This person already has a login account. Add roles to the existing account instead of creating another account.'
      });

    return res.status(409).json({
      error:
        'A row with the same primary or unique key already exists.'
    });
  }


  if(message.includes('ORA-02291'))
    return res.status(400).json({
      error:
        'A required parent record does not exist.'
    });


  if(message.includes('ORA-02292'))
    return res.status(409).json({
      error:
        'This record is used by another database record and cannot be removed.'
    });


  if(message.includes('ORA-02290'))
    return res.status(400).json({
      error:
        'A CHECK constraint rejected the supplied value.'
    });


  const businessError =
    message.match(
      /ORA-20\d{3}:\s*([^\n]+)/
    );


  if(businessError)
    return res.status(400).json({
      error:
        businessError[1].trim()
    });


  if(
    message.includes('ORA-00942') ||
    message.includes('ORA-04063')
  )
    return res.status(503).json({
      error:
        'Database objects are missing or invalid. For an existing database, apply the latest numbered migration; use run_all.sql only for a fresh setup.'
    });


  res.status(500).json({
    error:
      'Request could not be completed. Check the backend terminal for the exact Oracle error.'
  });

});


module.exports = app;

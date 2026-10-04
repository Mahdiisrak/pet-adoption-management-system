const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const src = path.join(process.cwd(), "src");
const backup = path.join(src, "app.backup.js");
const routesDir = path.join(src, "routes");
const controllersDir = path.join(src, "controllers");

if (!fs.existsSync(backup)) {
  console.error("ERROR: src/app.backup.js not found");
  process.exit(1);
}

fs.mkdirSync(routesDir, { recursive: true });
fs.mkdirSync(controllersDir, { recursive: true });

const source = fs.readFileSync(backup, "utf8");

function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);

  if (start < 0) {
    throw new Error("START MARKER NOT FOUND: " + startMarker);
  }

  const end = source.indexOf(endMarker, start);

  if (end < 0) {
    throw new Error("END MARKER NOT FOUND: " + endMarker);
  }

  return source.slice(start, end).trim();
}

const dependencyHeader = `
module.exports = function registerRoutes(app, deps) {
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
`;

function writeModule(name, code) {
  const file = path.join(routesDir, name);

  fs.writeFileSync(
    file,
    dependencyHeader +
    "\n" +
    code +
    "\n};\n",
    "utf8"
  );

  console.log("CREATED:", "src/routes/" + name);
}


/* =====================================================
   PUBLIC AUTH
===================================================== */

const publicAuth = section(
  "app.post('/api/auth/login'",
  "app.use('/api',authenticate);"
);

writeModule("authRoutes.js", publicAuth);


/* =====================================================
   PROFILE + CHANGE PASSWORD
===================================================== */

const profileCode =
  section(
    "app.get('/api/profile'",
    "app.get('/api/users'"
  );

writeModule("personRoutes.js", profileCode);


/* =====================================================
   USERS + ROLE MANAGEMENT
===================================================== */

const userCode =
  section(
    "app.get('/api/users'",
    "app.get('/api/people'"
  )
  +
  "\n\n"
  +
  section(
    "app.get('/api/roles'",
    "app.get('/api/shelters'"
  );

writeModule("userRoutes.js", userCode);


/* =====================================================
   PEOPLE + EMERGENCY
===================================================== */

const peopleCode =
  section(
    "app.get('/api/people'",
    "app.get('/api/roles'"
  );

writeModule("peopleRoutes.js", peopleCode);


/* =====================================================
   SHELTER
===================================================== */

writeModule(
  "shelterRoutes.js",
  section(
    "app.get('/api/shelters'",
    "app.get('/api/pets'"
  )
);


/* =====================================================
   PET + OWNER
===================================================== */

writeModule(
  "petRoutes.js",
  section(
    "app.get('/api/pets'",
    "app.get('/api/rescues'"
  )
);


/* =====================================================
   RESCUE
===================================================== */

writeModule(
  "rescueRoutes.js",
  section(
    "app.get('/api/rescues'",
    "app.get('/api/adoptions'"
  )
);


/* =====================================================
   ADOPTION
===================================================== */

writeModule(
  "adoptionRoutes.js",
  section(
    "app.get('/api/adoptions'",
    "app.get('/api/medical'"
  )
);


/* =====================================================
   MEDICAL / MEDICINE / VACCINATION
===================================================== */

writeModule(
  "medicalRoutes.js",
  section(
    "app.get('/api/medical'",
    "app.get('/api/finance'"
  )
);


/* =====================================================
   FINANCE + DONATION + INCOME + EXPENSE
===================================================== */

writeModule(
  "financeRoutes.js",
  section(
    "app.get('/api/finance'",
    "app.get('/api/salaries'"
  )
);


/* =====================================================
   SALARY / PAYROLL
===================================================== */

writeModule(
  "salaryRoutes.js",
  section(
    "app.get('/api/salaries'",
    "app.get('/api/query-lab'"
  )
);


/* =====================================================
   QUERY LAB + PL/SQL
===================================================== */

writeModule(
  "plsqlRoutes.js",
  section(
    "app.get('/api/query-lab'",
    "app.use((req,res)=>res.status(404)"
  )
);


/* =====================================================
   DASHBOARD
===================================================== */

writeModule(
  "dashboardRoutes.js",
  section(
    "app.get('/api/dashboard'",
    "app.get('/api/profile'"
  )
);


/* =====================================================
   SIMPLE CONTROLLER DOCUMENTATION FILES
===================================================== */

const controllerInfo = {
  "authController.js":
    "Authentication: login, registration and password change.",

  "personController.js":
    "Person profile and personal information.",

  "userController.js":
    "Supervisor account and staff role management.",

  "petController.js":
    "Pet, local pet, guest pet and pet owner operations.",

  "shelterController.js":
    "Shelter management.",

  "rescueController.js":
    "Rescue and volunteer participation operations.",

  "adoptionController.js":
    "Adoption submission, review, assignment and completion.",

  "medicalController.js":
    "Medical records, medicines and vaccinations.",

  "financeController.js":
    "Finance, income, expenses and donations.",

  "salaryController.js":
    "Payroll and salary operations.",

  "plsqlController.js":
    "Query lab, stored function, cursor and exception demonstrations."
};

for (const [file, description] of Object.entries(controllerInfo)) {
  fs.writeFileSync(
    path.join(controllersDir, file),
`/*
  ${description}

  Current implementation:
  Endpoint logic is grouped in the matching file under src/routes/.
  This controller file documents the functional module and is reserved
  for future MVC separation.
*/

module.exports = {};
`,
    "utf8"
  );
}


/* =====================================================
   UTILS
===================================================== */

fs.writeFileSync(
  path.join(src, "utils.js"),
`const safe = handler =>
  (req,res,next) =>
    Promise.resolve(handler(req,res,next)).catch(next);

const required = (body,fields) =>
  fields.filter(field =>
    body[field] === undefined ||
    body[field] === null ||
    body[field] === ''
  );

module.exports = {
  safe,
  required
};
`,
  "utf8"
);


/* =====================================================
   NEW CLEAN APP.JS
===================================================== */

const newApp = `const express = require('express');
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
        \`SELECT USER DATABASE_USER,
                'CONNECTED' DATABASE_STATUS
           FROM DUAL\`
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


  if(message.includes('ORA-00001'))
    return res.status(409).json({
      error:
        'A row with the same primary or unique key already exists.'
    });


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
      /ORA-20\\\\d{3}:\\\\s*([^\\\\n]+)/
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
        'Database objects are missing or invalid. Run database/run_all.sql.'
    });


  res.status(500).json({
    error:
      'Request could not be completed. Check the backend terminal for the exact Oracle error.'
  });

});


module.exports = app;
`;

fs.writeFileSync(
  path.join(src,"app.js"),
  newApp,
  "utf8"
);



/* =====================================================
   SIMPLE FINAL VALIDATION
===================================================== */

console.log("");
console.log("Checking generated backend...");
console.log("");

try {
  require("./src/app");

  console.log("APP LOAD OK");
  console.log("");
  console.log("=======================================");
  console.log("SAFE BACKEND SPLIT SUCCESSFUL");
  console.log("=======================================");
  console.log("");
}
catch (error) {

  console.error("");
  console.error("SPLIT VALIDATION FAILED");
  console.error(error);

  fs.copyFileSync(
    backup,
    path.join(src, "app.js")
  );

  console.error("");
  console.error("Original app.js restored automatically.");

  process.exit(1);
}

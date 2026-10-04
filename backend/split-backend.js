const fs = require("fs");
const path = require("path");

const srcDir = path.join(process.cwd(), "src");
const backupPath = path.join(srcDir, "app.backup.js");

if (!fs.existsSync(backupPath)) {
  console.error("ERROR: src/app.backup.js not found");
  process.exit(1);
}

const lines = fs.readFileSync(backupPath, "utf8").split(/\r?\n/);

/*
 app.backup.js line numbers are based on the current working version.
 extract(a,b) uses normal human line numbers, inclusive.
*/
function extract(a, b) {
  return lines.slice(a - 1, b).join("\n");
}

const commonHeader = `
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { oracledb, withConnection, select, execute, transaction } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const queryCatalog = require('../queryCatalog');

const router = express.Router();

const safe = handler =>
  (req,res,next) =>
    Promise.resolve(handler(req,res,next)).catch(next);

const required = (body,fields) =>
  fields.filter(field =>
    body[field] === undefined ||
    body[field] === null ||
    body[field] === ''
  );

const writeRoles = authorize('SUPERVISOR','EMPLOYEE');
const managementRoles = authorize('ADMIN','SUPERVISOR');
const staffRoles = authorize('ADMIN','SUPERVISOR','EMPLOYEE');
const careRoles = authorize('ADMIN','EMPLOYEE','DOCTOR');

const makeId = prefix =>
  prefix +
  crypto.randomBytes(8)
    .toString('hex')
    .toUpperCase()
    .slice(0,12-prefix.length);

`;

function makeRoute(fileName, pieces) {
  let body = pieces.map(([a,b]) => extract(a,b)).join("\n\n");

  // app.get/post/etc -> router.get/post/etc
  body = body.replace(/\bapp\./g, "router.");

  const output =
    commonHeader +
    body +
    "\n\nmodule.exports = router;\n";

  fs.writeFileSync(
    path.join(srcDir, "routes", fileName),
    output,
    "utf8"
  );

  console.log("CREATED:", fileName);
}

/* ===========================================
   1. AUTH
   login + register + change password
=========================================== */

makeRoute("authRoutes.js", [
  [24,62],
  [121,130]
]);

/*
 change-password originally depended on global authenticate.
 Add authenticate directly to that endpoint.
*/
let authPath = path.join(srcDir,"routes","authRoutes.js");
let authCode = fs.readFileSync(authPath,"utf8");

authCode = authCode.replace(
  "router.put('/api/auth/change-password',safe(",
  "router.put('/api/auth/change-password',authenticate,safe("
);

fs.writeFileSync(authPath,authCode,"utf8");


/* ===========================================
   2. PERSON
   profile + people + emergency
=========================================== */

makeRoute("personRoutes.js", [
  [80,120],
  [164,238]
]);


/* ===========================================
   3. USER / ROLE MANAGEMENT
=========================================== */

makeRoute("userRoutes.js", [
  [131,163],
  [239,274]
]);


/* ===========================================
   4. SHELTER
=========================================== */

makeRoute("shelterRoutes.js", [
  [275,280]
]);


/* ===========================================
   5. PET + OWNER
=========================================== */

makeRoute("petRoutes.js", [
  [281,328]
]);


/* ===========================================
   6. RESCUE
=========================================== */

makeRoute("rescueRoutes.js", [
  [329,343]
]);


/* ===========================================
   7. ADOPTION
=========================================== */

makeRoute("adoptionRoutes.js", [
  [344,397]
]);


/* ===========================================
   8. MEDICAL
=========================================== */

makeRoute("medicalRoutes.js", [
  [398,423]
]);


/* ===========================================
   9. FINANCE + DONATION
=========================================== */

makeRoute("financeRoutes.js", [
  [424,472]
]);


/* ===========================================
   10. SALARY
=========================================== */

makeRoute("salaryRoutes.js", [
  [473,515]
]);


/* ===========================================
   11. QUERY LAB + PL/SQL
=========================================== */

makeRoute("plsqlRoutes.js", [
  [516,541]
]);


/* ===========================================
   NEW CLEAN app.js
=========================================== */

const newApp = `const express = require('express');
const cors = require('cors');

const { select } = require('./db');
const { authenticate } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const personRoutes = require('./routes/personRoutes');
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const rescueRoutes = require('./routes/rescueRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const financeRoutes = require('./routes/financeRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const plsqlRoutes = require('./routes/plsqlRoutes');

const app = express();

app.use(cors());
app.use(express.json({limit:'1mb'}));

const safe = handler =>
  (req,res,next) =>
    Promise.resolve(handler(req,res,next)).catch(next);


/* =========================
   HEALTH
========================= */

app.get('/api/health',(req,res)=>{
  res.json({
    ok:true,
    service:'pet-adoption-api',
    port:Number(process.env.PORT||5000)
  });
});

app.get('/api/health/database',safe(async(req,res)=>{
  const rows=await select(
    \`SELECT USER DATABASE_USER,'CONNECTED' DATABASE_STATUS FROM DUAL\`
  );

  res.json({
    ok:true,
    ...rows[0]
  });
}));


/* =========================
   PUBLIC AUTH ROUTES
========================= */

app.use(authRoutes);


/* =========================
   ALL ROUTES BELOW REQUIRE LOGIN
========================= */

app.use('/api',authenticate);


/* =========================
   DASHBOARD
========================= */

app.get('/api/dashboard',safe(async(req,res)=>{

  const base=
    (await select(
      \`SELECT * FROM VW_DASHBOARD_STATS\`
    ))[0] || {};

  const extra=
    (await select(
      \`SELECT
        (SELECT COUNT(*) FROM MEDICAL_RECORD)
          MEDICAL_RECORD_COUNT,

        (SELECT COUNT(*) FROM MEDICINE)
          MEDICINE_COUNT,

        (SELECT COUNT(*) FROM VACCINATION)
          VACCINATION_COUNT,

        (SELECT COUNT(*)
         FROM ADOPTION_PROCESS
         WHERE ADOPTER_ID=:personId)
          MY_ADOPTION_COUNT,

        (SELECT COUNT(*)
         FROM ADOPTION_PROCESS
         WHERE STATUS='PENDING')
          PENDING_REVIEW_COUNT,

        (SELECT COUNT(*)
         FROM ADOPTION_PROCESS
         WHERE EMPLOYEE_ID=:personId
         AND STATUS='APPROVED')
          MY_ASSIGNED_ADOPTION_COUNT,

        (SELECT COUNT(*)
         FROM ADOPTION_PROCESS
         WHERE EMPLOYEE_ID=:personId
         AND STATUS='COMPLETED')
          MY_COMPLETED_ADOPTION_COUNT,

        (SELECT COUNT(*)
         FROM VOLUNTEER_RESCUE
         WHERE VOLUNTEER_ID=:personId)
          MY_ASSIGNED_RESCUE_COUNT,

        (SELECT COUNT(*)
         FROM DONATION
         WHERE DONOR_ID=:personId)
          MY_DONATION_COUNT,

        (SELECT NVL(SUM(i.AMOUNT),0)
         FROM DONATION d
         JOIN INCOME i
           ON i.SOURCE_ID=d.SOURCE_ID
         WHERE d.DONOR_ID=:personId)
          MY_DONATION_TOTAL

       FROM DUAL\`,
      {
        personId:req.user.personId
      }
    ))[0] || {};

  res.json({
    ...base,
    ...extra
  });
}));


/* =========================
   FUNCTIONAL MODULES
========================= */

app.use(personRoutes);
app.use(userRoutes);

app.use(petRoutes);
app.use(shelterRoutes);
app.use(rescueRoutes);

app.use(adoptionRoutes);

app.use(medicalRoutes);

app.use(financeRoutes);
app.use(salaryRoutes);

app.use(plsqlRoutes);


/* =========================
   404
========================= */

app.use((req,res)=>{
  res.status(404).json({
    error:'API endpoint not found'
  });
});


/* =========================
   ERROR HANDLER
========================= */

app.use((error,req,res,next)=>{

  console.error(error);

  const message =
    String(error?.message || '');

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
        'Oracle database is unavailable. Start Oracle and confirm the database connection.'
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
        'This staff role is used by existing records and cannot be removed.'
    });


  if(message.includes('ORA-02290'))
    return res.status(400).json({
      error:
        'A CHECK constraint rejected the supplied value.'
    });


  const businessError =
    message.match(
      /ORA-20\\d{3}:\\s*([^\\n]+)/
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
  path.join(srcDir,"app.js"),
  newApp,
  "utf8"
);


/* ===========================================
   CONTROLLER README PLACEHOLDERS
   (routes are already functionally separated)
=========================================== */

const controllers = [
  "authController.js",
  "personController.js",
  "userController.js",
  "petController.js",
  "shelterController.js",
  "rescueController.js",
  "adoptionController.js",
  "medicalController.js",
  "financeController.js",
  "salaryController.js",
  "plsqlController.js"
];

for(const file of controllers){

  const controllerPath =
    path.join(srcDir,"controllers",file);

  if(
    !fs.existsSync(controllerPath) ||
    fs.readFileSync(controllerPath,"utf8").trim()===""
  ){
    fs.writeFileSync(
      controllerPath,
      "// Reserved controller module. Current logic is separated by functional route module.\n",
      "utf8"
    );
  }
}

console.log("");
console.log("====================================");
console.log("BACKEND SPLIT COMPLETED");
console.log("====================================");
console.log("Original backup: src/app.backup.js");
console.log("New app:         src/app.js");
console.log("Routes:          src/routes/");
console.log("");

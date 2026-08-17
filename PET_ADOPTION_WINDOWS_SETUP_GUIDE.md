# Pet Adoption and Management System
## Complete Windows Teammate Setup Guide

This guide explains how to set up the **Pet Adoption and Management System** on a different Windows computer from a fresh clone, including:

- Git and project cloning
- Node.js dependencies
- Oracle Database setup
- Creating the `PET_ADMIN` database user
- SQL Developer connection
- Creating the final database schema
- Loading demo data
- Configuring `backend\.env`
- Starting backend and frontend
- Verifying the full application
- Common Windows/Oracle errors
- Important team-development considerations

---

# 1. Project Architecture

The project runs locally with this structure:

```text
React + Vite Frontend
        |
        | Axios / REST API
        v
Node.js + Express Backend
        |
        | node-oracledb
        v
Oracle Database
```

Default local ports/services used by the project:

```text
Frontend:  http://localhost:5173
Backend:   http://localhost:5000
Oracle:    localhost:1521/XEPDB1
DB User:   PET_ADMIN
```

> **Important:** The project history originally targeted Oracle 11g XE, but the verified local development environment later used **Oracle Database 21c XE with `XEPDB1`**. For a teammate setup, using the same verified environment is the simplest option.

---

# 2. What Each Teammate Needs to Install

Install these on the new Windows PC:

1. **Git**
2. **Node.js**
3. **Oracle Database 21c XE**
4. **Oracle SQL Developer**
5. **VS Code** — recommended but optional

The original working project environment used:

```text
Node.js: v24.19.0
npm:     11.17.0
```

Using the same Node major version is recommended when possible.

After installation, open a new PowerShell or Command Prompt and verify:

```powershell
git --version
node -v
npm -v
```

---

# 3. Clone the Project

Choose any folder you want. The project does **not** need to be under the exact same Windows username or path as another teammate.

Example:

```powershell
cd "$HOME\Desktop"
git clone https://github.com/Mahdiisrak/pet-adoption-management-system.git
cd pet-adoption-management-system
```

Verify:

```powershell
git status
```

A path such as this is also fine:

```text
D:\Projects\pet-adoption-management-system
```

Do not hardcode another teammate's path such as:

```text
C:\Users\Local User\Desktop\...
```

in project configuration.

---

# 4. Understand the Main Project Folders

Expected structure:

```text
pet-adoption-management-system
│
├── backend
│   ├── config
│   │   └── database.js
│   ├── middleware
│   ├── routes
│   ├── uploads
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend
│   ├── src
│   ├── package.json
│   └── package-lock.json
│
├── database
│   ├── 01_schema.sql
│   ├── 02_seed_data.sql
│   ├── 03_final_er_migration.sql
│   ├── 03a_post_migration_fix.sql
│   ├── 03b_person_final_cleanup.sql
│   ├── 03c_salary_final_cleanup.sql
│   ├── 04_demo_accounts.sql
│   └── 05_advanced_queries.sql
│
└── .gitignore
```

For a **fresh database setup**, the main final files are:

```text
database\01_schema.sql
database\02_seed_data.sql
database\05_advanced_queries.sql
```

The final schema contains **28 tables**.

---

# 5. Install Backend Dependencies

From the project root:

```powershell
cd backend
npm.cmd ci
```

If `npm.cmd ci` fails because the lock file is unavailable or inconsistent:

```powershell
npm.cmd install
```

The project already declares its required backend packages in `package.json` / `package-lock.json`, so you normally should **not** reinstall packages individually.

### Why use `npm.cmd` on Windows?

The original setup encountered this PowerShell error:

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system
```

Using:

```powershell
npm.cmd
```

avoids that PowerShell execution-policy problem.

If the Oracle package asks for install-script approval:

```powershell
npm.cmd approve-scripts oracledb
npm.cmd rebuild oracledb
```

Return to project root:

```powershell
cd ..
```

---

# 6. Install Frontend Dependencies

From the project root:

```powershell
cd frontend
npm.cmd ci
```

If needed:

```powershell
npm.cmd install
```

Return to project root:

```powershell
cd ..
```

Do **not** copy another teammate's `node_modules` folder.

Each PC should install dependencies locally.

---

# 7. Verify Oracle Services

After installing Oracle Database 21c XE, open PowerShell and run:

```powershell
Get-Service | Where-Object {
    $_.Name -like "*Oracle*"
} | Select-Object Name, Status, DisplayName
```

The important Oracle database/listener services should be running.

The original working environment showed services such as:

```text
OracleOraDB21Home1TNSListener    Running
OracleServiceXE                 Running
```

You can also check the listener from Command Prompt:

```cmd
lsnrctl status
```

---

# 8. Create the Project Database User

Do **not** use `SYSTEM` as the normal application account if you can create a dedicated project user.

The recommended application account is:

```text
PET_ADMIN
```

## 8.1 Open SQL*Plus as SYSDBA

Open **Command Prompt as Administrator** and run:

```cmd
sqlplus / as sysdba
```

If successful:

```text
SQL>
```

Check the current container:

```sql
SHOW CON_NAME;
```

You may initially see:

```text
CDB$ROOT
```

Switch to the Oracle XE pluggable database:

```sql
ALTER SESSION SET CONTAINER = XEPDB1;
```

Verify:

```sql
SHOW CON_NAME;
```

Expected:

```text
XEPDB1
```

---

# 9. Create `PET_ADMIN`

Choose a password for the teammate's local machine.

Example placeholder:

```text
YourStrongPassword123
```

Run:

```sql
CREATE USER PET_ADMIN IDENTIFIED BY YourStrongPassword123;
```

Grant the permissions required by the project schema:

```sql
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW TO PET_ADMIN;
```

Give the user tablespace quota:

```sql
ALTER USER PET_ADMIN
DEFAULT TABLESPACE USERS
QUOTA 100M ON USERS;
```

Verify:

```sql
SELECT
    USERNAME,
    ACCOUNT_STATUS,
    DEFAULT_TABLESPACE
FROM DBA_USERS
WHERE USERNAME = 'PET_ADMIN';
```

Expected:

```text
PET_ADMIN
OPEN
USERS
```

Exit if desired:

```sql
EXIT;
```

---

# 10. If `sqlplus / as sysdba` Gives ORA-01017

The original Windows setup encountered:

```text
ORA-01017: invalid username/password; logon denied
```

One successful fix was adding the Windows user to the `ORA_DBA` group.

Open **Command Prompt as Administrator**:

```cmd
net localgroup ORA_DBA "%USERNAME%" /add
```

Then sign out of Windows and sign back in.

Verify:

```cmd
whoami /groups | findstr /I "ORA_DBA"
```

Try again:

```cmd
sqlplus / as sysdba
```

Only do this if SYSDBA operating-system authentication is actually failing.

---

# 11. Create a SQL Developer Connection

Open Oracle SQL Developer.

Create a new connection using:

```text
Connection Name: Pet Adoption DB
Username:        PET_ADMIN
Password:        <the password you created>
Connection Type: Basic
Hostname:        localhost
Port:            1521
Service Name:    XEPDB1
```

Use **Service Name**, not SID.

Click:

```text
Test
```

Expected:

```text
Status: Success
```

Then click:

```text
Connect
```

---

# 12. Initialize a Fresh Database

For a **fresh teammate database**, use the consolidated final schema.

## 12.1 Run the Final Schema

Open:

```text
database\01_schema.sql
```

in SQL Developer.

Run the full script with:

```text
F5
```

This creates the final database tables and constraints.

Expected final table count:

```text
28
```

---

# 13. Load Demo Data

After `01_schema.sql` completes successfully, open:

```text
database\02_seed_data.sql
```

Run with:

```text
F5
```

The final seed file was prepared to populate all final tables with demo data in foreign-key-safe order.

> **Do not repeatedly run the seed file on an already populated database.**
>
> Re-running it may cause duplicate primary-key or unique-key errors.

---

# 14. Do Not Run Old Migration Scripts on a Fresh Final Database

The repository also contains development migration files:

```text
03_final_er_migration.sql
03a_post_migration_fix.sql
03b_person_final_cleanup.sql
03c_salary_final_cleanup.sql
```

These were used while converting an earlier schema into the final ER design.

For a fresh setup where `01_schema.sql` is already the final consolidated schema:

```text
DO NOT run the migration chain after 01_schema.sql unless you specifically know
you are upgrading an older database.
```

Recommended fresh setup order:

```text
01_schema.sql
      ↓
02_seed_data.sql
```

`05_advanced_queries.sql` is for query demonstrations/testing, not database creation.

---

# 15. Verify the Final Database

Run:

```sql
SELECT COUNT(*) AS TOTAL_TABLES
FROM USER_TABLES;
```

Expected:

```text
28
```

List the tables:

```sql
SELECT TABLE_NAME
FROM USER_TABLES
ORDER BY TABLE_NAME;
```

Check selected data:

```sql
SELECT COUNT(*) FROM PERSON;
SELECT COUNT(*) FROM PET;
SELECT COUNT(*) FROM SYSTEM_USER;
SELECT COUNT(*) FROM ADOPTION_PROCESS;
```

You can also inspect actual rows:

```sql
SELECT * FROM PET;
```

and:

```sql
SELECT * FROM ADOPTION_PROCESS;
```

---

# 16. Verify Constraints

Run:

```sql
SELECT
    CONSTRAINT_TYPE,
    COUNT(*) AS TOTAL_CONSTRAINTS
FROM USER_CONSTRAINTS
GROUP BY CONSTRAINT_TYPE
ORDER BY CONSTRAINT_TYPE;
```

Useful Oracle constraint codes:

```text
P = Primary Key
R = Foreign Key
U = Unique
C = Check / NOT NULL related constraints
```

---

# 17. Demo/Login Accounts

The project uses the `SYSTEM_USER` table for application login.

After running the final seed file, first check:

```sql
SELECT
    USER_ID,
    PERSON_ID,
    USERNAME,
    USER_ROLE,
    USER_STATUS
FROM SYSTEM_USER
ORDER BY USER_ID;
```

If the required demo users already exist, **do not rerun account inserts**.

During development, example credentials included:

```text
Admin
Username: admin
Password: admin123

Supervisor
Username: supervisor
Password: supervisor123

Doctor
Username: doctor
Password: doctor123

Employee
Username: employee
Password: employee123
```

Passwords are not stored in plain text in `SYSTEM_USER`; the database stores bcrypt password hashes.

The repository may also contain:

```text
database\04_demo_accounts.sql
```

Use it only if the final seed does not already contain the accounts you need. Always inspect `SYSTEM_USER` first to avoid duplicate IDs/usernames.

---

# 18. Create the Backend `.env` File

This is one of the most important setup steps.

The `.env` file must be here:

```text
pet-adoption-management-system
│
├── backend
│   ├── .env        <-- CORRECT LOCATION
│   ├── server.js
│   └── config
│       └── database.js
│
├── frontend
└── database
```

Correct path:

```text
pet-adoption-management-system\backend\.env
```

Incorrect path:

```text
pet-adoption-management-system\.env
```

---

# 19. Create `.env`

From the project root:

```powershell
notepad backend\.env
```

Put this inside:

```env
PORT=5000

DB_USER=PET_ADMIN
DB_PASSWORD=YOUR_LOCAL_PET_ADMIN_PASSWORD
DB_CONNECT_STRING=localhost:1521/XEPDB1

ORACLE_CLIENT_LIB_DIR=

JWT_SECRET=CHANGE_THIS_TO_A_LOCAL_SECRET
```

Example only:

```env
PORT=5000

DB_USER=PET_ADMIN
DB_PASSWORD=YourStrongPassword123
DB_CONNECT_STRING=localhost:1521/XEPDB1

ORACLE_CLIENT_LIB_DIR=

JWT_SECRET=pet_adoption_secure_secret_2026
```

### Important

The value of:

```text
DB_PASSWORD
```

must exactly match the password used when creating:

```text
PET_ADMIN
```

---

# 20. Meaning of the `.env` Variables

### `PORT`

Backend server port:

```env
PORT=5000
```

The frontend currently expects the API on port `5000`, so keeping this value avoids additional code changes.

### `DB_USER`

Oracle application user:

```env
DB_USER=PET_ADMIN
```

### `DB_PASSWORD`

The password for the teammate's own local `PET_ADMIN` account:

```env
DB_PASSWORD=...
```

### `DB_CONNECT_STRING`

For the verified Oracle 21c XE setup:

```env
DB_CONNECT_STRING=localhost:1521/XEPDB1
```

### `ORACLE_CLIENT_LIB_DIR`

For the verified 21c XE project setup this was left blank:

```env
ORACLE_CLIENT_LIB_DIR=
```

### `JWT_SECRET`

Used by the backend authentication/token system:

```env
JWT_SECRET=...
```

Use a local development secret and do not commit it.

---

# 21. Never Commit `.env`

The project `.gitignore` ignores environment files:

```gitignore
.env
.env.*
```

Check:

```powershell
git status
```

`backend/.env` should not appear as a normal tracked file.

Never send real database passwords or JWT secrets to GitHub.

Each teammate can have a different local database password because the password is supplied through that teammate's own `.env`.

---

# 22. Verify `backend\config\database.js`

The project database connection reads environment variables such as:

```javascript
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
connectString: process.env.DB_CONNECT_STRING
```

Therefore:

```text
No teammate-specific Windows path should be hardcoded in database.js.
```

The `.env` file is where machine-specific database credentials belong.

---

# 23. Start the Backend

Open a terminal at the project root:

```powershell
cd backend
npm.cmd run dev
```

Expected output includes something similar to:

```text
Server is running on http://localhost:5000
```

Keep this terminal running.

---

# 24. Test Backend + Database Connection

Open in a browser:

```text
http://localhost:5000/api/health
```

A successful database connection should indicate that the server is running and Oracle is connected.

During the verified project setup, the connection test reported values such as:

```json
{
  "success": true,
  "username": "PET_ADMIN",
  "container": "XEPDB1"
}
```

If the health endpoint says the server is running but the database is not connected, check:

1. Oracle service
2. Oracle listener
3. `.env` location
4. `DB_USER`
5. `DB_PASSWORD`
6. `DB_CONNECT_STRING`
7. Whether `PET_ADMIN` exists inside `XEPDB1`

---

# 25. Start the Frontend

Open a **second terminal**.

From project root:

```powershell
cd frontend
npm.cmd run dev
```

Expected Vite address:

```text
http://localhost:5173
```

Open it in the browser.

Keep both terminals open:

```text
Terminal 1 = Backend
Terminal 2 = Frontend
```

---

# 26. Frontend API Address

The project frontend API service was configured with:

```text
http://localhost:5000/api
```

Therefore the easiest teammate setup is:

```text
Backend PORT = 5000
```

If you change the backend to another port, you must also update the frontend API configuration.

---

# 27. Full End-to-End Verification

Check in this order:

## Database

```sql
SELECT COUNT(*) FROM USER_TABLES;
```

Expected:

```text
28
```

## Backend

Open:

```text
http://localhost:5000/api/health
```

## Frontend

Open:

```text
http://localhost:5173
```

## Login

Test one known demo account.

## CRUD Test

Perform at least one operation such as:

```text
View pets
Add/update a record
Open adoption information
```

Then confirm the corresponding record in SQL Developer.

This proves:

```text
React
  ↓
Axios
  ↓
Express
  ↓
Oracle
  ↓
Database Result
  ↓
Frontend
```

---

# 28. Uploaded Pet Images Are Not Automatically Cloned

The project `.gitignore` contains:

```gitignore
backend/uploads/*
!backend/uploads/.gitkeep
```

This means Git keeps the folder but does **not** normally store uploaded pet image files.

After cloning, a teammate may have:

```text
backend\uploads\.gitkeep
```

but not the actual images that existed on another machine.

If the database contains a path such as:

```text
uploads/buddy.jpg
```

and the physical image is missing, the database record can still exist while the image fails to display.

Solutions:

1. Copy required development images into:

```text
backend\uploads\
```

or:

2. Re-upload the images through the application.

Do not assume database data and upload files are synchronized automatically.

---

# 29. Each Teammate Has a Separate Local Database

Git synchronizes project code and SQL files.

Git does **not** synchronize the actual local Oracle database.

Example:

```text
Teammate A
Oracle XEPDB1
PET_ADMIN
Local Data A

Teammate B
Oracle XEPDB1
PET_ADMIN
Local Data B
```

If teammate A changes database rows using the website, teammate B will not receive those row changes through `git pull`.

To share database data changes, you need one of these:

- Update the seed/migration SQL in Git
- Export/import database data
- Use one shared remote/cloud database

---

# 30. Recommended Git Workflow for Teammates

Before starting work:

```powershell
git pull
```

After coding:

```powershell
git status
git add .
git commit -m "Describe the change"
git push
```

Do not commit:

```text
node_modules
.env
real passwords
JWT secrets
local uploaded files unless intentionally managed
```

---

# 31. If Port 5000 Is Already in Use

Check:

```powershell
netstat -ano | findstr :5000
```

If another process is using it, either stop that process or change the backend port.

Example:

```env
PORT=5001
```

But if you use `5001`, you must also update the frontend API base URL from:

```text
http://localhost:5000/api
```

to:

```text
http://localhost:5001/api
```

For team consistency, keeping port `5000` is recommended.

---

# 32. If Vite Uses a Different Frontend Port

If `5173` is already occupied, Vite may offer another port.

Use the exact URL shown by:

```powershell
npm.cmd run dev
```

The backend port is more important to keep consistent because the frontend API configuration points to it.

---

# 33. If Oracle Connection Fails

Check the following.

## Check Oracle services

```powershell
Get-Service | Where-Object {
    $_.Name -like "*Oracle*"
}
```

## Check listener

```cmd
lsnrctl status
```

## Check SQL Developer

Test:

```text
PET_ADMIN
localhost
1521
XEPDB1
```

## Check the user in XEPDB1

As SYSDBA:

```sql
ALTER SESSION SET CONTAINER = XEPDB1;

SELECT USERNAME, ACCOUNT_STATUS
FROM DBA_USERS
WHERE USERNAME = 'PET_ADMIN';
```

## Check `.env`

Make sure it is:

```text
backend\.env
```

not project-root `.env`.

---

# 34. If `PET_ADMIN` Is Locked

As SYSDBA:

```sql
ALTER SESSION SET CONTAINER = XEPDB1;

ALTER USER PET_ADMIN ACCOUNT UNLOCK;
```

If necessary, reset its password:

```sql
ALTER USER PET_ADMIN IDENTIFIED BY NewPassword123 ACCOUNT UNLOCK;
```

Then update:

```text
backend\.env
```

so:

```env
DB_PASSWORD=NewPassword123
```

matches the database.

---

# 35. Clean Local Database Reset

Only do this on a disposable local development database.

> **Warning:** This deletes every object/data owned by `PET_ADMIN`.

As SYSDBA:

```sql
ALTER SESSION SET CONTAINER = XEPDB1;

DROP USER PET_ADMIN CASCADE;
```

Then recreate:

```sql
CREATE USER PET_ADMIN IDENTIFIED BY YourStrongPassword123;

GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW TO PET_ADMIN;

ALTER USER PET_ADMIN
DEFAULT TABLESPACE USERS
QUOTA 100M ON USERS;
```

Then run again:

```text
database\01_schema.sql
database\02_seed_data.sql
```

Finally ensure:

```text
backend\.env
```

contains the same new password.

---

# 36. Important Note About Oracle 11g XE

The project originally planned to use:

```text
Oracle Database 11g XE
```

The later verified Windows development environment used:

```text
Oracle Database 21c XE
Service: XEPDB1
```

If a teammate intentionally installs **Oracle 11g XE**, the database service/connect string is different from the verified 21c setup.

A typical project value would be based on:

```text
localhost:1521/XE
```

instead of:

```text
localhost:1521/XEPDB1
```

The project history also planned **node-oracledb Thick mode with Oracle Instant Client** for Oracle 11g compatibility.

Therefore:

```text
Do not simply change XEPDB1 to XE and assume the entire 11g setup is finished.
```

If your team standardizes on Oracle 11g, also verify the Oracle Client/Instant Client and Thick-mode initialization required by the backend.

For the simplest teammate setup, use the same verified environment:

```text
Oracle 21c XE
XEPDB1
PET_ADMIN
```

---

# 37. Do Not Mix These Two Configurations

## Verified 21c XE Configuration

```env
DB_USER=PET_ADMIN
DB_PASSWORD=YOUR_PASSWORD
DB_CONNECT_STRING=localhost:1521/XEPDB1
ORACLE_CLIENT_LIB_DIR=
```

## 11g-Style Configuration

```env
DB_USER=PET_ADMIN
DB_PASSWORD=YOUR_PASSWORD
DB_CONNECT_STRING=localhost:1521/XE
ORACLE_CLIENT_LIB_DIR=<Oracle Client folder if Thick mode is configured>
```

Pick one environment and configure the backend accordingly.

---

# 38. Fast Setup Summary

For a new teammate using the recommended verified setup:

```text
1. Install Git
2. Install Node.js
3. Install Oracle Database 21c XE
4. Install SQL Developer
5. Clone GitHub repository
6. npm.cmd ci in backend
7. npm.cmd ci in frontend
8. sqlplus / as sysdba
9. Switch to XEPDB1
10. Create PET_ADMIN
11. Grant CREATE SESSION, CREATE TABLE, CREATE VIEW
12. Give USERS tablespace quota
13. Connect SQL Developer as PET_ADMIN
14. Run database\01_schema.sql
15. Run database\02_seed_data.sql
16. Verify 28 tables
17. Create backend\.env
18. Set PET_ADMIN password in .env
19. npm.cmd run dev in backend
20. Test /api/health
21. npm.cmd run dev in frontend
22. Open localhost:5173
23. Test login and CRUD
```

---

# 39. One-Time Setup Checklist

- [ ] Git installed
- [ ] Node.js installed
- [ ] npm works
- [ ] Oracle Database installed
- [ ] Oracle listener running
- [ ] Oracle database service running
- [ ] SQL Developer installed
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `PET_ADMIN` created inside `XEPDB1`
- [ ] `PET_ADMIN` status is `OPEN`
- [ ] `01_schema.sql` executed successfully
- [ ] `02_seed_data.sql` executed successfully
- [ ] Final database has 28 tables
- [ ] `SYSTEM_USER` contains required login users
- [ ] `backend\.env` exists
- [ ] `.env` contains correct DB password
- [ ] `DB_CONNECT_STRING=localhost:1521/XEPDB1`
- [ ] `JWT_SECRET` configured
- [ ] Backend starts on port 5000
- [ ] `/api/health` confirms database connection
- [ ] Frontend starts successfully
- [ ] Login works
- [ ] At least one database-backed page works
- [ ] Missing upload images handled if required
- [ ] `.env` is not tracked by Git

---

# 40. Daily Startup After One-Time Setup

After the machine is fully configured, normal daily startup requires only two terminals.

## Terminal 1 — Backend

```powershell
cd path\to\pet-adoption-management-system\backend
npm.cmd run dev
```

## Terminal 2 — Frontend

```powershell
cd path\to\pet-adoption-management-system\frontend
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

The local Oracle service must also be running.

---

# 41. Daily Update Before Working

From the project root:

```powershell
git pull
```

If `package-lock.json` changed after pulling, rerun dependency installation in the affected folder:

```powershell
cd backend
npm.cmd ci
```

and/or:

```powershell
cd frontend
npm.cmd ci
```

If a new database migration is intentionally added later, read its instructions before executing it. Do not blindly rerun the original schema or seed files on an existing populated database.

---

# 42. Final Recommended Team Standard

To minimize “works on my PC” problems, every teammate should use the same conventions:

```text
Database Product: Oracle Database 21c XE
Database Service: XEPDB1
Application User: PET_ADMIN
Backend Port:     5000
Frontend:         Vite local URL
DB Config:        backend\.env
Schema:           database\01_schema.sql
Seed Data:        database\02_seed_data.sql
```

Each teammate may use a different local password, but the username/service/ports should stay consistent unless there is a specific reason to change them.

---

## Security Reminder

Never commit or publish:

```text
Oracle passwords
JWT secrets
real user passwords
private production credentials
```

Use placeholders in documentation and keep real machine-specific values only in:

```text
backend\.env
```

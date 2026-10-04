# Pet Adoption Management System

Complete DBMS Project Update-3 implementation using React, Vite, Bootstrap, Node.js, Express, `node-oracledb` and Oracle XEPDB1.

## Run the complete project with Docker

Prerequisites: Docker Desktop running with at least 4 GB of memory available for containers.

```powershell
Copy-Item .env.example .env
# Edit .env and replace all three development secrets.
docker compose up --build
```

Open `http://localhost:8081` and sign in with `admin` / `password`. The API is exposed at `http://localhost:5000`, and Oracle is available to local database tools at `localhost:1522/XEPDB1` (`PET_ADMIN` and the `APP_USER_PASSWORD` from `.env`).

The first startup takes several minutes because Oracle creates and seeds the database. Database setup scripts only run while the `oracle-data` Docker volume is first created. To deliberately rebuild the database from the SQL files, stop the stack and run `docker compose down -v` before starting it again; this deletes the Docker database data.

## 1. Create the Oracle database objects

1. Open SQL Developer and connect to the application schema.
2. Open `database/run_all.sql`.
3. Press **F5 / Run Script**.
4. Confirm the final output contains `VERIFICATION PASSED`.

## 2. Configure and run the backend

```powershell
cd "D:\mhidi\pet-adoption-system"
Copy-Item backend\.env.example backend\.env
notepad backend\.env
cd backend
npm.cmd install
npm.cmd run check
npm.cmd start
```

Enter the local Oracle password in `backend/.env`. Test:

```text
http://localhost:5000/api/health
http://localhost:5000/api/health/database
```

## 3. Run the frontend

In a second PowerShell terminal:

```powershell
cd "D:\mhidi\pet-adoption-system\frontend"
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173` and login with:

```text
Username: admin
Password: password
```

## Account and onboarding workflow

- Adopters and donors create their own accounts from the login page.
- Admin creates, activates and deactivates Supervisor accounts only.
- Supervisor creates each Doctor, Employee or Volunteer profile, role and login account together from People Directory.
- Employee registers a pet owner while completing a guest-pet intake. Pet owners do not receive login accounts.
- Every signed-in user can change their own password from My Profile.
- A signed-in person can apply for additional compatible roles. Admin reviews Supervisor requests, Supervisor reviews Doctor/Employee/Volunteer/Adopter/Donor requests, and Employee reviews Owner requests.
- Approved roles appear in the top-bar role switcher. Every PERSON subtype membership can have its own dashboard under the same account and PERSON_ID.
- Volunteers create their own rescue reports; their signed-in Person ID is attached automatically. Supervisor/Admin monitor those reports and do not assign a specific pet to a Volunteer. Donor accounts show only their own donations.
- Admin acts as the higher authority for shelter responsibility: Admin creates a shelter and assigns one responsible Supervisor. A Supervisor cannot assign themselves. Available local pets inherit that shelter responsibility in Pet Directory until an adoption is approved or completed.

The demonstration Volunteer account is `volunteer` / `password`. It belongs to Arif Khan (`P008`) and can also switch to the approved Donor dashboard because the ER data gives that same person both roles.

## Existing database payroll update

After installing the payroll and pet-owner directory update, open `database/12_payroll_owner_directory_migration.sql` in SQL Developer and run it once with **F5**. This is required because the old Salary table stored an Employee and Doctor in the same payment. The migration preserves the legacy payments and converts each row to one payee.

The Pet Owners page uses the existing `OWNER`, `GUEST_PET_OWNER`, `GUEST_PET`, and `PET` tables. Employee can register a new owner during guest-pet intake; Supervisor and Admin can search by owner ID, name, or phone.

For an existing database, run `database/13_multi_role_access_migration.sql` once with **F5** before starting this multi-role version.
If that migration was already run before existing subtype roles were synchronized, run `database/14_sync_existing_person_roles.sql` once with **F5**.

## Project Update-2 coverage

- 16 fully navigable frontend pages
- Functional SQL Query Lab
- Simple queries, functions, joins, subqueries, set operations and views
- Abstract Data Type
- PL/SQL stored functions and procedures
- Explicit cursor
- Exception handling
- Final ER-to-relational mapping and 43-table schema

See `docs/project_update_2_checklist.md` for the live presentation order.

## Project Update-3 coverage

- Oracle `AUDIT_LOG_SEQ` sequence and two working triggers
- Trigger-generated adoption status history visible to Admin in **System Activity**
- Database-side exact search initiated from the frontend
- A live two-stage `WITH`/CTE employee workload report in **Insights & Reports**
- Previous feedback retained: `ADOPTED` final state, role-aware people, multi-role dashboard switching, database exception handling, and visible pet responsibility

For an existing database, run `database/19_project_update_3.sql` and `database/20_activity_history_details.sql` once as `PET_ADMIN`, then rebuild backend and frontend. See `PROJECT_UPDATE_3.md` for the presentation steps and code map.

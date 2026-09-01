# Pet Adoption Management System

Complete DBMS Project Update-2 implementation using React, Vite, Bootstrap, Node.js, Express, `node-oracledb` and Oracle XEPDB1.

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
- Supervisor creates staff profiles in People Directory, then creates Doctor, Employee or Volunteer roles and login accounts in Team Management.
- Employee registers a pet owner while completing a guest-pet intake. Pet owners do not receive login accounts.
- Every signed-in user can change their own password from My Profile.
- Volunteer accounts show only their assigned rescues; donor accounts show only their own donations.

## Existing database payroll update

After installing the payroll and pet-owner directory update, open `database/12_payroll_owner_directory_migration.sql` in SQL Developer and run it once with **F5**. This is required because the old Salary table stored an Employee and Doctor in the same payment. The migration preserves the legacy payments and converts each row to one payee.

The Pet Owners page uses the existing `OWNER`, `GUEST_PET_OWNER`, `GUEST_PET`, and `PET` tables. Employee can register a new owner during guest-pet intake; Supervisor and Admin can search by owner ID, name, or phone.

## Project Update-2 coverage

- 16 fully navigable frontend pages
- Functional SQL Query Lab
- Simple queries, functions, joins, subqueries, set operations and views
- Abstract Data Type
- PL/SQL stored functions and procedures
- Explicit cursor
- Exception handling
- Final ER-to-relational mapping and 40-table schema

See `docs/project_update_2_checklist.md` for the live presentation order.

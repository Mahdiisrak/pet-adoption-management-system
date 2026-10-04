# PetCare Management System Presentation Slides

## Slide 1: Title
**PetCare Management System**

Oracle + Express.js + React based Pet Adoption Management System

Presented by: [Your Name]

---

## Slide 2: Project Overview
**What the project does**

- Manages pet adoption workflow from rescue to adoption.
- Supports multiple user roles with different permissions.
- Stores all operational data in Oracle Database.
- Provides database-driven search, reports and activity history.
- Demonstrates important Oracle concepts through real frontend features.

---

## Slide 3: Technology Stack
**Tools and technologies**

- Frontend: React + Vite
- Backend: Node.js + Express.js
- Database: Oracle
- Authentication: JWT
- Password hashing: bcrypt
- Deployment: Docker Compose

Important files:
- `frontend/src/App.jsx`
- `backend/src/app.js`
- `backend/src/db.js`
- `database/01_schema.sql`
- `docker-compose.yml`

---

## Slide 4: User Roles
**Role-based access control**

The system supports:

- Admin
- Supervisor
- Employee
- Doctor
- Volunteer
- Adopter
- Donor
- Owner for guest-pet ownership records

Key features:

- Login and authentication
- Role switching
- Multiple approved roles for one person
- Backend authorization for protected routes

Code:
- `backend/src/middleware/auth.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/roleApplicationController.js`

---

## Slide 5: Main Project Modules
**Functional modules**

- Dashboard
- People Directory
- User Accounts
- Staff Employment
- Shelter Management
- Pet Directory
- Rescue Reports
- Rescue Intake
- Adoption Application and Review
- Health Records
- Medicine and Vaccination Records
- Finance and Payroll
- System Activity
- PetCare Insights
- Smart PetCare Tools

Frontend:
- `frontend/src/App.jsx`

---

## Slide 6: Database Table Creation
**Oracle schema design**

Main schema file:

- `database/01_schema.sql`

Important tables:

- `PERSON`
- `SYSTEM_USER`
- `SYSTEM_USER_ROLE`
- `ROLE_APPLICATION`
- `PET`
- `LOCAL_PET`
- `GUEST_PET`
- `RESCUE`
- `RESCUE_PET`
- `SHELTER`
- `ADOPTION_PROCESS`
- `ADOPTION_MANAGEMENT`
- `MEDICAL_RECORD`
- `MEDICINE`
- `VACCINATION`
- `FINANCE`
- `SALARY`
- `AUDIT_LOG`

---

## Slide 7: Database Relationships
**Important relationships**

- One person can have multiple approved roles.
- A pet can be local or guest.
- Local pets can go through adoption.
- Volunteers submit rescue reports.
- Rescued pets are linked to shelters.
- Supervisors review adoption applications.
- Employees finalize approved adoptions.
- Medical records are linked to pets.
- Salary and finance records are protected by role.

Tables:
- `SYSTEM_USER_ROLE`
- `LOCAL_PET`
- `GUEST_PET`
- `VOLUNTEER_RESCUE`
- `RESCUE_PET`
- `PET_SHELTER`
- `ADOPTION_PROCESS`

---

## Slide 8: Frontend Search Functionality
**Database search from frontend**

Search is available in:

- People Directory
- Pet Directory
- Pet Owners
- System Activity

Frontend reusable search:

- `frontend/src/components.jsx`

Backend controllers:

- `backend/src/controllers/peopleController.js`
- `backend/src/controllers/petController.js`
- `backend/src/controllers/auditController.js`

Search input is sent to backend as `?search=...`, then Oracle queries return matching records.

---

## Slide 9: Insert Operations
**Database insertion from application**

Insertion examples:

- Create person and staff account
- Create supervisor account
- Register local or guest pet
- Submit rescue report
- Add rescued pet to shelter
- Submit adoption application
- Add medical record
- Add donation
- Add salary record

Backend files:

- `backend/src/controllers/peopleController.js`
- `backend/src/controllers/userController.js`
- `backend/src/controllers/petController.js`
- `backend/src/controllers/rescueController.js`
- `backend/src/controllers/adoptionController.js`
- `backend/src/controllers/medicalController.js`
- `backend/src/controllers/financeController.js`
- `backend/src/controllers/salaryController.js`

---

## Slide 10: Join Queries
**Joining multiple tables**

The project uses joins in views and backend controllers.

Important views:

- `VW_PERSON_ROLES`
- `VW_PET_DETAILS`
- `VW_RESCUE_DETAILS`
- `VW_ADOPTION_APPLICATIONS`
- `VW_MEDICAL_DETAILS`
- `VW_SALARY_DETAILS`
- `VW_DASHBOARD_STATS`

Database file:

- `database/03_views.sql`

Frontend usage:

- People Directory
- Pet Directory
- Rescue pages
- Adoption pages
- Health Records
- Payroll
- Dashboard

---

## Slide 11: Sequence Implementation
**Auto-generated IDs**

Sequences are used to generate clean IDs.

Examples:

- `PERSON_ID_SEQ` creates `P###`
- `SYSTEM_USER_ID_SEQ` creates `U###`
- `LOCAL_PET_ID_SEQ` creates `LP###`
- `GUEST_PET_ID_SEQ` creates `GP###`
- `RESCUE_ID_SEQ` creates `R###`
- `ADOPTION_ID_SEQ` creates `AD###`
- `MEDICAL_RECORD_ID_SEQ` creates medical record IDs
- `AUDIT_LOG_SEQ` creates audit IDs

Database files:

- `database/22_rescue_intake_workflow.sql`
- `database/23_pet_auto_local_id_trigger.sql`
- `database/24_identity_auto_id_triggers.sql`
- `database/25_pet_adoption_audit_id_cleanup.sql`
- `database/01_schema.sql`

---

## Slide 12: Trigger Implementation
**Automatic database actions**

Triggers are used for:

- Auto-generating audit IDs
- Logging adoption status changes
- Validating salary payee role
- Generating person IDs
- Generating user IDs
- Generating medical record IDs
- Generating pet IDs
- Generating adoption IDs
- Blocking owner role applications

Database files:

- `database/01_schema.sql`
- `database/24_identity_auto_id_triggers.sql`
- `database/25_pet_adoption_audit_id_cleanup.sql`

---

## Slide 13: Rescue-to-Pet Workflow
**Volunteer rescue and pet intake**

Workflow:

1. Volunteer submits rescue report.
2. Receiving shelter is selected.
3. Pet is inserted into `PET`.
4. Local pet record is inserted into `LOCAL_PET`.
5. Shelter link is inserted into `PET_SHELTER`.
6. Rescue-pet link is stored in `RESCUE_PET`.
7. Pet ID is generated automatically as `LP###`.

Backend:

- `backend/src/controllers/rescueController.js`

Database:

- `database/22_rescue_intake_workflow.sql`
- `database/25_pet_adoption_audit_id_cleanup.sql`

---

## Slide 14: Adoption Workflow
**Adopter to employee handover**

Workflow:

1. Adopter submits application for available local pet.
2. Adoption ID is generated as `AD###`.
3. Supervisor reviews the application.
4. If approved, supervisor assigns an active employee.
5. Employee finalizes the adoption.
6. Pet status becomes `ADOPTED`.
7. Audit log records status changes.

Backend:

- `backend/src/controllers/adoptionController.js`

Database:

- `PR_SUBMIT_ADOPTION`
- `PR_REVIEW_ADOPTION`
- `PR_MARK_ADOPTED`
- `TRG_ADOPTION_STATUS_AUDIT`

---

## Slide 15: WITH Clause / CTE
**Common Table Expression**

Frontend page:

- PetCare Insights

Report:

- Employee Adoption Case Summary

Query uses two CTEs:

- `EMPLOYEE_CASES`
- `RANKED_CASES`

Purpose:

- First CTE calculates employee adoption workload.
- Second CTE ranks employees by assigned cases.

Backend:

- `backend/src/queryCatalog.js`

---

## Slide 16: Subquery Queries
**Functional subquery reports**

Frontend page:

- PetCare Insights

Subquery examples:

- Single-row subquery
- Multiple-row `IN` subquery
- `ANY` subquery
- `ALL` subquery
- `EXISTS` subquery
- `NOT EXISTS` subquery
- Correlated subquery
- `HAVING` subquery

Backend:

- `backend/src/queryCatalog.js`

---

## Slide 17: View Queries
**Saved database views**

Views are used to simplify complex frontend data.

Examples:

- `VW_PERSON_ROLES`
- `VW_PET_DETAILS`
- `VW_RESCUE_DETAILS`
- `VW_ADOPTION_APPLICATIONS`
- `VW_MEDICAL_DETAILS`
- `VW_FINANCE_SUMMARY`
- `VW_SALARY_DETAILS`
- `VW_DASHBOARD_STATS`

Database:

- `database/03_views.sql`

Frontend:

- People Directory
- Pet Directory
- Rescue pages
- Adoption pages
- Health Records
- Finance
- Payroll
- Dashboard

---

## Slide 18: Function
**Oracle stored functions**

Functions:

- `FN_PERSON_AGE`
- `FN_AVAILABLE_PET_COUNT`

Frontend page:

- Smart PetCare Tools

Feature:

- Age Calculator
- Pet availability calculation

Database:

- `database/06_plsql.sql`

Backend:

- `backend/src/controllers/plsqlController.js`

---

## Slide 19: PL/SQL Procedures
**Business logic in Oracle**

Procedures:

- `PR_SUBMIT_ADOPTION`
- `PR_REVIEW_ADOPTION`
- `PR_MARK_ADOPTED`
- `PR_CURSOR_PET_SUMMARY`
- `PR_FIND_PERSON`

Used for:

- Submit adoption application
- Review adoption
- Mark adoption completed
- Cursor-based pet summary
- Exception-handled person lookup

Database:

- `database/06_plsql.sql`
- `database/25_pet_adoption_audit_id_cleanup.sql`
- `database/26_employee_assignment_role_check_fix.sql`

---

## Slide 20: Cursor
**Explicit cursor example**

Procedure:

- `PR_CURSOR_PET_SUMMARY`

What it does:

- Opens an explicit cursor over pets.
- Fetches rows one by one.
- Counts total pets.
- Counts available local pets.

Frontend page:

- Smart PetCare Tools

Backend:

- `backend/src/controllers/plsqlController.js`

Database:

- `database/06_plsql.sql`

---

## Slide 21: Exception Handling
**Database and backend exception handling**

Oracle exception handling:

- `FN_PERSON_AGE` handles `NO_DATA_FOUND`.
- `PR_CREATE_PERSON` handles duplicate key and rollback.
- `PR_FIND_PERSON` handles `NO_DATA_FOUND`, `TOO_MANY_ROWS` and `OTHERS`.
- Adoption procedures rollback on failure.

Backend exception handling:

- Async route wrapper catches errors.
- Transaction helper rolls back failed transactions.
- Central Express error handler returns clean API errors.

Files:

- `database/06_plsql.sql`
- `backend/src/utils.js`
- `backend/src/db.js`
- `backend/src/app.js`

---

## Slide 22: Abstract Data Type
**Oracle object type**

Object type:

- `ADDRESS_TYPE`

View:

- `VW_PERSON_ADDRESS_OBJECT`

Frontend page:

- PetCare Insights

Report:

- Structured Address Directory

Database:

- `database/07_abstract_datatype.sql`

Backend:

- `backend/src/queryCatalog.js`

---

## Slide 23: Security
**Security features**

- JWT authentication
- Role-based authorization
- Password hashing with bcrypt
- Backend permission checks
- Oracle bind variables
- Financial data protected by role
- Password hashes are not returned to frontend

Files:

- `backend/src/middleware/auth.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/financeController.js`
- `backend/src/db.js`

---

## Slide 24: Demo Plan
**Live presentation demo**

1. Login as Admin.
2. Show Dashboard.
3. Show People Directory search.
4. Show Pet Directory search.
5. Show PetCare Insights:
   - Join
   - Subquery
   - CTE
   - View
   - Abstract Data Type
6. Show Smart PetCare Tools:
   - Function
   - Cursor
   - Exception Handling
7. Login as Volunteer and submit rescue report.
8. Show generated `LP###` pet ID.
9. Login as Adopter and submit adoption application.
10. Show generated `AD###` adoption ID.
11. Login as Supervisor and approve adoption.
12. Show System Activity audit ID `AU###`.

---

## Slide 25: Conclusion
**Summary**

This project implements a complete role-based Pet Adoption Management System.

It combines:

- Real operational workflows
- Oracle relational schema
- Search from frontend
- Joins, views and subqueries
- CTE using WITH clause
- PL/SQL functions and procedures
- Cursor
- Exception handling
- Sequence and trigger based ID generation
- Secure authentication and authorization

The system is fully connected from React frontend to Express backend to Oracle Database.

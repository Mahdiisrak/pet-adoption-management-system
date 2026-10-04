# API summary

All protected endpoints require `Authorization: Bearer <JWT>`. The browser uses camelCase JSON; the backend maps it to Oracle columns through bind variables.

| Method | Endpoint | Main purpose |
|---|---|---|
| GET | `/api/health` | Confirms the Express server is running |
| GET | `/api/health/database` | Confirms Oracle connectivity |
| POST | `/api/auth/login` | Verifies bcrypt password and returns JWT |
<<<<<<< HEAD
| POST | `/api/auth/switch-role` | Validates an approved account role and returns a new JWT |
| POST | `/api/auth/register` | Public Adopter/Donor self-registration transaction |
| PUT | `/api/auth/change-password` | Verifies current password and stores a new bcrypt hash |
| GET | `/api/dashboard` | Live dashboard statistics view |
| GET/POST/PUT | `/api/people` | Oracle-backed person search; Supervisor creates PERSON, staff subtype and login in one transaction |
| GET/POST | `/api/emergency` | Weak emergency entity |
| GET/POST | `/api/roles` | PERSON subtype assignments |
| GET/POST | `/api/role-applications` | Own role requests and reviewer-specific approval queue |
| PUT | `/api/role-applications/:id/review` | Role-based approve/reject transaction |
| GET/POST | `/api/shelters` | Shelter operations |
| GET/POST | `/api/pets` | PET and Local/Guest subtype transaction |
| GET | `/api/owners` | Exact Oracle search by owner ID, name or phone and list all registered guest pets |
| GET | `/api/my-owned-pets` | Owner-only list of pets registered to the signed-in person |
=======
| POST | `/api/auth/register` | Public Adopter/Donor self-registration transaction |
| PUT | `/api/auth/change-password` | Verifies current password and stores a new bcrypt hash |
| GET | `/api/dashboard` | Live dashboard statistics view |
| GET/POST/PUT | `/api/people` | PERSON, phone and address transaction |
| GET/POST | `/api/emergency` | Weak emergency entity |
| GET/POST | `/api/roles` | PERSON subtype assignments |
| GET/POST | `/api/shelters` | Shelter operations |
| GET/POST | `/api/pets` | PET and Local/Guest subtype transaction |
| GET | `/api/owners` | Search owners and all guest pets registered to them |
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
| GET/POST | `/api/rescues` | Rescue, shelter and volunteer transaction |
| GET | `/api/adoptions` | Role-filtered adoption monitoring/list |
| POST | `/api/adoptions` | Adopter-only application submission |
| GET | `/api/adoptions/available-pets` | Available pets for the adopter form |
| GET | `/api/adoptions/employees` | Active employees for supervisor assignment |
| PUT | `/api/adoptions/:id/review` | Supervisor-only approve/reject and assignment |
<<<<<<< HEAD
| PUT | `/api/adoptions/:id/adopt` | Assigned employee marks the approved handover as adopted |
=======
| PUT | `/api/adoptions/:id/complete` | Assigned-employee-only completion |
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
| GET/POST | `/api/medical` | Medical record with medicine/vaccination links |
| GET/POST | `/api/medicines` | Medicine catalogue |
| GET/POST | `/api/vaccinations` | Vaccination catalogue |
| GET/POST | `/api/finance`, `/api/income`, `/api/expenses` | Finance transactions |
| GET/POST | `/api/salaries` | One-payee salary payment recorded by the signed-in Supervisor |
| GET | `/api/salaries/payees` | Supervisor/Employee/Doctor payee choices |
| GET | `/api/query-lab` | Lists and executes allowed syllabus queries |
| GET | `/api/plsql/function/:personId` | Stored-function demonstration |
| GET | `/api/plsql/cursor` | Explicit-cursor demonstration |
| GET | `/api/plsql/exception/:personId` | Exception-handling demonstration |

The Query Lab does not accept arbitrary SQL from the browser. It uses a fixed syllabus-based catalogue.

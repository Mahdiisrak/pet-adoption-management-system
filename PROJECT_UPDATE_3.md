# Project Update-3 — implementation map

## Completed requirements

| Requirement | Oracle/backend implementation | Frontend proof |
|---|---|---|
| Trigger | `TRG_AUDIT_LOG_ID` and `TRG_ADOPTION_STATUS_AUDIT` | Admin → System Activity |
| Sequence | `AUDIT_LOG_SEQ` creates numeric audit IDs | `AUDIT_ID` is displayed in System Activity |
| Database search through frontend | `/api/people`, `/api/pets`, `/api/owners`, `/api/activity-log` use Oracle predicates and bind variables | Search Database buttons |
| Common Table Expression | `cte-adoption-workload` uses two CTEs: `EMPLOYEE_CASES` and `RANKED_CASES` | Admin/Supervisor → Insights & Reports → Employee Adoption Workload |
| Previous feedback | Final status `ADOPTED`; Oracle exception handling; role-aware person creation; multi-role switch; pet responsibility | Corresponding role dashboards and directories |

Volunteer rescue workflow: a Volunteer records a rescue after performing it, and the backend attaches the signed-in Volunteer automatically. Supervisors and Admins monitor these reports; they do not pre-assign a particular pet.

## Trigger and sequence demonstration

1. Sign in as Supervisor and approve/reject a pending adoption, or sign in as the assigned Employee and mark an approved adoption as adopted.
2. Sign in as Admin.
3. Open **System Activity**.
4. The new row is not created by React or Node.js. Oracle's `TRG_ADOPTION_STATUS_AUDIT` inserts it, while `TRG_AUDIT_LOG_ID` obtains its ID from `AUDIT_LOG_SEQ.NEXTVAL`.
5. Migration `20_activity_history_details.sql` lets the trigger retain the signed-in staff member's Person ID. The frontend shows applicant, pet, decision and performer names.

## CTE demonstration

Sign in as Admin, open **Insights & Reports**, and choose **Employee Adoption Workload**. The browser calls the backend, and the backend executes the Oracle `WITH` query in `backend/src/queryCatalog.js`. Only the business result is returned to the UI.

## Existing database migration

Run `database/19_project_update_3.sql` and then `database/20_activity_history_details.sql` once as `PET_ADMIN`. Both preserve all existing rows. If migration 19 reports `ORA-01031`, run `database/19_project_update_3_privileges.sql` once as SYSTEM/SYS and then rerun migration 19 as `PET_ADMIN`.

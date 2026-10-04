# Oracle setup and execution

Connect SQL Developer to the application schema using:

- Host: `localhost`
- Port: `1521`
- Service name: `XEPDB1`
- Username: `PET_ADMIN` (or your own application-schema user)

Open `run_all.sql` and use **F5 / Run Script**. It runs:

1. `01_schema.sql`
2. `02_seed_data.sql`
3. `08_demo_accounts.sql`
4. `03_views.sql`
5. `06_plsql.sql`
6. `07_abstract_datatype.sql`
7. `09_verification.sql`

`04_basic_queries.sql` and `05_advanced_queries.sql` are reference query collections; the same query categories are executable from the frontend Query Lab.

Do not run `00_reset_schema.sql` unless a clean rebuild is intended. It is destructive and is not included in `run_all.sql`.

## Existing database adoption-workflow update

If the database was created before the role-correct adoption workflow was added, open `10_adoption_workflow_migration.sql` from this folder and run it once with **F5**. Do not run `run_all.sql` again on the existing schema.

If that migration was previously run and `PR_SUBMIT_ADOPTION` became invalid because the schema user could not create `ADOPTION_ID_SEQ`, run `11_adoption_id_hotfix.sql` once with **F5**. It replaces the sequence dependency with Oracle `SYS_GUID()` and requires no extra privilege.

For an existing database created before the corrected one-payee payroll model, run `12_payroll_owner_directory_migration.sql` once with **F5**. It migrates each legacy row to one employee payment, rebuilds the salary view, and adds database-level payee-role validation. The owner directory uses the existing `OWNER` and `GUEST_PET_OWNER` tables, so it needs no new owner table.

<<<<<<< HEAD
For an existing database created before multi-role access, run `13_multi_role_access_migration.sql` once with **F5**. It creates `SYSTEM_USER_ROLE` and `ROLE_APPLICATION`, then preserves every account's current role as its first approved role.

Run `14_sync_existing_person_roles.sql` after migration 13 when existing PERSON subtype memberships must appear as switchable dashboards. It is safe to rerun and never deletes a role.

Run `15_finance_consistency_fix.sql` once on an existing database to synchronize the Financial Overview cards with all linked income and expense records. It also removes Adoption Fee/Membership entries incorrectly linked as donations and recalculates each donor's total. It is safe to rerun.

Run `16_finance_demo_balance_fix.sql` on an existing demonstration database to replace the unrealistic mixed-period income amounts with a balanced January-May 2026 dataset. The expected totals are opening balance 231000, income 360000, expenses 280000, net activity 80000, and available balance 311000. It also includes the consistency repair, so it can be run even if migration 15 was not run.

Run `17_pet_responsibility_workflow_fix.sql` once on an existing database to show who is currently responsible for every pet. Guest pets resolve to their Owner, approved cases to the assigned Employee, adopted cases to the Adopter, and other sheltered pets to the Shelter Supervisor. It also keeps pending/unassigned adoption applications visible and recompiles database-side adoption exception handling.

Run `18_adopted_status_final_fix.sql` once after migration 17 on an existing database. It replaces the legacy adoption-process status `COMPLETED` with the final business status `ADOPTED`, changes the stored procedure to `PR_MARK_ADOPTED`, updates the database CHECK constraint, and refreshes pet responsibility. It is safe to rerun.

Run `19_project_update_3.sql` once on an existing database for Project Update-3. It creates `AUDIT_LOG`, `AUDIT_LOG_SEQ`, an automatic sequence-ID trigger, and an adoption-status audit trigger. The frontend's **System Activity** page displays these trigger-generated rows. If Oracle returns `ORA-01031`, connect once as SYSTEM/SYS, run `19_project_update_3_privileges.sql`, reconnect as `PET_ADMIN`, and rerun migration 19.

Run `20_activity_history_details.sql` after migration 19 to record the real signed-in Supervisor or Employee in future trigger-generated activity rows. The activity API joins those rows with adopter, pet, employee and supervisor records so the UI shows business-friendly names without technical underscore values.

Run `21_volunteer_demo_account.sql` on an existing demonstration database to add the missing `volunteer` login for Volunteer P008. Its password is `password`. Because P008 is also a donor in the ER data, the same account receives Volunteer and Donor dashboards through the role switcher.

The **Employee Adoption Workload** report in PetCare Insights executes a two-stage Oracle `WITH`/CTE query from `backend/src/queryCatalog.js`. People, pet, owner, and system-activity search endpoints also send the search value to Oracle as a bind variable; the browser does not filter cached rows with JavaScript.

=======
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
## Demo accounts

All development accounts use password `password`.

| Username | Role |
|---|---|
| admin | ADMIN |
| employee | EMPLOYEE |
| doctor | DOCTOR |
| supervisor | SUPERVISOR |
| adopter | ADOPTER |
<<<<<<< HEAD
| volunteer | VOLUNTEER (also DONOR for P008) |
=======
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0

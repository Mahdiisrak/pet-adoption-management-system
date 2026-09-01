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

## Demo accounts

All development accounts use password `password`.

| Username | Role |
|---|---|
| admin | ADMIN |
| employee | EMPLOYEE |
| doctor | DOCTOR |
| supervisor | SUPERVISOR |
| adopter | ADOPTER |

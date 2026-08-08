# Database Setup

Use Oracle SQL Developer.

Run the SQL files in this order:

1. 01_schema.sql
2. 02_seed_data.sql
3. 03_final_er_migration.sql
4. 04_demo_accounts.sql

Important:
- Do not use sequences, triggers, or stored procedures.
- IDs are manually assigned VARCHAR2 values.
- DATE is used for dates.
- NUMBER(12,2) is used for money fields.
- Run COMMIT after data insertion scripts where applicable.

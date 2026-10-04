#!/usr/bin/env bash
set -euo pipefail

# The image has already created PET_ADMIN in XEPDB1 from APP_USER settings.
# Run the project scripts as that application schema, in their required order.
sqlplus -s "${APP_USER}/${APP_USER_PASSWORD}@//localhost:1521/XEPDB1" <<'SQL'
WHENEVER OSERROR EXIT FAILURE
WHENEVER SQLERROR EXIT SQL.SQLCODE
@/workspace/database/01_schema.sql
@/workspace/database/02_seed_data.sql
@/workspace/database/08_demo_accounts.sql
@/workspace/database/03_views.sql
@/workspace/database/06_plsql.sql
@/workspace/database/07_abstract_datatype.sql
@/workspace/database/09_verification.sql
EXIT SUCCESS
SQL

# Implementation status

All Project Update-2 implementation phases are complete in the supplied project.

| Area | Completed work |
|---|---|
| Final schema | 40 ER-derived tables with PK, FK, UNIQUE, CHECK and NOT NULL constraints |
| Data | Demonstration rows for every main entity and relationship; five login accounts |
| Views | Simple and complex views for people, roles, pets, shelters, rescues, adoption, medical, finance and salary |
| SQL | Simple queries, functions, joins, subqueries, set operations and view queries |
| PL/SQL | Stored functions, procedures, explicit cursor, `%TYPE`, `%ROWTYPE`, record and exception handling |
| ADT | `ADDRESS_TYPE` and a view that exposes address object attributes |
| Backend | Oracle pool, authentication, transactions, CRUD/API routes, query catalogue and PL/SQL demonstrations |
| Frontend | 16 navigable pages with forms, tables, Query Lab, PL/SQL Lab and database-design coverage |
| Verification | Backend syntax, API health and frontend production build pass without Oracle; Oracle verification script supplied |

The only environment-dependent step is running `database/run_all.sql` against the user's Oracle XEPDB1 database and entering the local Oracle password in `backend/.env`.

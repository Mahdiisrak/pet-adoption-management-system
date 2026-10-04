-- Pet Adoption Management System
-- DBMS course requirement: three meaningful Common Table Expressions (CTE).
--
-- This file is read-only demonstration SQL.
-- It does not create, modify or drop any database object.
-- Each query uses existing project tables only and is compatible with Oracle XE 21c.

SET PAGESIZE 100
SET LINESIZE 200

PROMPT ============================================================
PROMPT 1. EmployeeCases CTE - Employee workload analysis
PROMPT ============================================================

-- EmployeeCases:
-- This CTE summarizes adoption workload for each employee.
-- It joins EMPLOYEE with PERSON for the employee name, then checks
-- ADOPTION_PROCESS and ADOPTION_MANAGEMENT to count assigned cases
-- and show a simple adoption status summary.
WITH EmployeeCases AS (
  SELECT
      e.person_id AS employee_id,
      p.first_name || ' ' || p.last_name AS employee_name,
      COUNT(ap.adoption_id) AS assigned_adoption_cases,
      SUM(CASE WHEN ap.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_cases,
      SUM(CASE WHEN ap.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_cases,
      SUM(CASE WHEN ap.status = 'ADOPTED' THEN 1 ELSE 0 END) AS completed_cases
  FROM employee e
  JOIN person p
    ON p.person_id = e.person_id
  LEFT JOIN adoption_process ap
    ON ap.employee_id = e.person_id
  LEFT JOIN adoption_management am
    ON am.adoption_id = ap.adoption_id
  GROUP BY
      e.person_id,
      p.first_name,
      p.last_name
)
SELECT
    employee_id,
    employee_name,
    assigned_adoption_cases,
    'Pending: ' || pending_cases ||
    ', Approved: ' || approved_cases ||
    ', Completed: ' || completed_cases AS adoption_status_summary
FROM EmployeeCases
ORDER BY assigned_adoption_cases DESC, employee_name;


PROMPT ============================================================
PROMPT 2. ShelterPetSummary CTE - Shelter and pet management
PROMPT ============================================================

-- ShelterPetSummary:
-- This CTE summarizes available and adopted local pets by shelter.
-- SHELTER has ROOM_TYPE instead of a separate shelter name column,
-- so ROOM_TYPE is shown as the shelter label.
-- LOCAL_PET is joined because adoption status is stored there.
-- For this simple report, total_pets is the sum of available and adopted pets
-- so the displayed total matches the visible status columns.
WITH ShelterPetSummary AS (
  SELECT
      s.shelter_id,
      s.room_type AS shelter_name,
      SUM(CASE WHEN lp.adoption_status IN ('AVAILABLE', 'ADOPTED') THEN 1 ELSE 0 END) AS total_pets,
      SUM(CASE WHEN lp.adoption_status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_pet_count,
      SUM(CASE WHEN lp.adoption_status = 'ADOPTED' THEN 1 ELSE 0 END) AS adopted_pet_count
  FROM shelter s
  LEFT JOIN pet_shelter ps
    ON ps.shelter_id = s.shelter_id
  LEFT JOIN pet p
    ON p.pet_id = ps.pet_id
  LEFT JOIN local_pet lp
    ON lp.pet_id = p.pet_id
  GROUP BY
      s.shelter_id,
      s.room_type
)
SELECT
    shelter_id,
    shelter_name,
    total_pets,
    available_pet_count,
    adopted_pet_count
FROM ShelterPetSummary
ORDER BY shelter_id;


PROMPT ============================================================
PROMPT 3. FinanceSummary CTE - Financial overview
PROMPT ============================================================

-- FinanceSummary:
-- These CTEs calculate total income, total expense and remaining balance.
-- INCOME stores all incoming money sources, EXPENSES stores outgoing money,
-- and FINANCE stores the organization's recorded finance balance.
WITH IncomeTotal AS (
  SELECT
      NVL(SUM(amount), 0) AS total_income
  FROM income
),
ExpenseTotal AS (
  SELECT
      NVL(SUM(amount), 0) AS total_expense
  FROM expenses
),
RecordedFinance AS (
  SELECT
      NVL(SUM(current_balance), 0) AS recorded_finance_balance
  FROM finance
)
SELECT
    i.total_income,
    e.total_expense,
    i.total_income - e.total_expense AS remaining_balance,
    f.recorded_finance_balance
FROM IncomeTotal i
CROSS JOIN ExpenseTotal e
CROSS JOIN RecordedFinance f;

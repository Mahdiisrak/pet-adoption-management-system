-- ============================================================
-- 05_advanced_queries.sql
-- Pet Adoption and Management System
-- 5 sample advanced queries for final DB application
-- Uses joins, grouping, aggregate functions, HAVING, and subqueries
-- ============================================================

-- ============================================================
-- QUERY 1
-- Completed adoption report with adopter, pet, and employee details
-- ============================================================

SELECT
    ap.ADOPTION_ID,
    TRIM(a_person.FIRST_NAME || ' ' || a_person.LAST_NAME) AS ADOPTER_NAME,
    p.PET_NAME,
    p.SPECIES,
    TRIM(e_person.FIRST_NAME || ' ' || e_person.LAST_NAME) AS EMPLOYEE_NAME,
    ap.APPLICATION_DATE,
    ap.COMPLETION_DATE,
    ap.ADOPTION_STATUS
FROM ADOPTION_PROCESS ap
JOIN ADOPTER a
    ON ap.ADOPTER_ID = a.ADOPTER_ID
JOIN PERSON a_person
    ON a.ADOPTER_ID = a_person.PERSON_ID
JOIN PET p
    ON ap.PET_ID = p.PET_ID
LEFT JOIN EMPLOYEE e
    ON ap.EMPLOYEE_ID = e.EMPLOYEE_ID
LEFT JOIN PERSON e_person
    ON e.EMPLOYEE_ID = e_person.PERSON_ID
WHERE ap.ADOPTION_STATUS = 'COMPLETED'
ORDER BY ap.COMPLETION_DATE DESC;


-- ============================================================
-- QUERY 2
-- Shelter occupancy report
-- Shows shelters currently holding one or more pets
-- ============================================================

SELECT
    s.SHELTER_ID,
    s.ROOM_TYPE,
    s.CAPACITY,
    COUNT(sa.PET_ID) AS CURRENT_PETS,
    s.CAPACITY - COUNT(sa.PET_ID) AS AVAILABLE_SPACE
FROM SHELTER s
JOIN SHELTER_ASSIGNMENT sa
    ON s.SHELTER_ID = sa.SHELTER_ID
WHERE sa.RELEASE_DATE IS NULL
GROUP BY
    s.SHELTER_ID,
    s.ROOM_TYPE,
    s.CAPACITY
HAVING COUNT(sa.PET_ID) > 0
ORDER BY CURRENT_PETS DESC;


-- ============================================================
-- QUERY 3
-- Complete medical history with doctor and prescribed medicine
-- ============================================================

SELECT
    p.PET_ID,
    p.PET_NAME,
    mr.RECORD_ID,
    mr.RECORD_DATE,
    mr.DIAGNOSIS,
    mr.TREATMENT,
    mr.HEALTH_STATUS,
    TRIM(dp.FIRST_NAME || ' ' || dp.LAST_NAME) AS DOCTOR_NAME,
    m.MEDICINE_NAME,
    pr.DOSAGE,
    pr.FREQUENCY,
    pr.DURATION_DAYS
FROM MEDICAL_RECORD mr
JOIN PET p
    ON mr.PET_ID = p.PET_ID
JOIN DOCTOR d
    ON mr.DOCTOR_ID = d.DOCTOR_ID
JOIN PERSON dp
    ON d.DOCTOR_ID = dp.PERSON_ID
LEFT JOIN PRESCRIPTION pr
    ON mr.RECORD_ID = pr.RECORD_ID
LEFT JOIN MEDICINE m
    ON pr.MEDICINE_ID = m.MEDICINE_ID
ORDER BY p.PET_ID, mr.RECORD_DATE DESC;


-- ============================================================
-- QUERY 4
-- Expense summary by source
-- Only shows categories whose total expense is greater than
-- the average expense amount of all expense records
-- ============================================================

SELECT
    SOURCE_NAME,
    COUNT(*) AS NUMBER_OF_EXPENSES,
    SUM(AMOUNT) AS TOTAL_EXPENSE,
    ROUND(AVG(AMOUNT), 2) AS AVERAGE_EXPENSE
FROM EXPENSE
GROUP BY SOURCE_NAME
HAVING SUM(AMOUNT) >
       (
           SELECT AVG(AMOUNT)
           FROM EXPENSE
       )
ORDER BY TOTAL_EXPENSE DESC;


-- ============================================================
-- QUERY 5
-- Donor / owner / income report through the ternary GIVES relation
-- ============================================================

SELECT
    g.INCOME_ID,
    TRIM(dp.FIRST_NAME || ' ' || dp.LAST_NAME) AS DONOR_NAME,
    d.OCCUPATION AS DONOR_OCCUPATION,
    TRIM(op.FIRST_NAME || ' ' || op.LAST_NAME) AS OWNER_NAME,
    o.OCCUPATION AS OWNER_OCCUPATION,
    i.INCOME_DATE,
    i.AMOUNT,
    i.INCOME_DESCRIPTION,
    i.INCOME_STATUS
FROM GIVES g
JOIN DONOR d
    ON g.DONOR_ID = d.DONOR_ID
JOIN PERSON dp
    ON d.DONOR_ID = dp.PERSON_ID
JOIN OWNER o
    ON g.OWNER_ID = o.OWNER_ID
JOIN PERSON op
    ON o.OWNER_ID = op.PERSON_ID
JOIN INCOME i
    ON g.INCOME_ID = i.INCOME_ID
WHERE i.AMOUNT >
      (
          SELECT AVG(AMOUNT)
          FROM INCOME
      )
ORDER BY i.AMOUNT DESC;

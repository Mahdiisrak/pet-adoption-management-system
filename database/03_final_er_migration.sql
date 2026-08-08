-- ============================================================
-- PET ADOPTION AND MANAGEMENT SYSTEM
-- FINAL ER MIGRATION - PHASE 1
-- Purpose:
--   Synchronize existing Oracle schema with the updated ERD
--   without immediately breaking existing backend/frontend code.
--
-- IMPORTANT:
--   Run this file ONCE on the existing project database.
-- ============================================================


-- ============================================================
-- 1. SYSTEM_USER
-- Remove Created_Date according to final ERD
-- ============================================================

ALTER TABLE SYSTEM_USER
DROP COLUMN CREATED_DATE;


-- ============================================================
-- 2. PERSON
-- Composite Name in ERD:
-- FIRST_NAME + LAST_NAME
--
-- Existing NAME is temporarily retained because current
-- backend/frontend queries still use PERSON.NAME.
-- ============================================================

ALTER TABLE PERSON
ADD (
    FIRST_NAME VARCHAR2(50),
    LAST_NAME  VARCHAR2(50),
    GENDER     VARCHAR2(10)
);


-- Split current NAME into FIRST_NAME and LAST_NAME.
-- Example:
-- "Mehrin Fatema" -> FIRST_NAME = Mehrin, LAST_NAME = Fatema

UPDATE PERSON
SET
    FIRST_NAME =
        CASE
            WHEN INSTR(TRIM(NAME), ' ') > 0
            THEN SUBSTR(TRIM(NAME), 1, INSTR(TRIM(NAME), ' ') - 1)
            ELSE TRIM(NAME)
        END,

    LAST_NAME =
        CASE
            WHEN INSTR(TRIM(NAME), ' ') > 0
            THEN SUBSTR(
                TRIM(NAME),
                INSTR(TRIM(NAME), ' ') + 1
            )
            ELSE '-'
        END;


-- ============================================================
-- 3. MULTIVALUED PERSON PHONE
-- ERD: Phone_Number is multivalued.
-- Therefore use a separate relation/table.
--
-- Existing PERSON.PHONE_NO is temporarily retained so existing
-- application code does not break yet.
-- ============================================================

CREATE TABLE PERSON_PHONE (
    PERSON_ID VARCHAR2(12) NOT NULL,
    PHONE_NO  VARCHAR2(20) NOT NULL,

    CONSTRAINT PERSON_PHONE_PK
        PRIMARY KEY (PERSON_ID, PHONE_NO),

    CONSTRAINT PERSON_PHONE_PERSON_FK
        FOREIGN KEY (PERSON_ID)
        REFERENCES PERSON(PERSON_ID)
);


INSERT INTO PERSON_PHONE (PERSON_ID, PHONE_NO)
SELECT PERSON_ID, PHONE_NO
FROM PERSON
WHERE PHONE_NO IS NOT NULL;


-- ============================================================
-- 4. EMERGENCY_CONTACT - WEAK ENTITY
--
-- Final ERD:
-- PERSON_ID    = owner entity key
-- CONTACT_NO   = partial key
--
-- Composite PK:
-- (PERSON_ID, CONTACT_NO)
--
-- Existing CONTACT_ID is removed.
-- ============================================================

ALTER TABLE EMERGENCY_CONTACT
DROP PRIMARY KEY;


ALTER TABLE EMERGENCY_CONTACT
ADD CONTACT_NO NUMBER(4);


-- Current demo database has one emergency contact per person.
-- Give the existing records partial key 1.
UPDATE EMERGENCY_CONTACT
SET CONTACT_NO = 1
WHERE CONTACT_NO IS NULL;


ALTER TABLE EMERGENCY_CONTACT
MODIFY CONTACT_NO NOT NULL;


ALTER TABLE EMERGENCY_CONTACT
DROP COLUMN CONTACT_ID;


ALTER TABLE EMERGENCY_CONTACT
ADD CONSTRAINT EMERGENCY_CONTACT_PK
PRIMARY KEY (PERSON_ID, CONTACT_NO);


-- ============================================================
-- 5. OWNER
-- OWNER_TYPE -> OCCUPATION
-- ============================================================

ALTER TABLE OWNER
RENAME COLUMN OWNER_TYPE TO OCCUPATION;

-- OWNER_TYPE had a CHECK constraint for values such as
-- INDIVIDUAL/ORGANIZATION. It is no longer valid because
-- OCCUPATION is now free-text.
ALTER TABLE OWNER
DROP CONSTRAINT OWNER_OWNER_TYPE_CK;


-- Existing values such as INDIVIDUAL describe the old type,
-- not an occupation. Use a neutral placeholder for old demo data.
UPDATE OWNER
SET OCCUPATION = 'Not Specified';


ALTER TABLE OWNER
MODIFY OCCUPATION VARCHAR2(60);


-- ============================================================
-- 6. DONOR
--
-- Remove DONOR_TYPE
-- Add OCCUPATION and AMOUNT
--
-- Existing donation value will be copied before DONATION
-- table is removed.
-- ============================================================

ALTER TABLE DONOR
ADD (
    OCCUPATION VARCHAR2(60),
    AMOUNT     NUMBER(12,2)
);


UPDATE DONOR d
SET AMOUNT = (
    SELECT SUM(dn.AMOUNT)
    FROM DONATION dn
    WHERE dn.DONOR_ID = d.DONOR_ID
);


UPDATE DONOR
SET OCCUPATION = 'Not Specified'
WHERE OCCUPATION IS NULL;


ALTER TABLE DONOR
DROP COLUMN DONOR_TYPE;


-- ============================================================
-- 7. GIVES TERNARY RELATION
--
-- Final ERD shows:
-- OWNER + DONOR + INCOME -> GIVES
--
-- This relationship table implements that ternary relation.
-- ============================================================

CREATE TABLE GIVES (
    OWNER_ID  VARCHAR2(12) NOT NULL,
    DONOR_ID  VARCHAR2(12) NOT NULL,
    INCOME_ID VARCHAR2(12) NOT NULL,

    CONSTRAINT GIVES_PK
        PRIMARY KEY (OWNER_ID, DONOR_ID, INCOME_ID),

    CONSTRAINT GIVES_OWNER_FK
        FOREIGN KEY (OWNER_ID)
        REFERENCES OWNER(OWNER_ID),

    CONSTRAINT GIVES_DONOR_FK
        FOREIGN KEY (DONOR_ID)
        REFERENCES DONOR(DONOR_ID),

    CONSTRAINT GIVES_INCOME_FK
        FOREIGN KEY (INCOME_ID)
        REFERENCES INCOME(INCOME_ID)
);


-- Existing demo data:
-- P005 currently exists as both Owner and Donor,
-- and DN001 generated IN001.
INSERT INTO GIVES (OWNER_ID, DONOR_ID, INCOME_ID)
SELECT
    dn.DONOR_ID,
    dn.DONOR_ID,
    i.INCOME_ID
FROM DONATION dn
JOIN INCOME i
    ON i.DONATION_ID = dn.DONATION_ID
WHERE EXISTS (
    SELECT 1
    FROM OWNER o
    WHERE o.OWNER_ID = dn.DONOR_ID
);


-- ============================================================
-- 8. REMOVE DONATION ENTITY
--
-- GIVES and INCOME now preserve the required financial relation.
-- CASCADE CONSTRAINTS removes FK constraints referring to DONATION.
-- ============================================================

DROP TABLE DONATION CASCADE CONSTRAINTS;


ALTER TABLE INCOME
DROP COLUMN DONATION_ID;


-- ============================================================
-- 9. SHELTER
--
-- Add ROOM_TYPE.
-- Remove Shelter Name and Location according to final ERD.
-- Other existing operational attributes remain for now.
-- ============================================================

ALTER TABLE SHELTER
ADD ROOM_TYPE VARCHAR2(40);


UPDATE SHELTER
SET ROOM_TYPE = 'GENERAL'
WHERE ROOM_TYPE IS NULL;


ALTER TABLE SHELTER
MODIFY ROOM_TYPE NOT NULL;


ALTER TABLE SHELTER
DROP COLUMN SHELTER_NAME;


ALTER TABLE SHELTER
DROP COLUMN LOCATION;


-- ============================================================
-- 10. EMPLOYEE SALARY
-- ============================================================

ALTER TABLE EMPLOYEE
ADD SALARY NUMBER(12,2);


-- ============================================================
-- 11. SUPERVISOR SALARY
-- ============================================================

ALTER TABLE SUPERVISOR
ADD SALARY NUMBER(12,2);


-- ============================================================
-- 12. DOCTOR SALARY
-- ============================================================

ALTER TABLE DOCTOR
ADD SALARY NUMBER(12,2);


-- ============================================================
-- 13. VACCINATION PRICE
-- VACCINATION_DATE already represents Vaccine_Date.
-- ============================================================

ALTER TABLE VACCINATION
ADD VACCINE_PRICE NUMBER(12,2);


-- ============================================================
-- 14. MEDICINE PRICE
--
-- Final ERD calls the attribute PRICE.
-- Rename UNIT_PRICE to PRICE.
-- Doctor API/frontend will be updated after this migration.
-- ============================================================

ALTER TABLE MEDICINE
RENAME COLUMN UNIT_PRICE TO PRICE;



-- ============================================================
-- 15. MEDICAL RECORD HEALTH STATUS
-- Current implementation uses NOTES for the pet's health note.
-- Final ERD names this attribute HEALTH_STATUS.
-- ============================================================

ALTER TABLE MEDICAL_RECORD
RENAME COLUMN NOTES TO HEALTH_STATUS;


-- ============================================================
-- 16. EXPENSE SOURCE NAME
-- Actual table name in the current database is EXPENSE.
-- Final ERD renames EXPENSE_TYPE to SOURCE_NAME.
-- ============================================================

ALTER TABLE EXPENSE
RENAME COLUMN EXPENSE_TYPE TO SOURCE_NAME;

COMMIT;


-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT PERSON_ID, NAME, FIRST_NAME, LAST_NAME, DATE_OF_BIRTH, GENDER
FROM PERSON
ORDER BY PERSON_ID;


SELECT *
FROM PERSON_PHONE
ORDER BY PERSON_ID, PHONE_NO;


SELECT *
FROM EMERGENCY_CONTACT
ORDER BY PERSON_ID, CONTACT_NO;


SELECT *
FROM OWNER;


SELECT *
FROM DONOR;


SELECT *
FROM GIVES;


SELECT *
FROM INCOME;


SELECT *
FROM SHELTER;


SELECT *
FROM EMPLOYEE;


SELECT *
FROM SUPERVISOR;


SELECT *
FROM DOCTOR;


SELECT *
FROM MEDICINE;


SELECT *
FROM VACCINATION;


-- ============================================================
-- PENDING FINAL CLEANUP
--
-- Do NOT execute these yet.
-- Existing application code must be updated first.
--
-- Later:
--   ALTER TABLE PERSON DROP COLUMN NAME;
--   ALTER TABLE PERSON DROP COLUMN PHONE_NO;
--
-- Also pending:
--   Health_Note -> Health_Status
--   Expense_Type -> Source_Name
-- because their actual current table/column names must first
-- be identified.
-- ============================================================

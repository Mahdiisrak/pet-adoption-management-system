-- ============================================================
-- POST FINAL-ER MIGRATION FIX
-- Fixes old OWNER_TYPE check constraint after OWNER_TYPE
-- was renamed to OCCUPATION.
-- ============================================================

ALTER TABLE OWNER
DROP CONSTRAINT OWNER_OWNER_TYPE_CK;

UPDATE OWNER
SET OCCUPATION = 'Not Specified'
WHERE OCCUPATION IS NULL
   OR OCCUPATION IN ('INDIVIDUAL', 'ORGANIZATION');

COMMIT;

SELECT *
FROM OWNER;

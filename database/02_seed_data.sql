-- ============================================================
-- 02_seed_data.sql
-- Pet Adoption and Management System
-- Demo data for all 28 tables
-- Designed for a fresh database created by 01_schema.sql
-- ============================================================

-- ============================================================
-- 1. PERSON
-- ============================================================

INSERT INTO PERSON (PERSON_ID, EMAIL, ADDRESS, DATE_OF_BIRTH, FIRST_NAME, LAST_NAME, GENDER)
VALUES ('ADM001', 'admin@petcare.com', 'Dhaka', TO_DATE('1990-01-10','YYYY-MM-DD'), 'System', 'Admin', 'MALE');

INSERT INTO PERSON VALUES ('E001', 'e001@petcare.com', 'Dhaka', TO_DATE('1998-03-12','YYYY-MM-DD'), 'Rahim', 'Ahmed', 'MALE');
INSERT INTO PERSON VALUES ('E002', 'e002@petcare.com', 'Dhaka', TO_DATE('1997-06-20','YYYY-MM-DD'), 'Karim', 'Hasan', 'MALE');
INSERT INTO PERSON VALUES ('E003', 'e003@petcare.com', 'Savar', TO_DATE('1999-09-15','YYYY-MM-DD'), 'Nadia', 'Islam', 'FEMALE');
INSERT INTO PERSON VALUES ('E004', 'e004@petcare.com', 'Mirpur', TO_DATE('1996-11-05','YYYY-MM-DD'), 'Sadia', 'Akter', 'FEMALE');
INSERT INTO PERSON VALUES ('E005', 'e005@petcare.com', 'Uttara', TO_DATE('2000-04-18','YYYY-MM-DD'), 'Tanvir', 'Hossain', 'MALE');

INSERT INTO PERSON VALUES ('S001', 's001@petcare.com', 'Dhaka', TO_DATE('1992-02-14','YYYY-MM-DD'), 'Mehrin', 'Fatema', 'FEMALE');
INSERT INTO PERSON VALUES ('S002', 's002@petcare.com', 'Dhaka', TO_DATE('1991-08-09','YYYY-MM-DD'), 'Arif', 'Mahmud', 'MALE');
INSERT INTO PERSON VALUES ('S003', 's003@petcare.com', 'Savar', TO_DATE('1993-01-21','YYYY-MM-DD'), 'Rupa', 'Sultana', 'FEMALE');
INSERT INTO PERSON VALUES ('S004', 's004@petcare.com', 'Mirpur', TO_DATE('1990-12-02','YYYY-MM-DD'), 'Fahim', 'Khan', 'MALE');
INSERT INTO PERSON VALUES ('S005', 's005@petcare.com', 'Uttara', TO_DATE('1994-07-17','YYYY-MM-DD'), 'Mim', 'Akter', 'FEMALE');

INSERT INTO PERSON VALUES ('D001', 'd001@petcare.com', 'Dhaka', TO_DATE('1989-05-10','YYYY-MM-DD'), 'Mosabbir', 'Hossain', 'MALE');
INSERT INTO PERSON VALUES ('D002', 'd002@petcare.com', 'Dhaka', TO_DATE('1988-10-23','YYYY-MM-DD'), 'Nusrat', 'Jahan', 'FEMALE');
INSERT INTO PERSON VALUES ('D003', 'd003@petcare.com', 'Savar', TO_DATE('1991-03-30','YYYY-MM-DD'), 'Imran', 'Kabir', 'MALE');
INSERT INTO PERSON VALUES ('D004', 'd004@petcare.com', 'Mirpur', TO_DATE('1990-06-11','YYYY-MM-DD'), 'Shila', 'Rahman', 'FEMALE');
INSERT INTO PERSON VALUES ('D005', 'd005@petcare.com', 'Uttara', TO_DATE('1987-09-25','YYYY-MM-DD'), 'Hasan', 'Ali', 'MALE');

INSERT INTO PERSON VALUES ('V001', 'v001@petcare.com', 'Dhaka', TO_DATE('2001-02-01','YYYY-MM-DD'), 'Rafi', 'Islam', 'MALE');
INSERT INTO PERSON VALUES ('V002', 'v002@petcare.com', 'Dhaka', TO_DATE('2002-05-06','YYYY-MM-DD'), 'Tania', 'Noor', 'FEMALE');
INSERT INTO PERSON VALUES ('V003', 'v003@petcare.com', 'Savar', TO_DATE('2000-08-18','YYYY-MM-DD'), 'Sohan', 'Ahmed', 'MALE');
INSERT INTO PERSON VALUES ('V004', 'v004@petcare.com', 'Mirpur', TO_DATE('1999-11-22','YYYY-MM-DD'), 'Mitu', 'Das', 'FEMALE');
INSERT INTO PERSON VALUES ('V005', 'v005@petcare.com', 'Uttara', TO_DATE('2001-12-14','YYYY-MM-DD'), 'Nayeem', 'Khan', 'MALE');

INSERT INTO PERSON VALUES ('O001', 'o001@mail.com', 'Dhaka', TO_DATE('1985-03-03','YYYY-MM-DD'), 'Nitun', 'Kundu', 'MALE');
INSERT INTO PERSON VALUES ('O002', 'o002@mail.com', 'Dhaka', TO_DATE('1986-04-04','YYYY-MM-DD'), 'Shamima', 'Begum', 'FEMALE');
INSERT INTO PERSON VALUES ('O003', 'o003@mail.com', 'Savar', TO_DATE('1984-05-05','YYYY-MM-DD'), 'Rashed', 'Karim', 'MALE');
INSERT INTO PERSON VALUES ('O004', 'o004@mail.com', 'Mirpur', TO_DATE('1988-06-06','YYYY-MM-DD'), 'Lamia', 'Noor', 'FEMALE');
INSERT INTO PERSON VALUES ('O005', 'o005@mail.com', 'Uttara', TO_DATE('1987-07-07','YYYY-MM-DD'), 'Sabbir', 'Haque', 'MALE');

INSERT INTO PERSON VALUES ('N001', 'n001@mail.com', 'Dhaka', TO_DATE('1982-01-05','YYYY-MM-DD'), 'Donor', 'One', 'MALE');
INSERT INTO PERSON VALUES ('N002', 'n002@mail.com', 'Dhaka', TO_DATE('1983-02-06','YYYY-MM-DD'), 'Donor', 'Two', 'FEMALE');
INSERT INTO PERSON VALUES ('N003', 'n003@mail.com', 'Savar', TO_DATE('1984-03-07','YYYY-MM-DD'), 'Donor', 'Three', 'MALE');
INSERT INTO PERSON VALUES ('N004', 'n004@mail.com', 'Mirpur', TO_DATE('1985-04-08','YYYY-MM-DD'), 'Donor', 'Four', 'FEMALE');
INSERT INTO PERSON VALUES ('N005', 'n005@mail.com', 'Uttara', TO_DATE('1986-05-09','YYYY-MM-DD'), 'Donor', 'Five', 'MALE');

INSERT INTO PERSON VALUES ('A001', 'a001@mail.com', 'Dhaka', TO_DATE('1995-01-11','YYYY-MM-DD'), 'Adopter', 'One', 'MALE');
INSERT INTO PERSON VALUES ('A002', 'a002@mail.com', 'Dhaka', TO_DATE('1996-02-12','YYYY-MM-DD'), 'Adopter', 'Two', 'FEMALE');
INSERT INTO PERSON VALUES ('A003', 'a003@mail.com', 'Savar', TO_DATE('1994-03-13','YYYY-MM-DD'), 'Adopter', 'Three', 'MALE');
INSERT INTO PERSON VALUES ('A004', 'a004@mail.com', 'Mirpur', TO_DATE('1997-04-14','YYYY-MM-DD'), 'Adopter', 'Four', 'FEMALE');
INSERT INTO PERSON VALUES ('A005', 'a005@mail.com', 'Uttara', TO_DATE('1993-05-15','YYYY-MM-DD'), 'Adopter', 'Five', 'MALE');

-- ============================================================
-- 2. PERSON_PHONE
-- ============================================================

INSERT INTO PERSON_PHONE VALUES ('ADM001', '01700000000');
INSERT INTO PERSON_PHONE VALUES ('E001', '01700000001');
INSERT INTO PERSON_PHONE VALUES ('E002', '01700000002');
INSERT INTO PERSON_PHONE VALUES ('E003', '01700000003');
INSERT INTO PERSON_PHONE VALUES ('E004', '01700000004');
INSERT INTO PERSON_PHONE VALUES ('E005', '01700000005');
INSERT INTO PERSON_PHONE VALUES ('S001', '01700000101');
INSERT INTO PERSON_PHONE VALUES ('S002', '01700000102');
INSERT INTO PERSON_PHONE VALUES ('S003', '01700000103');
INSERT INTO PERSON_PHONE VALUES ('S004', '01700000104');
INSERT INTO PERSON_PHONE VALUES ('S005', '01700000105');
INSERT INTO PERSON_PHONE VALUES ('D001', '01700000201');
INSERT INTO PERSON_PHONE VALUES ('D002', '01700000202');
INSERT INTO PERSON_PHONE VALUES ('D003', '01700000203');
INSERT INTO PERSON_PHONE VALUES ('D004', '01700000204');
INSERT INTO PERSON_PHONE VALUES ('D005', '01700000205');
INSERT INTO PERSON_PHONE VALUES ('V001', '01700000301');
INSERT INTO PERSON_PHONE VALUES ('V002', '01700000302');
INSERT INTO PERSON_PHONE VALUES ('V003', '01700000303');
INSERT INTO PERSON_PHONE VALUES ('V004', '01700000304');
INSERT INTO PERSON_PHONE VALUES ('V005', '01700000305');
INSERT INTO PERSON_PHONE VALUES ('O001', '01700000401');
INSERT INTO PERSON_PHONE VALUES ('O002', '01700000402');
INSERT INTO PERSON_PHONE VALUES ('O003', '01700000403');
INSERT INTO PERSON_PHONE VALUES ('O004', '01700000404');
INSERT INTO PERSON_PHONE VALUES ('O005', '01700000405');
INSERT INTO PERSON_PHONE VALUES ('N001', '01700000501');
INSERT INTO PERSON_PHONE VALUES ('N002', '01700000502');
INSERT INTO PERSON_PHONE VALUES ('N003', '01700000503');
INSERT INTO PERSON_PHONE VALUES ('N004', '01700000504');
INSERT INTO PERSON_PHONE VALUES ('N005', '01700000505');
INSERT INTO PERSON_PHONE VALUES ('A001', '01700000601');
INSERT INTO PERSON_PHONE VALUES ('A002', '01700000602');
INSERT INTO PERSON_PHONE VALUES ('A003', '01700000603');
INSERT INTO PERSON_PHONE VALUES ('A004', '01700000604');
INSERT INTO PERSON_PHONE VALUES ('A005', '01700000605');

-- ============================================================
-- 3. EMPLOYEE
-- ============================================================

INSERT INTO EMPLOYEE VALUES ('E001', TO_DATE('2024-01-10','YYYY-MM-DD'), 'Pet Care Employee', 'ACTIVE', 30000);
INSERT INTO EMPLOYEE VALUES ('E002', TO_DATE('2024-02-12','YYYY-MM-DD'), 'Adoption Officer', 'ACTIVE', 32000);
INSERT INTO EMPLOYEE VALUES ('E003', TO_DATE('2024-03-15','YYYY-MM-DD'), 'Rescue Coordinator', 'ACTIVE', 31000);
INSERT INTO EMPLOYEE VALUES ('E004', TO_DATE('2024-04-20','YYYY-MM-DD'), 'Front Desk Employee', 'ACTIVE', 28000);
INSERT INTO EMPLOYEE VALUES ('E005', TO_DATE('2024-05-18','YYYY-MM-DD'), 'Animal Care Employee', 'ACTIVE', 30000);

INSERT INTO EMPLOYEE VALUES ('S001', TO_DATE('2022-01-10','YYYY-MM-DD'), 'Shelter Supervisor', 'ACTIVE', 50000);
INSERT INTO EMPLOYEE VALUES ('S002', TO_DATE('2022-02-10','YYYY-MM-DD'), 'Shelter Supervisor', 'ACTIVE', 51000);
INSERT INTO EMPLOYEE VALUES ('S003', TO_DATE('2022-03-10','YYYY-MM-DD'), 'Shelter Supervisor', 'ACTIVE', 52000);
INSERT INTO EMPLOYEE VALUES ('S004', TO_DATE('2022-04-10','YYYY-MM-DD'), 'Shelter Supervisor', 'ACTIVE', 53000);
INSERT INTO EMPLOYEE VALUES ('S005', TO_DATE('2022-05-10','YYYY-MM-DD'), 'Shelter Supervisor', 'ACTIVE', 54000);

INSERT INTO EMPLOYEE VALUES ('D001', TO_DATE('2021-01-10','YYYY-MM-DD'), 'Veterinary Doctor', 'ACTIVE', 70000);
INSERT INTO EMPLOYEE VALUES ('D002', TO_DATE('2021-02-10','YYYY-MM-DD'), 'Veterinary Doctor', 'ACTIVE', 72000);
INSERT INTO EMPLOYEE VALUES ('D003', TO_DATE('2021-03-10','YYYY-MM-DD'), 'Veterinary Doctor', 'ACTIVE', 71000);
INSERT INTO EMPLOYEE VALUES ('D004', TO_DATE('2021-04-10','YYYY-MM-DD'), 'Veterinary Doctor', 'ACTIVE', 73000);
INSERT INTO EMPLOYEE VALUES ('D005', TO_DATE('2021-05-10','YYYY-MM-DD'), 'Veterinary Doctor', 'ACTIVE', 74000);

-- ============================================================
-- 4. SUPERVISOR
-- ============================================================

INSERT INTO SUPERVISOR VALUES ('S001', TO_DATE('2023-01-01','YYYY-MM-DD'), 50000);
INSERT INTO SUPERVISOR VALUES ('S002', TO_DATE('2023-02-01','YYYY-MM-DD'), 51000);
INSERT INTO SUPERVISOR VALUES ('S003', TO_DATE('2023-03-01','YYYY-MM-DD'), 52000);
INSERT INTO SUPERVISOR VALUES ('S004', TO_DATE('2023-04-01','YYYY-MM-DD'), 53000);
INSERT INTO SUPERVISOR VALUES ('S005', TO_DATE('2023-05-01','YYYY-MM-DD'), 54000);

-- ============================================================
-- 5. DOCTOR
-- ============================================================

INSERT INTO DOCTOR VALUES ('D001', 'VET-LIC-001', 'Surgery', 70000);
INSERT INTO DOCTOR VALUES ('D002', 'VET-LIC-002', 'Internal Medicine', 72000);
INSERT INTO DOCTOR VALUES ('D003', 'VET-LIC-003', 'Dermatology', 71000);
INSERT INTO DOCTOR VALUES ('D004', 'VET-LIC-004', 'Emergency Care', 73000);
INSERT INTO DOCTOR VALUES ('D005', 'VET-LIC-005', 'General Veterinary', 74000);

-- ============================================================
-- 6. VOLUNTEER
-- ============================================================

INSERT INTO VOLUNTEER VALUES ('V001', TO_DATE('2025-01-10','YYYY-MM-DD'), 'AVAILABLE');
INSERT INTO VOLUNTEER VALUES ('V002', TO_DATE('2025-02-10','YYYY-MM-DD'), 'ON_DUTY');
INSERT INTO VOLUNTEER VALUES ('V003', TO_DATE('2025-03-10','YYYY-MM-DD'), 'AVAILABLE');
INSERT INTO VOLUNTEER VALUES ('V004', TO_DATE('2025-04-10','YYYY-MM-DD'), 'UNAVAILABLE');
INSERT INTO VOLUNTEER VALUES ('V005', TO_DATE('2025-05-10','YYYY-MM-DD'), 'AVAILABLE');

-- ============================================================
-- 7. OWNER
-- ============================================================

INSERT INTO OWNER VALUES ('O001', 'Businessman');
INSERT INTO OWNER VALUES ('O002', 'Teacher');
INSERT INTO OWNER VALUES ('O003', 'Engineer');
INSERT INTO OWNER VALUES ('O004', 'Banker');
INSERT INTO OWNER VALUES ('O005', 'Designer');

-- ============================================================
-- 8. DONOR
-- ============================================================

INSERT INTO DONOR VALUES ('N001', TO_DATE('2025-01-01','YYYY-MM-DD'), 'ACTIVE', 'Businessman', 5000);
INSERT INTO DONOR VALUES ('N002', TO_DATE('2025-02-01','YYYY-MM-DD'), 'ACTIVE', 'Teacher', 3500);
INSERT INTO DONOR VALUES ('N003', TO_DATE('2025-03-01','YYYY-MM-DD'), 'ACTIVE', 'Engineer', 7000);
INSERT INTO DONOR VALUES ('N004', TO_DATE('2025-04-01','YYYY-MM-DD'), 'ACTIVE', 'Doctor', 4500);
INSERT INTO DONOR VALUES ('N005', TO_DATE('2025-05-01','YYYY-MM-DD'), 'ACTIVE', 'Banker', 6000);

-- ============================================================
-- 9. ADOPTER
-- ============================================================

INSERT INTO ADOPTER VALUES ('A001', TO_DATE('2025-01-05','YYYY-MM-DD'), 'Teacher', 'ACTIVE');
INSERT INTO ADOPTER VALUES ('A002', TO_DATE('2025-02-05','YYYY-MM-DD'), 'Engineer', 'ACTIVE');
INSERT INTO ADOPTER VALUES ('A003', TO_DATE('2025-03-05','YYYY-MM-DD'), 'Businessman', 'ACTIVE');
INSERT INTO ADOPTER VALUES ('A004', TO_DATE('2025-04-05','YYYY-MM-DD'), 'Banker', 'ACTIVE');
INSERT INTO ADOPTER VALUES ('A005', TO_DATE('2025-05-05','YYYY-MM-DD'), 'Designer', 'ACTIVE');

-- ============================================================
-- 10. SYSTEM_USER
-- Passwords:
-- admin / admin123
-- supervisor / supervisor123
-- doctor / doctor123
-- employee / employee123
-- employee2 / employee456
-- ============================================================

INSERT INTO SYSTEM_USER VALUES ('U001', 'ADM001', 'admin',
'$2b$10$qT67fY.JeJ/BC/i1DuupLe3vR53NjcKeFexqq.jIOMEf7QXn/S4.C',
'ADMIN', 'ACTIVE');

INSERT INTO SYSTEM_USER VALUES ('U002', 'S001', 'supervisor',
'$2b$10$3XonjkLbvZqDYeW3CD/JeOLov7DkG/1kk905yPJrOLZIJWlx5hl22',
'SUPERVISOR', 'ACTIVE');

INSERT INTO SYSTEM_USER VALUES ('U003', 'D001', 'doctor',
'$2b$10$C9LY8vIBLMP05enYO9urMOCkLUEs5dFFvCgEo6jUi/J5trsWJ1SY6',
'DOCTOR', 'ACTIVE');

INSERT INTO SYSTEM_USER VALUES ('U004', 'E001', 'employee',
'$2b$10$4he7NbEvyXSsHhvWokBdyut20vd5WwYasW0J0RYl31jRrEkLIK8RC',
'EMPLOYEE', 'ACTIVE');

INSERT INTO SYSTEM_USER VALUES ('U005', 'E002', 'employee2',
'$2b$10$BRuzY1OzV8OEIK3rYZiNpu.Oli56DW.KSdWtzB5gvwFmaFsS6FYvC',
'EMPLOYEE', 'ACTIVE');

-- ============================================================
-- 11. EMERGENCY_CONTACT
-- CONTACT_NO is the partial key
-- ============================================================

INSERT INTO EMERGENCY_CONTACT VALUES ('E001', 'Abdul Rahman', 'Father', '01810000001', 1);
INSERT INTO EMERGENCY_CONTACT VALUES ('E002', 'Salma Begum', 'Mother', '01810000002', 1);
INSERT INTO EMERGENCY_CONTACT VALUES ('E003', 'Nabila Islam', 'Sister', '01810000003', 1);
INSERT INTO EMERGENCY_CONTACT VALUES ('E004', 'Kamal Hossain', 'Brother', '01810000004', 1);
INSERT INTO EMERGENCY_CONTACT VALUES ('E005', 'Ayesha Akter', 'Mother', '01810000005', 1);

-- ============================================================
-- 12. SHELTER
-- ============================================================

INSERT INTO SHELTER VALUES ('SH001', 50, 'S001', 'ACTIVE', 'GENERAL');
INSERT INTO SHELTER VALUES ('SH002', 40, 'S002', 'ACTIVE', 'DOG');
INSERT INTO SHELTER VALUES ('SH003', 35, 'S003', 'ACTIVE', 'CAT');
INSERT INTO SHELTER VALUES ('SH004', 30, 'S004', 'ACTIVE', 'MEDICAL');
INSERT INTO SHELTER VALUES ('SH005', 25, 'S005', 'MAINTENANCE', 'QUARANTINE');

-- ============================================================
-- 13. PET
-- 5 local pets + 5 guest pets
-- ============================================================

INSERT INTO PET VALUES ('LP001', 'Mimi', 'Cat', 'Persian', 'FEMALE', TO_DATE('2023-01-10','YYYY-MM-DD'), 'White', 4.20, 'AVAILABLE', NULL, NULL);
INSERT INTO PET VALUES ('LP002', 'Bruno', 'Dog', 'Labrador', 'MALE', TO_DATE('2022-05-15','YYYY-MM-DD'), 'Brown', 22.50, 'AVAILABLE', NULL, NULL);
INSERT INTO PET VALUES ('LP003', 'Luna', 'Cat', 'Domestic Shorthair', 'FEMALE', TO_DATE('2024-02-20','YYYY-MM-DD'), 'Black', 3.80, 'RESCUED', NULL, NULL);
INSERT INTO PET VALUES ('LP004', 'Max', 'Dog', 'German Shepherd', 'MALE', TO_DATE('2021-08-12','YYYY-MM-DD'), 'Black', 28.40, 'TREATMENT', NULL, NULL);
INSERT INTO PET VALUES ('LP005', 'Coco', 'Rabbit', 'Dutch', 'FEMALE', TO_DATE('2024-03-05','YYYY-MM-DD'), 'White', 2.10, 'AVAILABLE', NULL, NULL);

INSERT INTO PET VALUES ('GP001', 'Rocky', 'Dog', 'Beagle', 'MALE', TO_DATE('2022-06-11','YYYY-MM-DD'), 'Brown', 12.50, 'GUEST', NULL, 'O001');
INSERT INTO PET VALUES ('GP002', 'Bella', 'Cat', 'Siamese', 'FEMALE', TO_DATE('2023-07-12','YYYY-MM-DD'), 'Cream', 4.10, 'GUEST', NULL, 'O002');
INSERT INTO PET VALUES ('GP003', 'Charlie', 'Dog', 'Poodle', 'MALE', TO_DATE('2021-09-17','YYYY-MM-DD'), 'White', 10.20, 'GUEST', NULL, 'O003');
INSERT INTO PET VALUES ('GP004', 'Lucy', 'Cat', 'Bengal', 'FEMALE', TO_DATE('2022-10-10','YYYY-MM-DD'), 'Golden', 4.90, 'GUEST', NULL, 'O004');
INSERT INTO PET VALUES ('GP005', 'Leo', 'Dog', 'Shih Tzu', 'MALE', TO_DATE('2023-11-21','YYYY-MM-DD'), 'Black', 7.40, 'GUEST', NULL, 'O005');

-- ============================================================
-- 14. LOCAL_PET
-- ============================================================

INSERT INTO LOCAL_PET VALUES ('LP001', TO_DATE('2025-01-05','YYYY-MM-DD'), 'AVAILABLE');
INSERT INTO LOCAL_PET VALUES ('LP002', TO_DATE('2025-01-15','YYYY-MM-DD'), 'PENDING');
INSERT INTO LOCAL_PET VALUES ('LP003', TO_DATE('2025-02-10','YYYY-MM-DD'), 'AVAILABLE');
INSERT INTO LOCAL_PET VALUES ('LP004', TO_DATE('2025-03-01','YYYY-MM-DD'), 'NOT_AVAILABLE');
INSERT INTO LOCAL_PET VALUES ('LP005', TO_DATE('2025-03-20','YYYY-MM-DD'), 'ADOPTED');

-- ============================================================
-- 15. GUEST_PET
-- ============================================================

INSERT INTO GUEST_PET VALUES ('GP001', TO_DATE('2026-08-01','YYYY-MM-DD'), NULL, 'CHECKED_IN', 'O001');
INSERT INTO GUEST_PET VALUES ('GP002', TO_DATE('2026-08-02','YYYY-MM-DD'), TO_DATE('2026-08-07','YYYY-MM-DD'), 'CHECKED_OUT', 'O002');
INSERT INTO GUEST_PET VALUES ('GP003', TO_DATE('2026-08-03','YYYY-MM-DD'), NULL, 'EXTENDED', 'O003');
INSERT INTO GUEST_PET VALUES ('GP004', TO_DATE('2026-08-04','YYYY-MM-DD'), NULL, 'CHECKED_IN', 'O004');
INSERT INTO GUEST_PET VALUES ('GP005', TO_DATE('2026-08-05','YYYY-MM-DD'), NULL, 'CHECKED_IN', 'O005');

-- ============================================================
-- 16. SHELTER_ASSIGNMENT
-- ============================================================

INSERT INTO SHELTER_ASSIGNMENT VALUES ('LP001', 'SH001', TO_DATE('2025-01-05','YYYY-MM-DD'), NULL);
INSERT INTO SHELTER_ASSIGNMENT VALUES ('LP002', 'SH002', TO_DATE('2025-01-15','YYYY-MM-DD'), NULL);
INSERT INTO SHELTER_ASSIGNMENT VALUES ('LP003', 'SH003', TO_DATE('2025-02-10','YYYY-MM-DD'), NULL);
INSERT INTO SHELTER_ASSIGNMENT VALUES ('LP004', 'SH004', TO_DATE('2025-03-01','YYYY-MM-DD'), NULL);
INSERT INTO SHELTER_ASSIGNMENT VALUES ('LP005', 'SH001', TO_DATE('2025-03-20','YYYY-MM-DD'), TO_DATE('2025-07-01','YYYY-MM-DD'));

-- ============================================================
-- 17. ADOPTION_PROCESS
-- ============================================================

INSERT INTO ADOPTION_PROCESS VALUES ('AD001', 'A001', 'LP001', 'E001', TO_DATE('2025-04-01','YYYY-MM-DD'), NULL, 'PENDING');
INSERT INTO ADOPTION_PROCESS VALUES ('AD002', 'A002', 'LP002', 'E002', TO_DATE('2025-04-05','YYYY-MM-DD'), NULL, 'APPROVED');
INSERT INTO ADOPTION_PROCESS VALUES ('AD003', 'A003', 'LP003', 'E003', TO_DATE('2025-04-10','YYYY-MM-DD'), TO_DATE('2025-04-20','YYYY-MM-DD'), 'COMPLETED');
INSERT INTO ADOPTION_PROCESS VALUES ('AD004', 'A004', 'LP004', 'E004', TO_DATE('2025-04-15','YYYY-MM-DD'), NULL, 'REJECTED');
INSERT INTO ADOPTION_PROCESS VALUES ('AD005', 'A005', 'LP005', 'E005', TO_DATE('2025-04-20','YYYY-MM-DD'), TO_DATE('2025-05-01','YYYY-MM-DD'), 'COMPLETED');

-- ============================================================
-- 18. RESCUE
-- ============================================================

INSERT INTO RESCUE VALUES ('R001', 'Dhanmondi, Dhaka', TO_DATE('2025-01-01','YYYY-MM-DD'), 'Injured cat rescued from roadside', 'COMPLETED');
INSERT INTO RESCUE VALUES ('R002', 'Mirpur, Dhaka', TO_DATE('2025-02-01','YYYY-MM-DD'), 'Abandoned dog rescued', 'COMPLETED');
INSERT INTO RESCUE VALUES ('R003', 'Savar', TO_DATE('2025-03-01','YYYY-MM-DD'), 'Stray cat rescue', 'ACTIVE');
INSERT INTO RESCUE VALUES ('R004', 'Uttara, Dhaka', TO_DATE('2025-04-01','YYYY-MM-DD'), 'Injured dog rescue', 'ACTIVE');
INSERT INTO RESCUE VALUES ('R005', 'Mohammadpur, Dhaka', TO_DATE('2025-05-01','YYYY-MM-DD'), 'Small rabbit rescue', 'COMPLETED');

-- ============================================================
-- 19. RESCUE_PET
-- ============================================================

INSERT INTO RESCUE_PET VALUES ('R001', 'LP001');
INSERT INTO RESCUE_PET VALUES ('R002', 'LP002');
INSERT INTO RESCUE_PET VALUES ('R003', 'LP003');
INSERT INTO RESCUE_PET VALUES ('R004', 'LP004');
INSERT INTO RESCUE_PET VALUES ('R005', 'LP005');

-- ============================================================
-- 20. RESCUE_VOLUNTEER
-- ============================================================

INSERT INTO RESCUE_VOLUNTEER VALUES ('R001', 'V001', 'Transport Support', TO_DATE('2025-01-01','YYYY-MM-DD'));
INSERT INTO RESCUE_VOLUNTEER VALUES ('R002', 'V002', 'Rescue Assistant', TO_DATE('2025-02-01','YYYY-MM-DD'));
INSERT INTO RESCUE_VOLUNTEER VALUES ('R003', 'V003', 'Field Volunteer', TO_DATE('2025-03-01','YYYY-MM-DD'));
INSERT INTO RESCUE_VOLUNTEER VALUES ('R004', 'V004', 'Medical Support', TO_DATE('2025-04-01','YYYY-MM-DD'));
INSERT INTO RESCUE_VOLUNTEER VALUES ('R005', 'V005', 'Transport Support', TO_DATE('2025-05-01','YYYY-MM-DD'));

-- ============================================================
-- 21. MEDICAL_RECORD
-- ============================================================

INSERT INTO MEDICAL_RECORD VALUES ('MR001', 'LP001', 'D001', TO_DATE('2025-01-06','YYYY-MM-DD'), 'Minor wound', 'Wound cleaning and antibiotics', 'Stable');
INSERT INTO MEDICAL_RECORD VALUES ('MR002', 'LP002', 'D002', TO_DATE('2025-01-16','YYYY-MM-DD'), 'Skin infection', 'Topical medicine', 'Improving');
INSERT INTO MEDICAL_RECORD VALUES ('MR003', 'LP003', 'D003', TO_DATE('2025-02-11','YYYY-MM-DD'), 'Malnutrition', 'Diet plan and supplements', 'Under observation');
INSERT INTO MEDICAL_RECORD VALUES ('MR004', 'LP004', 'D004', TO_DATE('2025-03-02','YYYY-MM-DD'), 'Leg injury', 'Bandage and pain management', 'Treatment ongoing');
INSERT INTO MEDICAL_RECORD VALUES ('MR005', 'LP005', 'D005', TO_DATE('2025-03-21','YYYY-MM-DD'), 'Routine examination', 'No major treatment required', 'Healthy');

-- ============================================================
-- 22. MEDICINE
-- ============================================================

INSERT INTO MEDICINE VALUES ('MD001', 'Amoxicillin', 'Antibiotic', 25.00, 100, TO_DATE('2027-12-31','YYYY-MM-DD'));
INSERT INTO MEDICINE VALUES ('MD002', 'Ivermectin', 'Antiparasitic', 35.00, 80, TO_DATE('2027-10-31','YYYY-MM-DD'));
INSERT INTO MEDICINE VALUES ('MD003', 'Meloxicam', 'Pain Relief', 40.00, 60, TO_DATE('2027-08-31','YYYY-MM-DD'));
INSERT INTO MEDICINE VALUES ('MD004', 'Vitamin Supplement', 'Supplement', 20.00, 120, TO_DATE('2028-01-31','YYYY-MM-DD'));
INSERT INTO MEDICINE VALUES ('MD005', 'Antiseptic Solution', 'Antiseptic', 30.00, 90, TO_DATE('2027-11-30','YYYY-MM-DD'));

-- ============================================================
-- 23. PRESCRIPTION
-- ============================================================

INSERT INTO PRESCRIPTION VALUES ('MR001', 'MD001', '1 tablet', 'Twice daily', 7, 'Give after food');
INSERT INTO PRESCRIPTION VALUES ('MR002', 'MD002', '5 ml', 'Once daily', 5, 'Use as directed');
INSERT INTO PRESCRIPTION VALUES ('MR003', 'MD004', '1 tablet', 'Once daily', 14, 'Give with meal');
INSERT INTO PRESCRIPTION VALUES ('MR004', 'MD003', '1 tablet', 'Once daily', 5, 'Give after food');
INSERT INTO PRESCRIPTION VALUES ('MR005', 'MD005', '5 ml', 'Twice daily', 3, 'External use only');

-- ============================================================
-- 24. VACCINATION
-- ============================================================

INSERT INTO VACCINATION VALUES ('VC001', 'MR001', 'Rabies Vaccine', TO_DATE('2025-01-10','YYYY-MM-DD'), TO_DATE('2026-01-10','YYYY-MM-DD'), 'COMPLETED', 800);
INSERT INTO VACCINATION VALUES ('VC002', 'MR002', 'DHPP Vaccine', TO_DATE('2025-02-10','YYYY-MM-DD'), TO_DATE('2026-02-10','YYYY-MM-DD'), 'COMPLETED', 900);
INSERT INTO VACCINATION VALUES ('VC003', 'MR003', 'FVRCP Vaccine', TO_DATE('2025-03-10','YYYY-MM-DD'), TO_DATE('2026-03-10','YYYY-MM-DD'), 'COMPLETED', 850);
INSERT INTO VACCINATION VALUES ('VC004', 'MR004', 'Rabies Vaccine', TO_DATE('2025-04-10','YYYY-MM-DD'), TO_DATE('2026-04-10','YYYY-MM-DD'), 'COMPLETED', 800);
INSERT INTO VACCINATION VALUES ('VC005', 'MR005', 'Myxomatosis Vaccine', TO_DATE('2025-05-10','YYYY-MM-DD'), TO_DATE('2026-05-10','YYYY-MM-DD'), 'COMPLETED', 750);

-- ============================================================
-- 25. INCOME
-- ============================================================

INSERT INTO INCOME VALUES ('IN001', TO_DATE('2025-01-05','YYYY-MM-DD'), 5000, 'General donation received', 'RECEIVED');
INSERT INTO INCOME VALUES ('IN002', TO_DATE('2025-02-05','YYYY-MM-DD'), 3500, 'Shelter support donation', 'RECEIVED');
INSERT INTO INCOME VALUES ('IN003', TO_DATE('2025-03-05','YYYY-MM-DD'), 7000, 'Medical support donation', 'RECEIVED');
INSERT INTO INCOME VALUES ('IN004', TO_DATE('2025-04-05','YYYY-MM-DD'), 4500, 'Rescue support donation', 'RECEIVED');
INSERT INTO INCOME VALUES ('IN005', TO_DATE('2025-05-05','YYYY-MM-DD'), 6000, 'Animal care donation', 'RECEIVED');

-- ============================================================
-- 26. GIVES
-- ============================================================

INSERT INTO GIVES VALUES ('O001', 'N001', 'IN001');
INSERT INTO GIVES VALUES ('O002', 'N002', 'IN002');
INSERT INTO GIVES VALUES ('O003', 'N003', 'IN003');
INSERT INTO GIVES VALUES ('O004', 'N004', 'IN004');
INSERT INTO GIVES VALUES ('O005', 'N005', 'IN005');

-- ============================================================
-- 27. EXPENSE
-- ============================================================

INSERT INTO EXPENSE VALUES ('EX001', TO_DATE('2025-01-31','YYYY-MM-DD'), 'SALARY', 30000, 'Employee salary expense', 'PAID');
INSERT INTO EXPENSE VALUES ('EX002', TO_DATE('2025-02-28','YYYY-MM-DD'), 'SALARY', 50000, 'Supervisor salary expense', 'PAID');
INSERT INTO EXPENSE VALUES ('EX003', TO_DATE('2025-03-31','YYYY-MM-DD'), 'SALARY', 70000, 'Doctor salary expense', 'PAID');
INSERT INTO EXPENSE VALUES ('EX004', TO_DATE('2025-04-30','YYYY-MM-DD'), 'SALARY', 32000, 'Employee salary expense', 'PAID');
INSERT INTO EXPENSE VALUES ('EX005', TO_DATE('2025-05-31','YYYY-MM-DD'), 'SALARY', 72000, 'Doctor salary expense', 'PAID');

-- ============================================================
-- 28. SALARY
-- Final ER: Volunteer is not part of Salary relation
-- ============================================================

INSERT INTO SALARY VALUES ('SL001', 'E001', NULL, NULL, 'EX001', TO_DATE('2025-01-31','YYYY-MM-DD'), 30000, 'PAID');
INSERT INTO SALARY VALUES ('SL002', NULL, 'S001', NULL, 'EX002', TO_DATE('2025-02-28','YYYY-MM-DD'), 50000, 'PAID');
INSERT INTO SALARY VALUES ('SL003', NULL, NULL, 'D001', 'EX003', TO_DATE('2025-03-31','YYYY-MM-DD'), 70000, 'PAID');
INSERT INTO SALARY VALUES ('SL004', 'E002', NULL, NULL, 'EX004', TO_DATE('2025-04-30','YYYY-MM-DD'), 32000, 'PAID');
INSERT INTO SALARY VALUES ('SL005', NULL, NULL, 'D002', 'EX005', TO_DATE('2025-05-31','YYYY-MM-DD'), 72000, 'PAID');

COMMIT;

-- ============================================================
-- Verification: every table should show at least 5 rows
-- ============================================================

SELECT 'PERSON' AS TABLE_NAME, COUNT(*) AS ROW_COUNT FROM PERSON
UNION ALL SELECT 'PERSON_PHONE', COUNT(*) FROM PERSON_PHONE
UNION ALL SELECT 'EMPLOYEE', COUNT(*) FROM EMPLOYEE
UNION ALL SELECT 'SUPERVISOR', COUNT(*) FROM SUPERVISOR
UNION ALL SELECT 'DOCTOR', COUNT(*) FROM DOCTOR
UNION ALL SELECT 'VOLUNTEER', COUNT(*) FROM VOLUNTEER
UNION ALL SELECT 'OWNER', COUNT(*) FROM OWNER
UNION ALL SELECT 'DONOR', COUNT(*) FROM DONOR
UNION ALL SELECT 'ADOPTER', COUNT(*) FROM ADOPTER
UNION ALL SELECT 'SYSTEM_USER', COUNT(*) FROM SYSTEM_USER
UNION ALL SELECT 'EMERGENCY_CONTACT', COUNT(*) FROM EMERGENCY_CONTACT
UNION ALL SELECT 'SHELTER', COUNT(*) FROM SHELTER
UNION ALL SELECT 'PET', COUNT(*) FROM PET
UNION ALL SELECT 'LOCAL_PET', COUNT(*) FROM LOCAL_PET
UNION ALL SELECT 'GUEST_PET', COUNT(*) FROM GUEST_PET
UNION ALL SELECT 'SHELTER_ASSIGNMENT', COUNT(*) FROM SHELTER_ASSIGNMENT
UNION ALL SELECT 'ADOPTION_PROCESS', COUNT(*) FROM ADOPTION_PROCESS
UNION ALL SELECT 'RESCUE', COUNT(*) FROM RESCUE
UNION ALL SELECT 'RESCUE_PET', COUNT(*) FROM RESCUE_PET
UNION ALL SELECT 'RESCUE_VOLUNTEER', COUNT(*) FROM RESCUE_VOLUNTEER
UNION ALL SELECT 'MEDICAL_RECORD', COUNT(*) FROM MEDICAL_RECORD
UNION ALL SELECT 'MEDICINE', COUNT(*) FROM MEDICINE
UNION ALL SELECT 'PRESCRIPTION', COUNT(*) FROM PRESCRIPTION
UNION ALL SELECT 'VACCINATION', COUNT(*) FROM VACCINATION
UNION ALL SELECT 'INCOME', COUNT(*) FROM INCOME
UNION ALL SELECT 'GIVES', COUNT(*) FROM GIVES
UNION ALL SELECT 'EXPENSE', COUNT(*) FROM EXPENSE
UNION ALL SELECT 'SALARY', COUNT(*) FROM SALARY
ORDER BY TABLE_NAME;

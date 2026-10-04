<<<<<<< HEAD


create table person (
   person_id     varchar2(12)
      constraint pk_person primary key,
   first_name    varchar2(50) not null,
   last_name     varchar2(50) not null,
   date_of_birth date,
   gender        varchar2(10),
   email         varchar2(100),
   constraint uk_person_email unique ( email ),
   constraint ck_person_gender
      check ( gender in ( 'MALE',
                          'FEMALE',
                          'OTHER' ) )
);

create table person_address (
   person_id varchar2(12) not null,
   house_no  varchar2(20) not null,
   street    varchar2(100) not null,
   city      varchar2(50) not null,
   constraint pk_person_address
      primary key ( person_id,
                    house_no,
                    street,
                    city ),
   constraint fk_address_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade
);

create table person_phone (
   person_id varchar2(12) not null,
   phone     varchar2(20) not null,
   constraint pk_person_phone primary key ( person_id,
                                            phone ),
   constraint fk_phone_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade
);

create table system_user (
   user_id       varchar2(12)
      constraint pk_system_user primary key,
   person_id     varchar2(12) not null,
   username      varchar2(50) not null,
   password_hash varchar2(100) not null,
   user_role     varchar2(20) not null,
   user_status   varchar2(20) default 'ACTIVE' not null,
   constraint uk_system_user_person unique ( person_id ),
   constraint uk_system_user_username unique ( username ),
   constraint fk_system_user_person foreign key ( person_id )
      references person ( person_id ),
   constraint ck_system_user_role
      check ( user_role in ( 'ADMIN',
                             'SUPERVISOR',
                             'EMPLOYEE',
                             'DOCTOR',
                             'VOLUNTEER',
                             'ADOPTER',
                             'OWNER',
                             'DONOR' ) ),
   constraint ck_system_user_status check ( user_status in ( 'ACTIVE',
                                                             'INACTIVE' ) )
);

-- One account can activate several approved PERSON subtype roles.
create table system_user_role (
   user_id            varchar2(12) not null,
   role_name          varchar2(20) not null,
   granted_by_user_id varchar2(12),
   granted_at         date default sysdate not null,
   constraint pk_system_user_role primary key ( user_id, role_name ),
   constraint fk_user_role_user foreign key ( user_id ) references system_user ( user_id ) on delete cascade,
   constraint fk_user_role_granter foreign key ( granted_by_user_id ) references system_user ( user_id ),
   constraint ck_user_role_name check ( role_name in (
      'ADMIN','SUPERVISOR','EMPLOYEE','DOCTOR','VOLUNTEER','ADOPTER','OWNER','DONOR'
   ) )
);

create table role_application (
   role_application_id varchar2(12) constraint pk_role_application primary key,
   applicant_user_id   varchar2(12) not null,
   requested_role      varchar2(20) not null,
   details             varchar2(100),
   occupation          varchar2(80),
   hire_date           date,
   salary              number(12,2),
   status              varchar2(20) default 'PENDING' not null,
   requested_at        date default sysdate not null,
   reviewed_by_user_id varchar2(12),
   reviewer_role       varchar2(20),
   reviewed_at         date,
   review_note         varchar2(200),
   constraint fk_role_applicant foreign key ( applicant_user_id ) references system_user ( user_id ) on delete cascade,
   constraint fk_role_reviewer foreign key ( reviewed_by_user_id ) references system_user ( user_id ),
   constraint ck_requested_role check ( requested_role in (
      'SUPERVISOR','EMPLOYEE','DOCTOR','VOLUNTEER','ADOPTER','OWNER','DONOR'
   ) ),
   constraint ck_role_application_status check ( status in ('PENDING','APPROVED','REJECTED') ),
   constraint ck_role_application_salary check ( salary is null or salary >= 0 )
);

-- Weak entity: E_NAME is the partial key; PERSON_ID is the owner key.
create table emergency_no (
   person_id varchar2(12) not null,
   e_name    varchar2(80) not null,
   relation  varchar2(40) not null,
   phone     varchar2(20) not null,
   constraint pk_emergency_no primary key ( person_id,
                                            e_name ),
   constraint fk_emergency_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade
);

-- PERSON ISA subtype tables.
create table doctor (
   person_id      varchar2(12)
      constraint pk_doctor primary key,
   salary         number(12,2),
   specialization varchar2(80),
   constraint fk_doctor_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade,
   constraint ck_doctor_salary
      check ( salary is null
          or salary >= 0 )
);

create table volunteer (
   person_id varchar2(12)
      constraint pk_volunteer primary key,
   skill     varchar2(100),
   constraint fk_volunteer_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade
);

create table supervisor (
   person_id varchar2(12)
      constraint pk_supervisor primary key,
   constraint fk_supervisor_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade
);

create table adopter (
   person_id  varchar2(12)
      constraint pk_adopter primary key,
   occupation varchar2(80),
   constraint fk_adopter_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade
);

create table employee (
   person_id  varchar2(12)
      constraint pk_employee primary key,
   occupation varchar2(80),
   hire_date  date,
   position   varchar2(80),
   salary     number(12,2),
   constraint fk_employee_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade,
   constraint ck_employee_salary
      check ( salary is null
          or salary >= 0 )
);

create table donor (
   person_id       varchar2(12)
      constraint pk_donor primary key,
   donation_amount number(12,2),
   occupation      varchar2(80),
   constraint fk_donor_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade,
   constraint ck_donor_amount
      check ( donation_amount is null
          or donation_amount >= 0 )
);

create table owner (
   person_id  varchar2(12)
      constraint pk_owner primary key,
   occupation varchar2(80),
   constraint fk_owner_person foreign key ( person_id )
      references person ( person_id )
         on delete cascade
);

create table doctor_training (
   senior_doctor_id varchar2(12) not null,
   junior_doctor_id varchar2(12) not null,
   constraint pk_doctor_training primary key ( senior_doctor_id,
                                               junior_doctor_id ),
   constraint fk_training_senior foreign key ( senior_doctor_id )
      references doctor ( person_id ),
   constraint fk_training_junior foreign key ( junior_doctor_id )
      references doctor ( person_id ),
   constraint ck_training_different check ( senior_doctor_id <> junior_doctor_id )
);

create table rescue (
   rescue_id   varchar2(12)
      constraint pk_rescue primary key,
   rescue_date date not null,
   location    varchar2(150) not null
);

create table shelter (
   shelter_id varchar2(12)
      constraint pk_shelter primary key,
   room_type  varchar2(60) not null
);

create table pet (
   pet_id  varchar2(12)
      constraint pk_pet primary key,
   name    varchar2(60) not null,
   dob     date,
   breed   varchar2(60),
   species varchar2(40) not null,
   weight  number(8,2),
   constraint ck_pet_weight
      check ( weight is null
          or weight >= 0 )
);

-- PET ISA subtype tables.
create table local_pet (
   pet_id          varchar2(12)
      constraint pk_local_pet primary key,
   adoption_status varchar2(20) default 'AVAILABLE' not null,
   in_take_date    date not null,
   constraint fk_local_pet_pet foreign key ( pet_id )
      references pet ( pet_id )
         on delete cascade,
   constraint ck_local_pet_status
      check ( adoption_status in ( 'AVAILABLE',
                                   'PENDING',
                                   'ADOPTED',
                                   'ON_HOLD' ) )
);

create table guest_pet (
   pet_id        varchar2(12)
      constraint pk_guest_pet primary key,
   check_in_date date not null,
   relevant_time varchar2(60),
   constraint fk_guest_pet_pet foreign key ( pet_id )
      references pet ( pet_id )
         on delete cascade
);

create table rescue_shelter (
   rescue_id  varchar2(12)
      constraint pk_rescue_shelter primary key,
   shelter_id varchar2(12) not null,
   constraint fk_rescue_shelter_rescue foreign key ( rescue_id )
      references rescue ( rescue_id )
         on delete cascade,
   constraint fk_rescue_shelter_shelter foreign key ( shelter_id )
      references shelter ( shelter_id )
);

create table pet_shelter (
   pet_id     varchar2(12) not null,
   shelter_id varchar2(12) not null,
   constraint pk_pet_shelter primary key ( pet_id,
                                           shelter_id ),
   constraint fk_pet_shelter_pet foreign key ( pet_id )
      references pet ( pet_id )
         on delete cascade,
   constraint fk_pet_shelter_shelter foreign key ( shelter_id )
      references shelter ( shelter_id )
);

create table guest_pet_owner (
   pet_id   varchar2(12) not null,
   owner_id varchar2(12) not null,
   constraint pk_guest_pet_owner primary key ( pet_id,
                                               owner_id ),
   constraint fk_guest_owner_pet foreign key ( pet_id )
      references guest_pet ( pet_id )
         on delete cascade,
   constraint fk_guest_owner_owner foreign key ( owner_id )
      references owner ( person_id )
);

-- Records the Volunteer who actually performed/reported a rescue; it is not a prior assignment.
create table volunteer_rescue (
   volunteer_id varchar2(12) not null,
   rescue_id    varchar2(12) not null,
   constraint pk_volunteer_rescue primary key ( volunteer_id,
                                                rescue_id ),
   constraint fk_vol_rescue_volunteer foreign key ( volunteer_id )
      references volunteer ( person_id ),
   constraint fk_vol_rescue_rescue foreign key ( rescue_id )
      references rescue ( rescue_id )
         on delete cascade
);

create table medical_record (
   record_id     varchar2(12)
      constraint pk_medical_record primary key,
   pet_id        varchar2(12) not null,
   diagnosis     varchar2(300),
   treatment     varchar2(300),
   health_status varchar2(60) not null,
   constraint fk_medical_pet foreign key ( pet_id )
      references pet ( pet_id )
);

create table medicine (
   medicine_id varchar2(12)
      constraint pk_medicine primary key,
   dosage      varchar2(80),
   price       number(12,2) not null,
   constraint ck_medicine_price check ( price >= 0 )
);

create table vaccination (
   vaccine_id   varchar2(12)
      constraint pk_vaccination primary key,
   vaccine_name varchar2(80) not null,
   v_date       date not null,
   num_of_dose  number(3) not null,
   next_dose    date,
   price        number(12,2) not null,
   constraint ck_vaccination_dose check ( num_of_dose > 0 ),
   constraint ck_vaccination_price check ( price >= 0 )
);

create table medical_record_medicine (
   record_id   varchar2(12) not null,
   medicine_id varchar2(12) not null,
   constraint pk_medical_medicine primary key ( record_id,
                                                medicine_id ),
   constraint fk_med_med_record foreign key ( record_id )
      references medical_record ( record_id )
         on delete cascade,
   constraint fk_med_med_medicine foreign key ( medicine_id )
      references medicine ( medicine_id )
);

create table medical_record_vaccination (
   record_id  varchar2(12) not null,
   vaccine_id varchar2(12) not null,
   constraint pk_medical_vaccine primary key ( record_id,
                                               vaccine_id ),
   constraint fk_med_vac_record foreign key ( record_id )
      references medical_record ( record_id )
         on delete cascade,
   constraint fk_med_vac_vaccine foreign key ( vaccine_id )
      references vaccination ( vaccine_id )
);

create table finance (
   finance_id      varchar2(12)
      constraint pk_finance primary key,
   current_balance number(14,2) default 0 not null,
   constraint ck_finance_balance check ( current_balance >= 0 )
);

create table income (
   source_id   varchar2(12)
      constraint pk_income primary key,
   source_name varchar2(100) not null,
   amount      number(14,2) not null,
   constraint ck_income_amount check ( amount >= 0 )
);

create table expenses (
   source_id   varchar2(12)
      constraint pk_expenses primary key,
   source_name varchar2(100) not null,
   amount      number(14,2) not null,
   constraint ck_expenses_amount check ( amount >= 0 )
);

create table finance_income (
   finance_id varchar2(12) not null,
   source_id  varchar2(12) not null,
   constraint pk_finance_income primary key ( finance_id,
                                              source_id ),
   constraint fk_fin_income_finance foreign key ( finance_id )
      references finance ( finance_id )
         on delete cascade,
   constraint fk_fin_income_source foreign key ( source_id )
      references income ( source_id )
);

create table finance_expense (
   finance_id varchar2(12) not null,
   source_id  varchar2(12) not null,
   constraint pk_finance_expense primary key ( finance_id,
                                               source_id ),
   constraint fk_fin_expense_finance foreign key ( finance_id )
      references finance ( finance_id )
         on delete cascade,
   constraint fk_fin_expense_source foreign key ( source_id )
      references expenses ( source_id )
);

create table donation (
   donor_id  varchar2(12) not null,
   source_id varchar2(12) not null,
   constraint pk_donation primary key ( donor_id,
                                        source_id ),
   constraint fk_donation_donor foreign key ( donor_id )
      references donor ( person_id ),
   constraint fk_donation_income foreign key ( source_id )
      references income ( source_id )
);

-- Converted, Have and Contains relationships from the final ER.
create table owner_medicine (
   owner_id    varchar2(12) not null,
   medicine_id varchar2(12) not null,
   constraint pk_owner_medicine primary key ( owner_id,
                                              medicine_id ),
   constraint fk_owner_med_owner foreign key ( owner_id )
      references owner ( person_id ),
   constraint fk_owner_med_medicine foreign key ( medicine_id )
      references medicine ( medicine_id )
);

create table expense_medicine (
   expense_source_id varchar2(12) not null,
   medicine_id       varchar2(12) not null,
   constraint pk_expense_medicine primary key ( expense_source_id,
                                                medicine_id ),
   constraint fk_exp_med_expense foreign key ( expense_source_id )
      references expenses ( source_id ),
   constraint fk_exp_med_medicine foreign key ( medicine_id )
      references medicine ( medicine_id )
);

create table expense_vaccination (
   expense_source_id varchar2(12) not null,
   vaccine_id        varchar2(12) not null,
   constraint pk_expense_vaccination primary key ( expense_source_id,
                                                   vaccine_id ),
   constraint fk_exp_vac_expense foreign key ( expense_source_id )
      references expenses ( source_id ),
   constraint fk_exp_vac_vaccine foreign key ( vaccine_id )
      references vaccination ( vaccine_id )
);

-- Supervisor supervises Shelter.
create table shelter_supervision (
   supervisor_id varchar2(12) not null,
   shelter_id    varchar2(12) not null,
   constraint pk_shelter_supervision primary key ( supervisor_id,
                                                   shelter_id ),
   constraint fk_supervision_supervisor foreign key ( supervisor_id )
      references supervisor ( person_id ),
   constraint fk_supervision_shelter foreign key ( shelter_id )
      references shelter ( shelter_id )
=======
-- Pet Adoption Management System - final ER relational schema
-- Oracle SQL Developer: run with F5 (Run Script).

CREATE TABLE PERSON (
  PERSON_ID VARCHAR2(12) CONSTRAINT PK_PERSON PRIMARY KEY,
  FIRST_NAME VARCHAR2(50) NOT NULL,
  LAST_NAME VARCHAR2(50) NOT NULL,
  DATE_OF_BIRTH DATE,
  GENDER VARCHAR2(10),
  EMAIL VARCHAR2(100),
  CONSTRAINT UK_PERSON_EMAIL UNIQUE (EMAIL),
  CONSTRAINT CK_PERSON_GENDER CHECK (GENDER IN ('MALE','FEMALE','OTHER'))
);

CREATE TABLE PERSON_ADDRESS (
  PERSON_ID VARCHAR2(12) NOT NULL,
  HOUSE_NO VARCHAR2(20) NOT NULL,
  STREET VARCHAR2(100) NOT NULL,
  CITY VARCHAR2(50) NOT NULL,
  CONSTRAINT PK_PERSON_ADDRESS PRIMARY KEY (PERSON_ID,HOUSE_NO,STREET,CITY),
  CONSTRAINT FK_ADDRESS_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE
);

CREATE TABLE PERSON_PHONE (
  PERSON_ID VARCHAR2(12) NOT NULL,
  PHONE VARCHAR2(20) NOT NULL,
  CONSTRAINT PK_PERSON_PHONE PRIMARY KEY (PERSON_ID,PHONE),
  CONSTRAINT FK_PHONE_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE
);

CREATE TABLE SYSTEM_USER (
  USER_ID VARCHAR2(12) CONSTRAINT PK_SYSTEM_USER PRIMARY KEY,
  PERSON_ID VARCHAR2(12) NOT NULL,
  USERNAME VARCHAR2(50) NOT NULL,
  PASSWORD_HASH VARCHAR2(100) NOT NULL,
  USER_ROLE VARCHAR2(20) NOT NULL,
  USER_STATUS VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
  CONSTRAINT UK_SYSTEM_USER_PERSON UNIQUE (PERSON_ID),
  CONSTRAINT UK_SYSTEM_USER_USERNAME UNIQUE (USERNAME),
  CONSTRAINT FK_SYSTEM_USER_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID),
  CONSTRAINT CK_SYSTEM_USER_ROLE CHECK (USER_ROLE IN ('ADMIN','SUPERVISOR','EMPLOYEE','DOCTOR','VOLUNTEER','ADOPTER','OWNER','DONOR')),
  CONSTRAINT CK_SYSTEM_USER_STATUS CHECK (USER_STATUS IN ('ACTIVE','INACTIVE'))
);

-- Weak entity: E_NAME is the partial key; PERSON_ID is the owner key.
CREATE TABLE EMERGENCY_NO (
  PERSON_ID VARCHAR2(12) NOT NULL,
  E_NAME VARCHAR2(80) NOT NULL,
  RELATION VARCHAR2(40) NOT NULL,
  PHONE VARCHAR2(20) NOT NULL,
  CONSTRAINT PK_EMERGENCY_NO PRIMARY KEY (PERSON_ID,E_NAME),
  CONSTRAINT FK_EMERGENCY_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE
);

-- PERSON ISA subtype tables.
CREATE TABLE DOCTOR (
  PERSON_ID VARCHAR2(12) CONSTRAINT PK_DOCTOR PRIMARY KEY,
  SALARY NUMBER(12,2),
  SPECIALIZATION VARCHAR2(80),
  CONSTRAINT FK_DOCTOR_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE,
  CONSTRAINT CK_DOCTOR_SALARY CHECK (SALARY IS NULL OR SALARY >= 0)
);

CREATE TABLE VOLUNTEER (
  PERSON_ID VARCHAR2(12) CONSTRAINT PK_VOLUNTEER PRIMARY KEY,
  SKILL VARCHAR2(100),
  CONSTRAINT FK_VOLUNTEER_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE
);

CREATE TABLE SUPERVISOR (
  PERSON_ID VARCHAR2(12) CONSTRAINT PK_SUPERVISOR PRIMARY KEY,
  CONSTRAINT FK_SUPERVISOR_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE
);

CREATE TABLE ADOPTER (
  PERSON_ID VARCHAR2(12) CONSTRAINT PK_ADOPTER PRIMARY KEY,
  OCCUPATION VARCHAR2(80),
  CONSTRAINT FK_ADOPTER_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE
);

CREATE TABLE EMPLOYEE (
  PERSON_ID VARCHAR2(12) CONSTRAINT PK_EMPLOYEE PRIMARY KEY,
  OCCUPATION VARCHAR2(80),
  HIRE_DATE DATE,
  POSITION VARCHAR2(80),
  SALARY NUMBER(12,2),
  CONSTRAINT FK_EMPLOYEE_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE,
  CONSTRAINT CK_EMPLOYEE_SALARY CHECK (SALARY IS NULL OR SALARY >= 0)
);

CREATE TABLE DONOR (
  PERSON_ID VARCHAR2(12) CONSTRAINT PK_DONOR PRIMARY KEY,
  DONATION_AMOUNT NUMBER(12,2),
  OCCUPATION VARCHAR2(80),
  CONSTRAINT FK_DONOR_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE,
  CONSTRAINT CK_DONOR_AMOUNT CHECK (DONATION_AMOUNT IS NULL OR DONATION_AMOUNT >= 0)
);

CREATE TABLE OWNER (
  PERSON_ID VARCHAR2(12) CONSTRAINT PK_OWNER PRIMARY KEY,
  OCCUPATION VARCHAR2(80),
  CONSTRAINT FK_OWNER_PERSON FOREIGN KEY (PERSON_ID) REFERENCES PERSON(PERSON_ID) ON DELETE CASCADE
);

CREATE TABLE DOCTOR_TRAINING (
  SENIOR_DOCTOR_ID VARCHAR2(12) NOT NULL,
  JUNIOR_DOCTOR_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_DOCTOR_TRAINING PRIMARY KEY (SENIOR_DOCTOR_ID,JUNIOR_DOCTOR_ID),
  CONSTRAINT FK_TRAINING_SENIOR FOREIGN KEY (SENIOR_DOCTOR_ID) REFERENCES DOCTOR(PERSON_ID),
  CONSTRAINT FK_TRAINING_JUNIOR FOREIGN KEY (JUNIOR_DOCTOR_ID) REFERENCES DOCTOR(PERSON_ID),
  CONSTRAINT CK_TRAINING_DIFFERENT CHECK (SENIOR_DOCTOR_ID <> JUNIOR_DOCTOR_ID)
);

CREATE TABLE RESCUE (
  RESCUE_ID VARCHAR2(12) CONSTRAINT PK_RESCUE PRIMARY KEY,
  RESCUE_DATE DATE NOT NULL,
  LOCATION VARCHAR2(150) NOT NULL
);

CREATE TABLE SHELTER (
  SHELTER_ID VARCHAR2(12) CONSTRAINT PK_SHELTER PRIMARY KEY,
  ROOM_TYPE VARCHAR2(60) NOT NULL
);

CREATE TABLE PET (
  PET_ID VARCHAR2(12) CONSTRAINT PK_PET PRIMARY KEY,
  NAME VARCHAR2(60) NOT NULL,
  DOB DATE,
  BREED VARCHAR2(60),
  SPECIES VARCHAR2(40) NOT NULL,
  WEIGHT NUMBER(8,2),
  CONSTRAINT CK_PET_WEIGHT CHECK (WEIGHT IS NULL OR WEIGHT >= 0)
);

-- PET ISA subtype tables.
CREATE TABLE LOCAL_PET (
  PET_ID VARCHAR2(12) CONSTRAINT PK_LOCAL_PET PRIMARY KEY,
  ADOPTION_STATUS VARCHAR2(20) DEFAULT 'AVAILABLE' NOT NULL,
  IN_TAKE_DATE DATE NOT NULL,
  CONSTRAINT FK_LOCAL_PET_PET FOREIGN KEY (PET_ID) REFERENCES PET(PET_ID) ON DELETE CASCADE,
  CONSTRAINT CK_LOCAL_PET_STATUS CHECK (ADOPTION_STATUS IN ('AVAILABLE','PENDING','ADOPTED','ON_HOLD'))
);

CREATE TABLE GUEST_PET (
  PET_ID VARCHAR2(12) CONSTRAINT PK_GUEST_PET PRIMARY KEY,
  CHECK_IN_DATE DATE NOT NULL,
  RELEVANT_TIME VARCHAR2(60),
  CONSTRAINT FK_GUEST_PET_PET FOREIGN KEY (PET_ID) REFERENCES PET(PET_ID) ON DELETE CASCADE
);

CREATE TABLE RESCUE_SHELTER (
  RESCUE_ID VARCHAR2(12) CONSTRAINT PK_RESCUE_SHELTER PRIMARY KEY,
  SHELTER_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT FK_RESCUE_SHELTER_RESCUE FOREIGN KEY (RESCUE_ID) REFERENCES RESCUE(RESCUE_ID) ON DELETE CASCADE,
  CONSTRAINT FK_RESCUE_SHELTER_SHELTER FOREIGN KEY (SHELTER_ID) REFERENCES SHELTER(SHELTER_ID)
);

CREATE TABLE PET_SHELTER (
  PET_ID VARCHAR2(12) NOT NULL,
  SHELTER_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_PET_SHELTER PRIMARY KEY (PET_ID,SHELTER_ID),
  CONSTRAINT FK_PET_SHELTER_PET FOREIGN KEY (PET_ID) REFERENCES PET(PET_ID) ON DELETE CASCADE,
  CONSTRAINT FK_PET_SHELTER_SHELTER FOREIGN KEY (SHELTER_ID) REFERENCES SHELTER(SHELTER_ID)
);

CREATE TABLE GUEST_PET_OWNER (
  PET_ID VARCHAR2(12) NOT NULL,
  OWNER_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_GUEST_PET_OWNER PRIMARY KEY (PET_ID,OWNER_ID),
  CONSTRAINT FK_GUEST_OWNER_PET FOREIGN KEY (PET_ID) REFERENCES GUEST_PET(PET_ID) ON DELETE CASCADE,
  CONSTRAINT FK_GUEST_OWNER_OWNER FOREIGN KEY (OWNER_ID) REFERENCES OWNER(PERSON_ID)
);

CREATE TABLE VOLUNTEER_RESCUE (
  VOLUNTEER_ID VARCHAR2(12) NOT NULL,
  RESCUE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_VOLUNTEER_RESCUE PRIMARY KEY (VOLUNTEER_ID,RESCUE_ID),
  CONSTRAINT FK_VOL_RESCUE_VOLUNTEER FOREIGN KEY (VOLUNTEER_ID) REFERENCES VOLUNTEER(PERSON_ID),
  CONSTRAINT FK_VOL_RESCUE_RESCUE FOREIGN KEY (RESCUE_ID) REFERENCES RESCUE(RESCUE_ID) ON DELETE CASCADE
);

CREATE TABLE MEDICAL_RECORD (
  RECORD_ID VARCHAR2(12) CONSTRAINT PK_MEDICAL_RECORD PRIMARY KEY,
  PET_ID VARCHAR2(12) NOT NULL,
  DIAGNOSIS VARCHAR2(300),
  TREATMENT VARCHAR2(300),
  HEALTH_STATUS VARCHAR2(60) NOT NULL,
  CONSTRAINT FK_MEDICAL_PET FOREIGN KEY (PET_ID) REFERENCES PET(PET_ID)
);

CREATE TABLE MEDICINE (
  MEDICINE_ID VARCHAR2(12) CONSTRAINT PK_MEDICINE PRIMARY KEY,
  DOSAGE VARCHAR2(80),
  PRICE NUMBER(12,2) NOT NULL,
  CONSTRAINT CK_MEDICINE_PRICE CHECK (PRICE >= 0)
);

CREATE TABLE VACCINATION (
  VACCINE_ID VARCHAR2(12) CONSTRAINT PK_VACCINATION PRIMARY KEY,
  VACCINE_NAME VARCHAR2(80) NOT NULL,
  V_DATE DATE NOT NULL,
  NUM_OF_DOSE NUMBER(3) NOT NULL,
  NEXT_DOSE DATE,
  PRICE NUMBER(12,2) NOT NULL,
  CONSTRAINT CK_VACCINATION_DOSE CHECK (NUM_OF_DOSE > 0),
  CONSTRAINT CK_VACCINATION_PRICE CHECK (PRICE >= 0)
);

CREATE TABLE MEDICAL_RECORD_MEDICINE (
  RECORD_ID VARCHAR2(12) NOT NULL,
  MEDICINE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_MEDICAL_MEDICINE PRIMARY KEY (RECORD_ID,MEDICINE_ID),
  CONSTRAINT FK_MED_MED_RECORD FOREIGN KEY (RECORD_ID) REFERENCES MEDICAL_RECORD(RECORD_ID) ON DELETE CASCADE,
  CONSTRAINT FK_MED_MED_MEDICINE FOREIGN KEY (MEDICINE_ID) REFERENCES MEDICINE(MEDICINE_ID)
);

CREATE TABLE MEDICAL_RECORD_VACCINATION (
  RECORD_ID VARCHAR2(12) NOT NULL,
  VACCINE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_MEDICAL_VACCINE PRIMARY KEY (RECORD_ID,VACCINE_ID),
  CONSTRAINT FK_MED_VAC_RECORD FOREIGN KEY (RECORD_ID) REFERENCES MEDICAL_RECORD(RECORD_ID) ON DELETE CASCADE,
  CONSTRAINT FK_MED_VAC_VACCINE FOREIGN KEY (VACCINE_ID) REFERENCES VACCINATION(VACCINE_ID)
);

CREATE TABLE FINANCE (
  FINANCE_ID VARCHAR2(12) CONSTRAINT PK_FINANCE PRIMARY KEY,
  CURRENT_BALANCE NUMBER(14,2) DEFAULT 0 NOT NULL,
  CONSTRAINT CK_FINANCE_BALANCE CHECK (CURRENT_BALANCE >= 0)
);

CREATE TABLE INCOME (
  SOURCE_ID VARCHAR2(12) CONSTRAINT PK_INCOME PRIMARY KEY,
  SOURCE_NAME VARCHAR2(100) NOT NULL,
  AMOUNT NUMBER(14,2) NOT NULL,
  CONSTRAINT CK_INCOME_AMOUNT CHECK (AMOUNT >= 0)
);

CREATE TABLE EXPENSES (
  SOURCE_ID VARCHAR2(12) CONSTRAINT PK_EXPENSES PRIMARY KEY,
  SOURCE_NAME VARCHAR2(100) NOT NULL,
  AMOUNT NUMBER(14,2) NOT NULL,
  CONSTRAINT CK_EXPENSES_AMOUNT CHECK (AMOUNT >= 0)
);

CREATE TABLE FINANCE_INCOME (
  FINANCE_ID VARCHAR2(12) NOT NULL,
  SOURCE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_FINANCE_INCOME PRIMARY KEY (FINANCE_ID,SOURCE_ID),
  CONSTRAINT FK_FIN_INCOME_FINANCE FOREIGN KEY (FINANCE_ID) REFERENCES FINANCE(FINANCE_ID) ON DELETE CASCADE,
  CONSTRAINT FK_FIN_INCOME_SOURCE FOREIGN KEY (SOURCE_ID) REFERENCES INCOME(SOURCE_ID)
);

CREATE TABLE FINANCE_EXPENSE (
  FINANCE_ID VARCHAR2(12) NOT NULL,
  SOURCE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_FINANCE_EXPENSE PRIMARY KEY (FINANCE_ID,SOURCE_ID),
  CONSTRAINT FK_FIN_EXPENSE_FINANCE FOREIGN KEY (FINANCE_ID) REFERENCES FINANCE(FINANCE_ID) ON DELETE CASCADE,
  CONSTRAINT FK_FIN_EXPENSE_SOURCE FOREIGN KEY (SOURCE_ID) REFERENCES EXPENSES(SOURCE_ID)
);

CREATE TABLE DONATION (
  DONOR_ID VARCHAR2(12) NOT NULL,
  SOURCE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_DONATION PRIMARY KEY (DONOR_ID,SOURCE_ID),
  CONSTRAINT FK_DONATION_DONOR FOREIGN KEY (DONOR_ID) REFERENCES DONOR(PERSON_ID),
  CONSTRAINT FK_DONATION_INCOME FOREIGN KEY (SOURCE_ID) REFERENCES INCOME(SOURCE_ID)
);

-- Converted, Have and Contains relationships from the final ER.
CREATE TABLE OWNER_MEDICINE (
  OWNER_ID VARCHAR2(12) NOT NULL,
  MEDICINE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_OWNER_MEDICINE PRIMARY KEY (OWNER_ID,MEDICINE_ID),
  CONSTRAINT FK_OWNER_MED_OWNER FOREIGN KEY (OWNER_ID) REFERENCES OWNER(PERSON_ID),
  CONSTRAINT FK_OWNER_MED_MEDICINE FOREIGN KEY (MEDICINE_ID) REFERENCES MEDICINE(MEDICINE_ID)
);

CREATE TABLE EXPENSE_MEDICINE (
  EXPENSE_SOURCE_ID VARCHAR2(12) NOT NULL,
  MEDICINE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_EXPENSE_MEDICINE PRIMARY KEY (EXPENSE_SOURCE_ID,MEDICINE_ID),
  CONSTRAINT FK_EXP_MED_EXPENSE FOREIGN KEY (EXPENSE_SOURCE_ID) REFERENCES EXPENSES(SOURCE_ID),
  CONSTRAINT FK_EXP_MED_MEDICINE FOREIGN KEY (MEDICINE_ID) REFERENCES MEDICINE(MEDICINE_ID)
);

CREATE TABLE EXPENSE_VACCINATION (
  EXPENSE_SOURCE_ID VARCHAR2(12) NOT NULL,
  VACCINE_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_EXPENSE_VACCINATION PRIMARY KEY (EXPENSE_SOURCE_ID,VACCINE_ID),
  CONSTRAINT FK_EXP_VAC_EXPENSE FOREIGN KEY (EXPENSE_SOURCE_ID) REFERENCES EXPENSES(SOURCE_ID),
  CONSTRAINT FK_EXP_VAC_VACCINE FOREIGN KEY (VACCINE_ID) REFERENCES VACCINATION(VACCINE_ID)
);

-- Supervisor supervises Shelter.
CREATE TABLE SHELTER_SUPERVISION (
  SUPERVISOR_ID VARCHAR2(12) NOT NULL,
  SHELTER_ID VARCHAR2(12) NOT NULL,
  CONSTRAINT PK_SHELTER_SUPERVISION PRIMARY KEY (SUPERVISOR_ID,SHELTER_ID),
  CONSTRAINT FK_SUPERVISION_SUPERVISOR FOREIGN KEY (SUPERVISOR_ID) REFERENCES SUPERVISOR(PERSON_ID),
  CONSTRAINT FK_SUPERVISION_SHELTER FOREIGN KEY (SHELTER_ID) REFERENCES SHELTER(SHELTER_ID)
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
);

-- An adopter submits first; a supervisor assigns an employee after approval.

<<<<<<< HEAD
create table adoption_process (
   adoption_id  varchar2(12)
      constraint pk_adoption_process primary key,
   adopter_id   varchar2(12) not null,
   employee_id  varchar2(12),
   local_pet_id varchar2(12) not null,
   apply_date   date default trunc(sysdate) not null,
   status       varchar2(20) default 'PENDING' not null,
   constraint fk_adoption_adopter foreign key ( adopter_id )
      references adopter ( person_id ),
   constraint fk_adoption_employee foreign key ( employee_id )
      references employee ( person_id ),
   constraint fk_adoption_local_pet foreign key ( local_pet_id )
      references local_pet ( pet_id ),
   constraint ck_adoption_status
      check ( status in ( 'PENDING',
                          'APPROVED',
                          'REJECTED',
                          'ADOPTED',
                          'CANCELLED' ) )
);

-- Supervisor manages the Adoption Process aggregation.
create table adoption_management (
   supervisor_id varchar2(12) not null,
   adoption_id   varchar2(12) not null,
   assign_date   date not null,
   salary        number(12,2),
   constraint pk_adoption_management primary key ( supervisor_id,
                                                   adoption_id ),
   constraint uk_adopt_mgmt_adoption unique ( adoption_id ),
   constraint fk_adopt_mgmt_supervisor foreign key ( supervisor_id )
      references supervisor ( person_id ),
   constraint fk_adopt_mgmt_adoption foreign key ( adoption_id )
      references adoption_process ( adoption_id )
         on delete cascade,
   constraint ck_adopt_mgmt_salary
      check ( salary is null
          or salary >= 0 )
);

-- One payroll row represents one staff payment recorded by a supervisor.
create table salary (
   salary_id                 varchar2(12)
      constraint pk_salary primary key,
   recorded_by_supervisor_id varchar2(12) not null,
   payee_id                  varchar2(12) not null,
   payee_role                varchar2(20) not null,
   expense_source_id         varchar2(12) not null,
   salary_month              varchar2(7) not null,
   payment_date              date not null,
   salary_amount             number(12,2) not null,
   constraint uk_salary_expense unique ( expense_source_id ),
   constraint fk_salary_recorded_by foreign key ( recorded_by_supervisor_id )
      references supervisor ( person_id ),
   constraint fk_salary_payee foreign key ( payee_id )
      references person ( person_id ),
   constraint fk_salary_expense foreign key ( expense_source_id )
      references expenses ( source_id ),
   constraint ck_salary_payee_role
      check ( payee_role in ( 'SUPERVISOR',
                              'EMPLOYEE',
                              'DOCTOR' ) ),
   constraint ck_salary_amount check ( salary_amount >= 0 )
);

-- Application sequences used by trigger/backend-generated readable identifiers.
create sequence person_id_seq
   start with 1 increment by 1 nocache nocycle;

create sequence system_user_id_seq
   start with 1 increment by 1 nocache nocycle;

create sequence local_pet_id_seq
   start with 1 increment by 1 nocache nocycle;

create sequence guest_pet_id_seq
   start with 1 increment by 1 nocache nocycle;

create sequence rescue_id_seq
   start with 1 increment by 1 nocache nocycle;

create sequence medical_record_id_seq
   start with 1 increment by 1 nocache nocycle;

create sequence adoption_id_seq
   start with 1 increment by 1 nocache nocycle;

-- Project Update-3: sequence-generated audit identifiers and trigger-driven activity history.
create table audit_log (
   audit_id    number constraint pk_audit_log primary key,
   event_type  varchar2(50) not null,
   entity_name varchar2(50) not null,
   entity_id   varchar2(12),
   old_value   varchar2(100),
   new_value   varchar2(100),
   changed_by  varchar2(128) not null,
   changed_at  date default sysdate not null
);

create sequence audit_log_seq
   start with 1 increment by 1 nocache nocycle;

create or replace package petcare_id_context as
   procedure set_pet_prefix(p_prefix varchar2);
   procedure clear_pet_prefix;
   function pet_prefix return varchar2;
end petcare_id_context;
/

create or replace package body petcare_id_context as
   g_pet_prefix varchar2(2);

   procedure set_pet_prefix(p_prefix varchar2) as
   begin
      g_pet_prefix := upper(p_prefix);
   end;

   procedure clear_pet_prefix as
   begin
      g_pet_prefix := null;
   end;

   function pet_prefix return varchar2 as
   begin
      return nvl(g_pet_prefix,'LP');
   end;
end petcare_id_context;
/

create or replace package petcare_audit_context as
   g_actor_person_id varchar2(12);
   procedure set_actor(p_person_id varchar2);
   procedure clear_actor;
end petcare_audit_context;
/

create or replace package body petcare_audit_context as
   procedure set_actor(p_person_id varchar2) as
   begin
      g_actor_person_id := p_person_id;
   end;

   procedure clear_actor as
   begin
      g_actor_person_id := null;
   end;
end petcare_audit_context;
/

create or replace trigger trg_person_auto_id before
   insert on person
   for each row
   when ( new.person_id is null )
declare
   v_next      number;
   v_candidate person.person_id%type;
   v_count     number;
begin
   loop
      select person_id_seq.nextval into v_next from dual;
      v_candidate := 'P' || lpad(v_next,3,'0');
      select count(*) into v_count from person where person_id = v_candidate;
      if v_count = 0 then
         :new.person_id := v_candidate;
         exit;
      end if;
   end loop;
end;
/

create or replace trigger trg_system_user_auto_id before
   insert on system_user
   for each row
   when ( new.user_id is null )
declare
   v_next      number;
   v_candidate system_user.user_id%type;
   v_count     number;
begin
   loop
      select system_user_id_seq.nextval into v_next from dual;
      v_candidate := 'U' || lpad(v_next,3,'0');
      select count(*) into v_count from system_user where user_id = v_candidate;
      if v_count = 0 then
         :new.user_id := v_candidate;
         exit;
      end if;
   end loop;
end;
/

create or replace trigger trg_pet_auto_local_id before
   insert on pet
   for each row
   when ( new.pet_id is null )
declare
   v_next      number;
   v_prefix    varchar2(2);
   v_candidate pet.pet_id%type;
   v_count     number;
begin
   v_prefix := petcare_id_context.pet_prefix;
   if v_prefix not in ( 'LP','GP' ) then
      v_prefix := 'LP';
   end if;

   loop
      if v_prefix = 'GP' then
         select guest_pet_id_seq.nextval into v_next from dual;
      else
         select local_pet_id_seq.nextval into v_next from dual;
      end if;

      v_candidate := v_prefix || lpad(v_next,3,'0');
      select count(*) into v_count from pet where pet_id = v_candidate;

      if v_count = 0 then
         :new.pet_id := v_candidate;
         exit;
      end if;
   end loop;
end;
/

create or replace trigger trg_medical_record_auto_id before
   insert on medical_record
   for each row
   when ( new.record_id is null )
declare
   v_next      number;
   v_candidate medical_record.record_id%type;
   v_count     number;
begin
   loop
      select medical_record_id_seq.nextval into v_next from dual;
      v_candidate := 'MR' || lpad(v_next,3,'0');
      select count(*) into v_count from medical_record where record_id = v_candidate;
      if v_count = 0 then
         :new.record_id := v_candidate;
         exit;
      end if;
   end loop;
end;
/

create or replace trigger trg_rescue_auto_id before
   insert on rescue
   for each row
   when ( new.rescue_id is null )
declare
   v_next      number;
   v_candidate rescue.rescue_id%type;
   v_count     number;
begin
   loop
      select rescue_id_seq.nextval into v_next from dual;
      v_candidate := 'R' || lpad(v_next,3,'0');
      select count(*) into v_count from rescue where rescue_id = v_candidate;
      if v_count = 0 then
         :new.rescue_id := v_candidate;
         exit;
      end if;
   end loop;
end;
/

create or replace trigger trg_adoption_auto_id before
   insert on adoption_process
   for each row
   when ( new.adoption_id is null )
declare
   v_next      number;
   v_candidate adoption_process.adoption_id%type;
   v_count     number;
begin
   loop
      select adoption_id_seq.nextval into v_next from dual;
      v_candidate := 'AD' || lpad(v_next,3,'0');
      select count(*) into v_count from adoption_process where adoption_id = v_candidate;
      if v_count = 0 then
         :new.adoption_id := v_candidate;
         exit;
      end if;
   end loop;
end;
/

create or replace trigger trg_audit_log_id before
   insert on audit_log
   for each row
   when ( new.audit_id is null )
begin
   select audit_log_seq.nextval into :new.audit_id from dual;
end;
/

create or replace trigger trg_adoption_status_audit after
   update of status on adoption_process
   for each row
   when ( old.status <> new.status )
begin
   insert into audit_log (
      event_type,entity_name,entity_id,old_value,new_value,changed_by,changed_at
   ) values (
      'ADOPTION_STATUS_CHANGED','ADOPTION_PROCESS',:new.adoption_id,
      :old.status,:new.status,
      nvl(petcare_audit_context.g_actor_person_id,user),sysdate
   );
end;
/

create or replace trigger trg_role_app_no_owner before
   insert or update of requested_role on role_application
   for each row
begin
   if :new.requested_role = 'OWNER' then
      raise_application_error(
         -20041,
         'Owner role cannot be requested through role applications.'
      );
   end if;
end;
/

create or replace trigger trg_salary_payee_role before
   insert or update of payee_id,payee_role on salary
   for each row
declare
   v_count number;
begin
   if :new.payee_role = 'SUPERVISOR' then
      select count(*)
        into v_count
        from supervisor
       where person_id = :new.payee_id;
   elsif :new.payee_role = 'EMPLOYEE' then
      select count(*)
        into v_count
        from employee
       where person_id = :new.payee_id;
   else
      select count(*)
        into v_count
        from doctor
       where person_id = :new.payee_id;
   end if;

   if v_count = 0 then
      raise_application_error(
         -20031,
         'Selected person does not have the chosen payroll role'
      );
   end if;
end;
=======
CREATE TABLE ADOPTION_PROCESS (
  ADOPTION_ID VARCHAR2(12) CONSTRAINT PK_ADOPTION_PROCESS PRIMARY KEY,
  ADOPTER_ID VARCHAR2(12) NOT NULL,
  EMPLOYEE_ID VARCHAR2(12),
  LOCAL_PET_ID VARCHAR2(12) NOT NULL,
  APPLY_DATE DATE DEFAULT TRUNC(SYSDATE) NOT NULL,
  STATUS VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
  CONSTRAINT FK_ADOPTION_ADOPTER FOREIGN KEY (ADOPTER_ID) REFERENCES ADOPTER(PERSON_ID),
  CONSTRAINT FK_ADOPTION_EMPLOYEE FOREIGN KEY (EMPLOYEE_ID) REFERENCES EMPLOYEE(PERSON_ID),
  CONSTRAINT FK_ADOPTION_LOCAL_PET FOREIGN KEY (LOCAL_PET_ID) REFERENCES LOCAL_PET(PET_ID),
  CONSTRAINT CK_ADOPTION_STATUS CHECK (STATUS IN ('PENDING','APPROVED','REJECTED','COMPLETED','CANCELLED'))
);

-- Supervisor manages the Adoption Process aggregation.
CREATE TABLE ADOPTION_MANAGEMENT (
  SUPERVISOR_ID VARCHAR2(12) NOT NULL,
  ADOPTION_ID VARCHAR2(12) NOT NULL,
  ASSIGN_DATE DATE NOT NULL,
  SALARY NUMBER(12,2),
  CONSTRAINT PK_ADOPTION_MANAGEMENT PRIMARY KEY (SUPERVISOR_ID,ADOPTION_ID),
  CONSTRAINT UK_ADOPT_MGMT_ADOPTION UNIQUE (ADOPTION_ID),
  CONSTRAINT FK_ADOPT_MGMT_SUPERVISOR FOREIGN KEY (SUPERVISOR_ID) REFERENCES SUPERVISOR(PERSON_ID),
  CONSTRAINT FK_ADOPT_MGMT_ADOPTION FOREIGN KEY (ADOPTION_ID) REFERENCES ADOPTION_PROCESS(ADOPTION_ID) ON DELETE CASCADE,
  CONSTRAINT CK_ADOPT_MGMT_SALARY CHECK (SALARY IS NULL OR SALARY >= 0)
);

-- One payroll row represents one staff payment recorded by a supervisor.
CREATE TABLE SALARY (
  SALARY_ID VARCHAR2(12) CONSTRAINT PK_SALARY PRIMARY KEY,
  RECORDED_BY_SUPERVISOR_ID VARCHAR2(12) NOT NULL,
  PAYEE_ID VARCHAR2(12) NOT NULL,
  PAYEE_ROLE VARCHAR2(20) NOT NULL,
  EXPENSE_SOURCE_ID VARCHAR2(12) NOT NULL,
  SALARY_MONTH VARCHAR2(7) NOT NULL,
  PAYMENT_DATE DATE NOT NULL,
  SALARY_AMOUNT NUMBER(12,2) NOT NULL,
  CONSTRAINT UK_SALARY_EXPENSE UNIQUE (EXPENSE_SOURCE_ID),
  CONSTRAINT FK_SALARY_RECORDED_BY FOREIGN KEY (RECORDED_BY_SUPERVISOR_ID) REFERENCES SUPERVISOR(PERSON_ID),
  CONSTRAINT FK_SALARY_PAYEE FOREIGN KEY (PAYEE_ID) REFERENCES PERSON(PERSON_ID),
  CONSTRAINT FK_SALARY_EXPENSE FOREIGN KEY (EXPENSE_SOURCE_ID) REFERENCES EXPENSES(SOURCE_ID),
  CONSTRAINT CK_SALARY_PAYEE_ROLE CHECK (PAYEE_ROLE IN ('SUPERVISOR','EMPLOYEE','DOCTOR')),
  CONSTRAINT CK_SALARY_AMOUNT CHECK (SALARY_AMOUNT >= 0)
);

CREATE OR REPLACE TRIGGER TRG_SALARY_PAYEE_ROLE
BEFORE INSERT OR UPDATE OF PAYEE_ID,PAYEE_ROLE ON SALARY
FOR EACH ROW
DECLARE
  V_COUNT NUMBER;
BEGIN
  IF :NEW.PAYEE_ROLE='SUPERVISOR' THEN
    SELECT COUNT(*) INTO V_COUNT FROM SUPERVISOR WHERE PERSON_ID=:NEW.PAYEE_ID;
  ELSIF :NEW.PAYEE_ROLE='EMPLOYEE' THEN
    SELECT COUNT(*) INTO V_COUNT FROM EMPLOYEE WHERE PERSON_ID=:NEW.PAYEE_ID;
  ELSE
    SELECT COUNT(*) INTO V_COUNT FROM DOCTOR WHERE PERSON_ID=:NEW.PAYEE_ID;
  END IF;

  IF V_COUNT=0 THEN
    RAISE_APPLICATION_ERROR(-20031,'Selected person does not have the chosen payroll role');
  END IF;
END;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
/

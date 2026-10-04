

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
);

-- An adopter submits first; a supervisor assigns an employee after approval.

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
/

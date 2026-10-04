-- Simple view: persons and their derived age.
<<<<<<< HEAD
create or replace view vw_person_basic as
   select person_id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          email,
          trunc(months_between(
             sysdate,
             date_of_birth
          ) / 12) age
     from person;


-- Complex view: subtype/role membership.
create or replace view vw_person_roles as
   select p.person_id,
          p.first_name,
          p.last_name,
          p.date_of_birth,
          p.gender,
          p.email,
          trunc(months_between(
             sysdate,
             p.date_of_birth
          ) / 12) age,
          rtrim(
                case
                   when d.person_id is not null then
                      'DOCTOR,'
                end
                ||
                case
                   when v.person_id is not null then
                      'VOLUNTEER,'
                end
                ||
                case
                   when s.person_id is not null then
                      'SUPERVISOR,'
                end
                ||
                case
                   when e.person_id is not null then
                      'EMPLOYEE,'
                end
                ||
                case
                   when a.person_id is not null then
                      'ADOPTER,'
                end
                ||
                case
                   when o.person_id is not null then
                      'OWNER,'
                end
                ||
                case
                   when dn.person_id is not null then
                      'DONOR,'
                end,
                ','
          ) roles
     from person p
     left join doctor d
   on d.person_id = p.person_id
     left join volunteer v
   on v.person_id = p.person_id
     left join supervisor s
   on s.person_id = p.person_id
     left join employee e
   on e.person_id = p.person_id
     left join adopter a
   on a.person_id = p.person_id
     left join owner o
   on o.person_id = p.person_id
     left join donor dn
   on dn.person_id = p.person_id;



create or replace view vw_role_directory as
   select 'DOCTOR' role_name,
          p.person_id,
          p.first_name
          || ' '
          || p.last_name full_name,
          d.specialization details,
          d.salary amount
     from doctor d
     join person p
   on p.person_id = d.person_id
   union all
   select 'VOLUNTEER',
          p.person_id,
          p.first_name
          || ' '
          || p.last_name,
          v.skill,
          null
     from volunteer v
     join person p
   on p.person_id = v.person_id
   union all
   select 'SUPERVISOR',
          p.person_id,
          p.first_name
          || ' '
          || p.last_name,
          'Shelter and adoption supervision',
          null
     from supervisor s
     join person p
   on p.person_id = s.person_id
   union all
   select 'EMPLOYEE',
          p.person_id,
          p.first_name
          || ' '
          || p.last_name,
          e.position,
          e.salary
     from employee e
     join person p
   on p.person_id = e.person_id
   union all
   select 'ADOPTER',
          p.person_id,
          p.first_name
          || ' '
          || p.last_name,
          a.occupation,
          null
     from adopter a
     join person p
   on p.person_id = a.person_id
   union all
   select 'DONOR',
          p.person_id,
          p.first_name
          || ' '
          || p.last_name,
          d.occupation,
          d.donation_amount
     from donor d
     join person p
   on p.person_id = d.person_id
   union all
   select 'OWNER',
          p.person_id,
          p.first_name
          || ' '
          || p.last_name,
          o.occupation,
          null
     from owner o
     join person p
   on p.person_id = o.person_id;



create or replace view vw_pet_details as
   select p.pet_id,
          p.name,
          p.species,
          p.breed,
          p.dob,
          trunc(months_between(
             sysdate,
             p.dob
          ) / 12) age,
          p.weight,
          case
             when l.pet_id is not null then
                'LOCAL'
             when g.pet_id is not null then
                'GUEST'
          end pet_type,
          l.adoption_status,
          l.in_take_date,
          g.check_in_date,
          g.relevant_time,
          ps.shelter_id,
          case
             when g.pet_id is not null then 'OWNER'
             when ap.status = 'ADOPTED' then 'ADOPTER'
             when ap.status = 'APPROVED' then 'ASSIGNED EMPLOYEE'
             when ss.supervisor_id is not null then 'SHELTER SUPERVISOR'
             else 'UNASSIGNED'
          end responsibility_type,
          case
             when g.pet_id is not null then owner_person.person_id
             when ap.status = 'ADOPTED' then adopter_person.person_id
             when ap.status = 'APPROVED' then employee_person.person_id
             else supervisor_person.person_id
          end responsible_id,
          case
             when g.pet_id is not null then owner_person.first_name || ' ' || owner_person.last_name
             when ap.status = 'ADOPTED' then adopter_person.first_name || ' ' || adopter_person.last_name
             when ap.status = 'APPROVED' then employee_person.first_name || ' ' || employee_person.last_name
             when ss.supervisor_id is not null then supervisor_person.first_name || ' ' || supervisor_person.last_name
             else 'Not assigned'
          end responsible_name
     from pet p
     left join local_pet l
   on l.pet_id = p.pet_id
     left join guest_pet g
   on g.pet_id = p.pet_id
     left join (
      select pet_id,min(owner_id) owner_id
        from guest_pet_owner
       group by pet_id
   ) gpo on gpo.pet_id=p.pet_id
     left join person owner_person on owner_person.person_id=gpo.owner_id
     left join (
      select local_pet_id,adopter_id,employee_id,status
        from (
         select adoption_process.*,
                row_number() over(
                  partition by local_pet_id
                  order by case status when 'ADOPTED' then 1 when 'APPROVED' then 2 when 'PENDING' then 3 else 4 end,
                           apply_date desc,adoption_id desc
                ) rn
           from adoption_process
        )
       where rn=1
   ) ap on ap.local_pet_id=p.pet_id
     left join person adopter_person on adopter_person.person_id=ap.adopter_id
     left join person employee_person on employee_person.person_id=ap.employee_id
     left join (
      select pet_id,min(shelter_id) shelter_id
        from pet_shelter
       group by pet_id
   ) ps on ps.pet_id=p.pet_id
     left join (
      select shelter_id,min(supervisor_id) supervisor_id
        from shelter_supervision
       group by shelter_id
   ) ss on ss.shelter_id=ps.shelter_id
     left join person supervisor_person on supervisor_person.person_id=ss.supervisor_id;



create or replace view vw_shelter_overview as
   select s.shelter_id,
          s.room_type,
          nvl(
             p.pet_count,
             0
          ) pet_count,
          nvl(
             r.rescue_count,
             0
          ) rescue_count,
          sup.supervisor_name
     from shelter s
     left join (
      select shelter_id,
             count(*) pet_count
        from pet_shelter
       group by shelter_id
   ) p
   on p.shelter_id = s.shelter_id
     left join (
      select shelter_id,
             count(*) rescue_count
        from rescue_shelter
       group by shelter_id
   ) r
   on r.shelter_id = s.shelter_id
     left join (
      select ss.shelter_id,
             pe.first_name
             || ' '
             || pe.last_name supervisor_name
        from shelter_supervision ss
        join person pe
      on pe.person_id = ss.supervisor_id
   ) sup
   on sup.shelter_id = s.shelter_id;



-- UPDATED: LEFT JOIN REMOVED
create or replace view vw_rescue_details as
   select r.rescue_id,
          r.rescue_date,
          r.location,
          rs.shelter_id,
          v.volunteer_id,
          p.first_name
          || ' '
          || p.last_name volunteer_name
     from rescue r
     join rescue_shelter rs
   on rs.rescue_id = r.rescue_id
     join volunteer_rescue v
   on v.rescue_id = r.rescue_id
     join person p
   on p.person_id = v.volunteer_id;



create or replace view vw_adoption_applications as
   select ap.adoption_id,
          ap.apply_date,
          ap.status,
          ap.adopter_id,
          ad.first_name
          || ' '
          || ad.last_name adopter_name,
          ap.employee_id,
          em.first_name
          || ' '
          || em.last_name employee_name,
          ap.local_pet_id,
          pet.name pet_name,
          am.supervisor_id,
          su.first_name
          || ' '
          || su.last_name supervisor_name,
          am.assign_date review_date
     from adoption_process ap
     join person ad
   on ad.person_id = ap.adopter_id
     left join person em
   on em.person_id = ap.employee_id
     join pet pet
   on pet.pet_id = ap.local_pet_id
     left join adoption_management am
   on am.adoption_id = ap.adoption_id
     left join person su
   on su.person_id = am.supervisor_id;



create or replace view vw_medical_details as
   select mr.record_id,
          mr.pet_id,
          p.name pet_name,
          mr.health_status,
          mr.diagnosis,
          mr.treatment,
          m.medicine_id,
          m.dosage,
          m.price medicine_price,
          v.vaccine_id,
          v.vaccine_name,
          v.v_date,
          v.next_dose,
          v.price vaccine_price
     from medical_record mr
     join pet p
   on p.pet_id = mr.pet_id
     left join medical_record_medicine mrm
   on mrm.record_id = mr.record_id
     left join medicine m
   on m.medicine_id = mrm.medicine_id
     left join medical_record_vaccination mrv
   on mrv.record_id = mr.record_id
     left join vaccination v
   on v.vaccine_id = mrv.vaccine_id;



create or replace view vw_finance_summary as
   select f.opening_balance,
          i.total_income,
          e.total_expenses,
          i.total_income - e.total_expenses net_activity,
          f.opening_balance + i.total_income - e.total_expenses available_balance
     from (
      select nvl(sum(current_balance),0) opening_balance
        from finance
   ) f
     cross join (
      select nvl(sum(i.amount),0) total_income
        from income i
       where exists (
          select 1 from finance_income fi where fi.source_id=i.source_id
       )
   ) i
     cross join (
      select nvl(sum(e.amount),0) total_expenses
        from expenses e
       where exists (
          select 1 from finance_expense fe where fe.source_id=e.source_id
       )
   ) e;



create or replace view vw_salary_details as
   select s.salary_id,
          s.recorded_by_supervisor_id,
          sp.first_name
          || ' '
          || sp.last_name recorded_by,
          s.payee_id,
          pp.first_name
          || ' '
          || pp.last_name payee_name,
          s.payee_role,
          s.salary_month,
          to_char(
             s.payment_date,
             'YYYY-MM-DD'
          ) payment_date,
          s.expense_source_id,
          x.source_name,
          s.salary_amount
     from salary s
     join person sp
   on sp.person_id = s.recorded_by_supervisor_id
     join person pp
   on pp.person_id = s.payee_id
     join expenses x
   on x.source_id = s.expense_source_id;



create or replace view vw_dashboard_stats as
   select (
      select count(*)
        from person
   ) person_count,
          (
             select count(*)
               from pet
          ) pet_count,
          (
             select count(*)
               from local_pet
              where adoption_status = 'AVAILABLE'
          ) available_local_pets,
          (
             select count(*)
               from adoption_process
              where status = 'PENDING'
          ) pending_applications,
          (
             select count(*)
               from rescue
          ) rescue_count,
          (
             select nvl(
                sum(amount),
                0
             )
               from income
          ) total_income,
          (
             select nvl(
                sum(amount),
                0
             )
               from expenses
          ) total_expenses
     from dual;
=======
CREATE OR REPLACE VIEW VW_PERSON_BASIC AS
SELECT PERSON_ID,FIRST_NAME,LAST_NAME,DATE_OF_BIRTH,GENDER,EMAIL,
       TRUNC(MONTHS_BETWEEN(SYSDATE,DATE_OF_BIRTH)/12) AGE
FROM PERSON;

-- Complex view: subtype/role membership.
CREATE OR REPLACE VIEW VW_PERSON_ROLES AS
SELECT p.PERSON_ID,p.FIRST_NAME,p.LAST_NAME,p.DATE_OF_BIRTH,p.GENDER,p.EMAIL,
       TRUNC(MONTHS_BETWEEN(SYSDATE,p.DATE_OF_BIRTH)/12) AGE,
       RTRIM(
         CASE WHEN d.PERSON_ID IS NOT NULL THEN 'DOCTOR,' END||
         CASE WHEN v.PERSON_ID IS NOT NULL THEN 'VOLUNTEER,' END||
         CASE WHEN s.PERSON_ID IS NOT NULL THEN 'SUPERVISOR,' END||
         CASE WHEN e.PERSON_ID IS NOT NULL THEN 'EMPLOYEE,' END||
         CASE WHEN a.PERSON_ID IS NOT NULL THEN 'ADOPTER,' END||
         CASE WHEN o.PERSON_ID IS NOT NULL THEN 'OWNER,' END||
         CASE WHEN dn.PERSON_ID IS NOT NULL THEN 'DONOR,' END,',') ROLES
FROM PERSON p
LEFT JOIN DOCTOR d ON d.PERSON_ID=p.PERSON_ID
LEFT JOIN VOLUNTEER v ON v.PERSON_ID=p.PERSON_ID
LEFT JOIN SUPERVISOR s ON s.PERSON_ID=p.PERSON_ID
LEFT JOIN EMPLOYEE e ON e.PERSON_ID=p.PERSON_ID
LEFT JOIN ADOPTER a ON a.PERSON_ID=p.PERSON_ID
LEFT JOIN OWNER o ON o.PERSON_ID=p.PERSON_ID
LEFT JOIN DONOR dn ON dn.PERSON_ID=p.PERSON_ID;

CREATE OR REPLACE VIEW VW_ROLE_DIRECTORY AS
SELECT 'DOCTOR' ROLE_NAME,p.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME FULL_NAME,d.SPECIALIZATION DETAILS,d.SALARY AMOUNT FROM DOCTOR d JOIN PERSON p ON p.PERSON_ID=d.PERSON_ID
UNION ALL
SELECT 'VOLUNTEER',p.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME,v.SKILL,NULL FROM VOLUNTEER v JOIN PERSON p ON p.PERSON_ID=v.PERSON_ID
UNION ALL
SELECT 'SUPERVISOR',p.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME,'Shelter and adoption supervision',NULL FROM SUPERVISOR s JOIN PERSON p ON p.PERSON_ID=s.PERSON_ID
UNION ALL
SELECT 'EMPLOYEE',p.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME,e.POSITION,e.SALARY FROM EMPLOYEE e JOIN PERSON p ON p.PERSON_ID=e.PERSON_ID
UNION ALL
SELECT 'ADOPTER',p.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME,a.OCCUPATION,NULL FROM ADOPTER a JOIN PERSON p ON p.PERSON_ID=a.PERSON_ID
UNION ALL
SELECT 'DONOR',p.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME,d.OCCUPATION,d.DONATION_AMOUNT FROM DONOR d JOIN PERSON p ON p.PERSON_ID=d.PERSON_ID
UNION ALL
SELECT 'OWNER',p.PERSON_ID,p.FIRST_NAME||' '||p.LAST_NAME,o.OCCUPATION,NULL FROM OWNER o JOIN PERSON p ON p.PERSON_ID=o.PERSON_ID;

CREATE OR REPLACE VIEW VW_PET_DETAILS AS
SELECT p.PET_ID,p.NAME,p.SPECIES,p.BREED,p.DOB,
       TRUNC(MONTHS_BETWEEN(SYSDATE,p.DOB)/12) AGE,p.WEIGHT,
       CASE WHEN l.PET_ID IS NOT NULL THEN 'LOCAL' WHEN g.PET_ID IS NOT NULL THEN 'GUEST' END PET_TYPE,
       l.ADOPTION_STATUS,l.IN_TAKE_DATE,g.CHECK_IN_DATE,g.RELEVANT_TIME
FROM PET p
LEFT JOIN LOCAL_PET l ON l.PET_ID=p.PET_ID
LEFT JOIN GUEST_PET g ON g.PET_ID=p.PET_ID;

CREATE OR REPLACE VIEW VW_SHELTER_OVERVIEW AS
SELECT s.SHELTER_ID,s.ROOM_TYPE,
       NVL(p.PET_COUNT,0) PET_COUNT,
       NVL(r.RESCUE_COUNT,0) RESCUE_COUNT,
       sup.SUPERVISOR_NAME
FROM SHELTER s
LEFT JOIN (SELECT SHELTER_ID,COUNT(*) PET_COUNT FROM PET_SHELTER GROUP BY SHELTER_ID) p ON p.SHELTER_ID=s.SHELTER_ID
LEFT JOIN (SELECT SHELTER_ID,COUNT(*) RESCUE_COUNT FROM RESCUE_SHELTER GROUP BY SHELTER_ID) r ON r.SHELTER_ID=s.SHELTER_ID
LEFT JOIN (
  SELECT ss.SHELTER_ID,pe.FIRST_NAME||' '||pe.LAST_NAME SUPERVISOR_NAME
  FROM SHELTER_SUPERVISION ss JOIN PERSON pe ON pe.PERSON_ID=ss.SUPERVISOR_ID
) sup ON sup.SHELTER_ID=s.SHELTER_ID;

CREATE OR REPLACE VIEW VW_RESCUE_DETAILS AS
SELECT r.RESCUE_ID,r.RESCUE_DATE,r.LOCATION,rs.SHELTER_ID,
       v.VOLUNTEER_ID,p.FIRST_NAME||' '||p.LAST_NAME VOLUNTEER_NAME
FROM RESCUE r
LEFT JOIN RESCUE_SHELTER rs ON rs.RESCUE_ID=r.RESCUE_ID
LEFT JOIN VOLUNTEER_RESCUE v ON v.RESCUE_ID=r.RESCUE_ID
LEFT JOIN PERSON p ON p.PERSON_ID=v.VOLUNTEER_ID;

CREATE OR REPLACE VIEW VW_ADOPTION_APPLICATIONS AS
SELECT ap.ADOPTION_ID,ap.APPLY_DATE,ap.STATUS,
       ap.ADOPTER_ID,ad.FIRST_NAME||' '||ad.LAST_NAME ADOPTER_NAME,
       ap.EMPLOYEE_ID,em.FIRST_NAME||' '||em.LAST_NAME EMPLOYEE_NAME,
       ap.LOCAL_PET_ID,pet.NAME PET_NAME,
       am.SUPERVISOR_ID,su.FIRST_NAME||' '||su.LAST_NAME SUPERVISOR_NAME,
       am.ASSIGN_DATE REVIEW_DATE
FROM ADOPTION_PROCESS ap
JOIN PERSON ad ON ad.PERSON_ID=ap.ADOPTER_ID
LEFT JOIN PERSON em ON em.PERSON_ID=ap.EMPLOYEE_ID
JOIN PET pet ON pet.PET_ID=ap.LOCAL_PET_ID
LEFT JOIN ADOPTION_MANAGEMENT am ON am.ADOPTION_ID=ap.ADOPTION_ID
LEFT JOIN PERSON su ON su.PERSON_ID=am.SUPERVISOR_ID;

CREATE OR REPLACE VIEW VW_MEDICAL_DETAILS AS
SELECT mr.RECORD_ID,mr.PET_ID,p.NAME PET_NAME,mr.HEALTH_STATUS,mr.DIAGNOSIS,mr.TREATMENT,
       m.MEDICINE_ID,m.DOSAGE,m.PRICE MEDICINE_PRICE,
       v.VACCINE_ID,v.VACCINE_NAME,v.V_DATE,v.NEXT_DOSE,v.PRICE VACCINE_PRICE
FROM MEDICAL_RECORD mr
JOIN PET p ON p.PET_ID=mr.PET_ID
LEFT JOIN MEDICAL_RECORD_MEDICINE mrm ON mrm.RECORD_ID=mr.RECORD_ID
LEFT JOIN MEDICINE m ON m.MEDICINE_ID=mrm.MEDICINE_ID
LEFT JOIN MEDICAL_RECORD_VACCINATION mrv ON mrv.RECORD_ID=mr.RECORD_ID
LEFT JOIN VACCINATION v ON v.VACCINE_ID=mrv.VACCINE_ID;

CREATE OR REPLACE VIEW VW_FINANCE_SUMMARY AS
SELECT f.FINANCE_ID,f.CURRENT_BALANCE,
       NVL(i.TOTAL_INCOME,0) TOTAL_INCOME,
       NVL(e.TOTAL_EXPENSES,0) TOTAL_EXPENSES,
       NVL(i.TOTAL_INCOME,0)-NVL(e.TOTAL_EXPENSES,0) NET_AMOUNT
FROM FINANCE f
LEFT JOIN (
  SELECT fi.FINANCE_ID,SUM(i.AMOUNT) TOTAL_INCOME
  FROM FINANCE_INCOME fi JOIN INCOME i ON i.SOURCE_ID=fi.SOURCE_ID
  GROUP BY fi.FINANCE_ID
) i ON i.FINANCE_ID=f.FINANCE_ID
LEFT JOIN (
  SELECT fe.FINANCE_ID,SUM(e.AMOUNT) TOTAL_EXPENSES
  FROM FINANCE_EXPENSE fe JOIN EXPENSES e ON e.SOURCE_ID=fe.SOURCE_ID
  GROUP BY fe.FINANCE_ID
) e ON e.FINANCE_ID=f.FINANCE_ID;

CREATE OR REPLACE VIEW VW_SALARY_DETAILS AS
SELECT s.SALARY_ID,s.RECORDED_BY_SUPERVISOR_ID,
       sp.FIRST_NAME||' '||sp.LAST_NAME RECORDED_BY,
       s.PAYEE_ID,pp.FIRST_NAME||' '||pp.LAST_NAME PAYEE_NAME,s.PAYEE_ROLE,
       s.SALARY_MONTH,TO_CHAR(s.PAYMENT_DATE,'YYYY-MM-DD') PAYMENT_DATE,
       s.EXPENSE_SOURCE_ID,x.SOURCE_NAME,s.SALARY_AMOUNT
FROM SALARY s
JOIN PERSON sp ON sp.PERSON_ID=s.RECORDED_BY_SUPERVISOR_ID
JOIN PERSON pp ON pp.PERSON_ID=s.PAYEE_ID
JOIN EXPENSES x ON x.SOURCE_ID=s.EXPENSE_SOURCE_ID;

CREATE OR REPLACE VIEW VW_DASHBOARD_STATS AS
SELECT (SELECT COUNT(*) FROM PERSON) PERSON_COUNT,
       (SELECT COUNT(*) FROM PET) PET_COUNT,
       (SELECT COUNT(*) FROM LOCAL_PET WHERE ADOPTION_STATUS='AVAILABLE') AVAILABLE_LOCAL_PETS,
       (SELECT COUNT(*) FROM ADOPTION_PROCESS WHERE STATUS='PENDING') PENDING_APPLICATIONS,
       (SELECT COUNT(*) FROM RESCUE) RESCUE_COUNT,
       (SELECT NVL(SUM(AMOUNT),0) FROM INCOME) TOTAL_INCOME,
       (SELECT NVL(SUM(AMOUNT),0) FROM EXPENSES) TOTAL_EXPENSES
FROM DUAL;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0

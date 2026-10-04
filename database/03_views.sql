-- Simple view: persons and their derived age.
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

# Final data dictionary

Oracle identifiers use uppercase names. IDs are `VARCHAR2(12)`, dates are `DATE`, and money is `NUMBER(12,2)` or `NUMBER(14,2)`.

## Person and ISA tables

| Table | Primary key | Important columns / purpose |
|---|---|---|
| PERSON | PERSON_ID | FIRST_NAME, LAST_NAME, DATE_OF_BIRTH, GENDER, EMAIL |
| PERSON_ADDRESS | PERSON_ID + HOUSE_NO + STREET + CITY | Multivalued composite Address |
| PERSON_PHONE | PERSON_ID + PHONE | Multivalued Phone |
| SYSTEM_USER | USER_ID | One account per PERSON; username, bcrypt hash, role, status |
<<<<<<< HEAD
| SYSTEM_USER_ROLE | USER_ID + ROLE_NAME | Approved roles available through the account role switcher |
| ROLE_APPLICATION | ROLE_APPLICATION_ID | Pending/approved/rejected role request and role-specific reviewer |
=======
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
| EMERGENCY_NO | PERSON_ID + E_NAME | Weak entity; relation and phone |
| DOCTOR | PERSON_ID | Salary, specialization |
| VOLUNTEER | PERSON_ID | Skill |
| SUPERVISOR | PERSON_ID | Supervisor subtype |
| EMPLOYEE | PERSON_ID | Occupation, hire date, position, salary |
| ADOPTER | PERSON_ID | Occupation |
| DONOR | PERSON_ID | Donation amount, occupation |
| OWNER | PERSON_ID | Occupation |
| DOCTOR_TRAINING | SENIOR_DOCTOR_ID + JUNIOR_DOCTOR_ID | Recursive Trains relationship |

## Pet, shelter and rescue tables

| Table | Primary key | Important columns / purpose |
|---|---|---|
| PET | PET_ID | Name, DOB, breed, species, weight |
| LOCAL_PET | PET_ID | Adoption status, intake date |
| GUEST_PET | PET_ID | Check-in date, relevant time |
| SHELTER | SHELTER_ID | Room type |
| RESCUE | RESCUE_ID | Rescue date, location |
| RESCUE_SHELTER | RESCUE_ID | Rescued In relationship |
| PET_SHELTER | PET_ID + SHELTER_ID | House relationship |
| GUEST_PET_OWNER | PET_ID + OWNER_ID | Owns relationship |
| VOLUNTEER_RESCUE | VOLUNTEER_ID + RESCUE_ID | Participates relationship |
| SHELTER_SUPERVISION | SUPERVISOR_ID + SHELTER_ID | Supervise relationship |

## Medical and finance tables

| Table | Primary key | Important columns / purpose |
|---|---|---|
| MEDICAL_RECORD | RECORD_ID | Pet, diagnosis, treatment, health status |
| MEDICINE | MEDICINE_ID | Dosage, price |
| VACCINATION | VACCINE_ID | Name, date, dose count, next dose, price |
| MEDICAL_RECORD_MEDICINE | RECORD_ID + MEDICINE_ID | Medical Record Contains Medicine |
| MEDICAL_RECORD_VACCINATION | RECORD_ID + VACCINE_ID | Medical Record Includes Vaccination |
| FINANCE | FINANCE_ID | Current balance |
| INCOME | SOURCE_ID | Source name, amount |
| EXPENSES | SOURCE_ID | Source name, amount |
| FINANCE_INCOME | FINANCE_ID + SOURCE_ID | Receives relationship |
| FINANCE_EXPENSE | FINANCE_ID + SOURCE_ID | Records relationship |
| DONATION | DONOR_ID + SOURCE_ID | Donor Gives Income |
| OWNER_MEDICINE | OWNER_ID + MEDICINE_ID | Converted relationship |
| EXPENSE_MEDICINE | EXPENSE_SOURCE_ID + MEDICINE_ID | Have relationship |
| EXPENSE_VACCINATION | EXPENSE_SOURCE_ID + VACCINE_ID | Contains relationship |

## Adoption and salary tables

| Table | Primary key | Important columns / purpose |
|---|---|---|
| ADOPTION_PROCESS | ADOPTION_ID | Adopter, optional assigned employee, local pet, apply date, status |
| ADOPTION_MANAGEMENT | SUPERVISOR_ID + ADOPTION_ID | Aggregation management, assign date, salary |
| SALARY | SALARY_ID | One payee, payee role, salary month/date, amount, expense source and recording Supervisor |

`AGE` is derived with `MONTHS_BETWEEN` in views/functions and is not stored as an ordinary column.

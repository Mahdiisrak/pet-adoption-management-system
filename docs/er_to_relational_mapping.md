# Final ER-to-relational mapping

The final ER diagram is the source of truth. Composite attributes are flattened, multivalued attributes receive child tables, weak entities include the owner key, M:N relationships receive relationship tables, and ISA uses one supertype plus one table per subtype.

| ER component | Relational implementation | Mapping rule |
|---|---|---|
| Person | PERSON | Strong entity; PERSON_ID is PK |
| Name | FIRST_NAME, LAST_NAME in PERSON | Composite attribute flattened |
| Age | Derived in query/view/function | Derived attribute not stored |
| Address | PERSON_ADDRESS | Multivalued composite attribute |
| Phone | PERSON_PHONE | Multivalued attribute |
| System User / Has Account | SYSTEM_USER with unique PERSON_ID FK | 1:1 relationship |
<<<<<<< HEAD
| Approved account roles | SYSTEM_USER_ROLE | One login can activate multiple approved overlapping roles |
| Role request workflow | ROLE_APPLICATION | Records requester, requested role, reviewer authority and decision |
=======
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
| Emergency_No / Emergency | EMERGENCY_NO(PERSON_ID,E_NAME,...) | Weak entity; E_NAME is partial key |
| Person ISA | DOCTOR, VOLUNTEER, SUPERVISOR, EMPLOYEE, ADOPTER, DONOR, OWNER | Table per subtype using inherited PERSON_ID |
| Doctor Trains Doctor | DOCTOR_TRAINING | Recursive relationship with Senior/Junior roles |
| Volunteer Participates Rescue | VOLUNTEER_RESCUE | M:N relationship |
| Rescue / Rescued In Shelter | RESCUE, RESCUE_SHELTER | Entity plus relationship |
| Shelter Houses Pet | PET_SHELTER | Relationship table |
| Pet | PET | Strong supertype; PET_ID is PK |
| Pet ISA | LOCAL_PET, GUEST_PET | Table per subtype |
| Guest Pet Owned by Owner | GUEST_PET_OWNER | Relationship table |
| Medical Record | MEDICAL_RECORD | RECORD_ID retained as PK; PET_ID is FK |
| Medicine / Vaccination links | MEDICAL_RECORD_MEDICINE, MEDICAL_RECORD_VACCINATION | M:N relationship tables |
| Finance Receives Income | FINANCE_INCOME | Relationship table |
| Finance Records Expenses | FINANCE_EXPENSE | Relationship table |
| Donor Gives Income | DONATION | Relationship table |
| Owner Converted Medicine | OWNER_MEDICINE | Relationship table |
| Expenses Have Medicine | EXPENSE_MEDICINE | Relationship table |
| Expenses Contains Vaccination | EXPENSE_VACCINATION | Relationship table |
| Supervisor Supervises Shelter | SHELTER_SUPERVISION | Relationship table |
| Adoption + Process aggregation | ADOPTION_PROCESS | One row links an adopter and local pet; employee remains optional until supervisor approval |
| Supervisor Manages aggregation | ADOPTION_MANAGEMENT | Supervisor-to-application relationship with assign date/salary |
| Staff salary payment | SALARY | One row links one PERSON payee, their role, one recording Supervisor and one expense source |

## Constraint mapping

- Primary keys identify every entity and relationship row.
- Foreign keys preserve owner, subtype and relationship references.
- UNIQUE enforces one username/email/account where applicable.
- CHECK restricts status, gender and nonnegative monetary values.
- NOT NULL enforces mandatory attributes and total participation represented in the schema.

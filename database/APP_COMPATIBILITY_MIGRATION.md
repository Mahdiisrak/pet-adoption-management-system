# Application changes for Final ER Migration

The application code was updated for the final ER diagram.

Changes:
- OWNER.OWNER_TYPE -> OWNER.OCCUPATION
- EMERGENCY_CONTACT.CONTACT_ID -> CONTACT_NO
- Emergency Contact uses PERSON_ID + CONTACT_NO
- MEDICAL_RECORD.NOTES -> HEALTH_STATUS
- MEDICINE.UNIT_PRICE -> PRICE
- Admin donation total reads from DONOR.AMOUNT after DONATION removal

Compatibility:
- PERSON.NAME is temporarily retained.
- PERSON.PHONE_NO is temporarily retained.
- PERSON_PHONE is the new multivalued phone relation.
- NAME and PHONE_NO will be removed only after all application queries are migrated.

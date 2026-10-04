# Short viva guide

## Architecture

React is the frontend. It sends API requests to Node.js and Express. The backend uses `node-oracledb` to connect directly to Oracle. SQL Developer is a separate client connected to the same Oracle database.

## Important answers

- **Why separate PERSON_PHONE?** Phone is multivalued, so repeated values are stored as separate rows.
- **Why separate PERSON_ADDRESS?** Address is multivalued and composite; House No, Street and City remain atomic.
- **Why is EMERGENCY_NO weak?** It depends on PERSON and uses `(PERSON_ID,E_NAME)` as its key.
- **How is ISA mapped?** PERSON and PET are supertypes; each subtype has its own table using the inherited key.
- **How is age stored?** It is not stored; it is derived from Date of Birth.
- **What is the adoption transaction?** One application links one adopter, employee and local pet. Related inserts are committed together or rolled back together.
- **What is a View?** A stored query that presents data from one or more base tables.
- **What is a Cursor?** A PL/SQL work area used to process query rows one at a time.
- **What is Exception Handling?** The `EXCEPTION` section handles errors such as `NO_DATA_FOUND` without ending the program unexpectedly.
- **What is ADT?** A user-defined object type. `ADDRESS_TYPE` groups House No, Street and City.

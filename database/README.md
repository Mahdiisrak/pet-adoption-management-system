# Pet Adoption Management System

A full-stack **Pet Adoption and Management System** developed as a Database Management System (DBMS) project.

The system manages pet adoption operations, shelter management, staff management, medical records, rescue activities, and financial information through a structured relational database.

The project follows a real-world animal shelter management workflow where different users have different responsibilities.

---

# Features

## User Roles

The system currently supports four main roles:

### 1. Admin
- View overall system information
- Manage persons and staff information
- Monitor system activities

### 2. Supervisor
- Manage employees
- Manage shelters
- Manage local pets
- Manage guest pets
- Assign shelter-related activities

### 3. Doctor
- Manage medical records
- Manage vaccinations
- Manage medicines
- Manage prescriptions

### 4. Employee
- Manage adopters
- Manage owners
- Manage adoption information
- Manage personal emergency contacts

---

# Current Implemented Modules

## Dashboard
- Total pets
- Local pets
- Guest pets
- Completed adoptions
- Active rescues
- Total volunteers
- Financial information

---

## Person & Staff Management

Implemented:

- Person management
- Employee management
- Supervisor management
- Doctor management
- Volunteer management
- Emergency contact management

---

## Pet Management

Implemented:

- General pet information
- Local pets
- Guest pets
- Owner information
- Shelter assignment

---

## Adoption Management

Includes:

- Adopter information
- Adoption process tracking
- Adoption status management

---

## Medical Management

Includes:

- Medical records
- Diagnosis information
- Medicines
- Prescription management
- Vaccination records

---

## Rescue Management

Includes:

- Rescue information
- Rescue location
- Rescue date
- Volunteer participation
- Rescued pets

---

## Finance Management

Includes:

- Income
- Expenses
- Salary records
- Donation management

---

# Technology Stack

## Frontend

- React.js
- Vite
- Bootstrap
- Bootstrap Icons
- Axios
- React Router

## Backend

- Node.js
- Express.js
- Oracle Database Driver

## Database

- Oracle Database
- Oracle SQL Developer

---

# Project Architecture

```
Frontend (React)
        |
        |
        ↓
Backend API (Node + Express)
        |
        |
        ↓
Oracle Database
```

The frontend communicates with the backend through REST APIs.

The backend handles:

- Authentication
- Authorization
- Database operations
- Business logic

---

# Database Implementation

The database is designed based on an Entity Relationship (ER) Diagram.

The final database contains:

- 28 relational tables
- Primary keys
- Foreign keys
- CHECK constraints
- NOT NULL constraints
- Composite primary keys for many-to-many relationships

---

# Database Tables

Main tables include:

```
PERSON
EMPLOYEE
SUPERVISOR
DOCTOR
VOLUNTEER

PET
LOCAL_PET
GUEST_PET

OWNER
ADOPTER
ADOPTION_PROCESS

MEDICAL_RECORD
MEDICINE
PRESCRIPTION
VACCINATION

RESCUE
RESCUE_PET
RESCUE_VOLUNTEER

SHELTER
SHELTER_ASSIGNMENT

DONOR
DONATION
INCOME
EXPENSE
SALARY

SYSTEM_USER
EMERGENCY_CONTACT
PERSON_PHONE
```

---

# Database Design Approach

## 1. Supertype-Subtype Design

The PERSON entity works as a common parent entity.

Example:

```
PERSON
   |
   |---- EMPLOYEE
   |
   |---- DOCTOR
   |
   |---- SUPERVISOR
   |
   |---- VOLUNTEER
   |
   |---- OWNER
   |
   |---- DONOR
```

This avoids duplicate personal information.

---

## 2. Weak Entity Handling

Emergency contact is handled as a weak entity.

Relationship:

```
PERSON 1 ---- M EMERGENCY_CONTACT
```

The partial key:

```
CONTACT_NO
```

combined with:

```
PERSON_ID
```

uniquely identifies emergency contacts.

---

## 3. Many-to-Many Relationships

Many-to-many relationships are converted into junction tables.

Examples:

```
RESCUE ---- RESCUE_VOLUNTEER ---- VOLUNTEER


RESCUE ---- RESCUE_PET ---- PET
```

These junction tables use composite primary keys.

---

## 4. Constraints

The database uses:

### Primary Key

Example:

```sql
PERSON_ID VARCHAR2(12) PRIMARY KEY
```

### Foreign Key

Example:

```sql
FOREIGN KEY(PERSON_ID)
REFERENCES PERSON(PERSON_ID)
```

### CHECK Constraints

Example:

```sql
CHECK STATUS IN ('ACTIVE','INACTIVE')
```

### NOT NULL Constraints

Used for mandatory information.

---

# Database Setup Guide

## Requirements

Install:

- Oracle Database
- Oracle SQL Developer
- Node.js
- Git


---

# Step 1: Clone Repository

```
git clone https://github.com/Mahdiisrak/pet-adoption-management-system.git
```

Go inside:

```
cd pet-adoption-management-system
```

---

# Step 2: Setup Database

Open Oracle SQL Developer.

Run scripts in this order:

```
database/01_schema.sql
```

Creates all tables and constraints.

---

Then:

```
database/02_seed_data.sql
```

Adds initial demo data.

---

Then run:

```
database/03_final_er_migration.sql
```

and required cleanup scripts:

```
database/03a_post_migration_fix.sql

database/03b_person_final_cleanup.sql

database/03c_salary_final_cleanup.sql
```

---

For demo accounts:

```
database/04_demo_accounts.sql
```

---

Advanced queries:

```
database/05_advanced_queries.sql
```

---

# Step 3: Backend Setup

Go to backend folder:

```
cd backend
```

Install dependencies:

```
npm install
```

Create:

```
.env
```

Example:

```
DB_USER=PET_ADMIN
DB_PASSWORD=your_password
DB_CONNECT_STRING=localhost/XEPDB1

PORT=5000
```

Run backend:

```
npm run dev
```

Backend runs:

```
http://localhost:5000
```

---

# Step 4: Frontend Setup

Open another terminal:

```
cd frontend
```

Install packages:

```
npm install
```

Run:

```
npm run dev
```

Frontend runs:

```
http://localhost:5173
```

---

# Demo Accounts

Example:

```
Role: Employee

Username:
rahim

Password:
rahim123
```

---

# Folder Structure

```
pet-adoption-management-system

│
├── backend
│   ├── routes
│   ├── middleware
│   ├── config
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   └── services
│
└── database
    ├── schema
    ├── migration scripts
    ├── seed data
    └── advanced queries
```

---

# Database Testing

The database was tested with:

- Table creation verification
- Constraint verification
- Demo data insertion
- Advanced SQL query execution

All tables contain minimum 5 demo records.

---

# Future Improvements

Possible future extensions:

- Online adoption application
- Image upload for pets
- Email notification system
- Advanced analytics dashboard
- Mobile application
- Payment integration

---

# Developer

**Mahdiisrak**

GitHub:

https://github.com/Mahdiisrak

---

# License

This project is developed for academic DBMS project purposes.
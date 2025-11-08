# SchedulaTeam_API_Artisans Hello API

Routes:
- GET /hello -> { "message": "Hello World " }

Run locally:
1. npm install
2. npm run start:dev
3. Visit http://localhost:3000/hello

Database Setup & Entity Creation
Steps Completed:
1. Connected NestJS project to PostgreSQL database.
2. Created entities using TypeORM: User, Doctor, Patient.
3. Defined relationships:
    -One User → Many Patients
    -One Doctor → Many Patients
4. Configured and verified database connection using app.module.ts.
5. Confirmed table creation in pgAdmin.
# Role-Based Login System - Run Instructions

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

---

## Step 1: Start MySQL

Make sure MySQL is running on localhost:3306

```bash
# Or start MySQL from XAMPP/WAMP
```

---

## Step 2: Start Backend

Open a new terminal and run:

```bash
cd backend
mvn spring-boot:run
```

Backend runs on: **http://localhost:8083**

---

## Step 3: Start Frontend

Open another new terminal and run:

```bash
cd frontend
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## Step 4: Use the Application

1. Open browser: http://localhost:5173
2. Login with admin credentials:
   - Email: `shri@123`
   - Password: `shri@123`
   - Role: ADMIN
3. Click Login

---

## User Flows

### ADMIN
1. Login with shri@123 / shri@123
2. Create TRAINER accounts

### TRAINER
1. Login with credentials created by ADMIN
2. Access Trainer Dashboard

### PARTICIPANT
1. Click "Register as Participant"
2. Register with email and password
3. Login with credentials

---

## Troubleshooting

### Port in Use
```bash
# Kill process on port
netstat -ano | findstr :8083
taskkill /PID <PID> /F
```

### Change Port
Edit `application.properties`:
```properties
server.port=8084
```

### Rebuild
```bash
cd backend
mvn clean install
```
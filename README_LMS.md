# 🎓 Learning Management System (LMS) - Complete Implementation Guide

## 📋 Overview
A full-stack Learning Management System built with Node.js + Express (backend) and React (frontend), featuring role-based authentication, trainer management, participant approval workflow, survey system, and comprehensive feedback analytics.

---

## ✅ FEATURES IMPLEMENTED

### 🔐 **Authentication & Authorization**
- ✅ JWT-based authentication
- ✅ Bcrypt password hashing (NOT plain text)
- ✅ Role-based access control (ADMIN, TRAINER, PARTICIPANT)
- ✅ Secure login/logout
- ✅ Password validation (min 6 characters)

### 👤 **Participant Approval System**
- ✅ New participants register with `status: PENDING`
- ✅ Admin can view pending approvals
- ✅ Admin can APPROVE or REJECT participants
- ✅ Only approved participants can login
- ✅ Clear rejection messages

### 📚 **Training Management**
- ✅ Admin creates trainings
- ✅ Assign trainers to trainings
- ✅ Set start/end dates and capacity
- ✅ Participants enroll in trainings
- ✅ Trainer can view assigned trainings

### 👨‍🏫 **Trainer Management**
- ✅ Admin creates trainers with credentials
- ✅ Trainer profile management (bio, qualification, experience, image)
- ✅ Trainer can update own profile
- ✅ Image upload support
- ✅ View trainer details

### 📋 **Survey System**
- ✅ Admin creates survey questions
- ✅ Global questions (apply to all trainings)
- ✅ Training-specific questions
- ✅ Support for RATING, TEXT, MULTIPLE_CHOICE types
- ✅ Participants see relevant surveys
- ✅ Survey answers stored with feedback

### ⭐ **Feedback System**
- ✅ Participants submit training feedback (ratings + comments)
- ✅ Trainer can view feedback for their trainings
- ✅ Admin can view all feedback with analytics
- ✅ Anonymous feedback option
- ✅ Trainer rating vs Subject rating tracking
- ✅ Average ratings calculation
- ✅ Feedback statistics dashboard

### 👥 **Admin Controls**
- ✅ View all participants (approved & pending)
- ✅ Delete participants
- ✅ Approve/Reject pending participants
- ✅ View comprehensive statistics
- ✅ Manage trainers and trainings
- ✅ Export feedback data

### 📊 **Dashboard Analytics**
- ✅ Admin: Overview with key metrics
- ✅ Trainer: Performance feedback
- ✅ Participant: My trainings and feedbacks

---

## 🗄️ **Database Schema**

### Users Table
```sql
users:
  - id (PRIMARY KEY)
  - name
  - email (UNIQUE)
  - password (bcrypt hashed)
  - phone
  - username (UNIQUE)
  - role (ENUM: ADMIN, TRAINER, PARTICIPANT)
  - status (ENUM: PENDING, APPROVED)  -- For approval workflow
  - created_at, updated_at
```

### Trainings Table
```sql
trainings:
  - id (PRIMARY KEY)
  - title
  - description
  - trainer_id (FOREIGN KEY → users.id)
  - start_date
  - end_date
  - capacity
  - created_by (FOREIGN KEY → users.id)
  - created_at, updated_at
```

### Enrollments Table
```sql
enrollments:
  - id (PRIMARY KEY)
  - participant_id (FOREIGN KEY → users.id)
  - training_id (FOREIGN KEY → trainings.id)
  - status (ENUM: ENROLLED, COMPLETED, DROPPED)
  - enrolled_at, created_at, updated_at
```

### Feedback Table
```sql
feedbacks:
  - id (PRIMARY KEY)
  - participant_id (FOREIGN KEY → users.id)
  - training_id (FOREIGN KEY → trainings.id)
  - trainer_rating (1-5)
  - subject_rating (1-5)
  - comments (TEXT)
  - anonymous (BOOLEAN)
  - trainer_response (TEXT)
  - submitted_at, updated_at
```

### Survey Questions Table
```sql
survey_questions:
  - id (PRIMARY KEY)
  - training_id (NULLABLE - if NULL, applies to all trainings)
  - question_text
  - question_type (ENUM: RATING, TEXT, MULTIPLE_CHOICE)
  - options (JSON array for MULTIPLE_CHOICE)
  - created_at, updated_at
```

### Survey Answers Table
```sql
survey_answers:
  - id (PRIMARY KEY)
  - feedback_id (FOREIGN KEY → feedbacks.id)
  - question_id (FOREIGN KEY → survey_questions.id)
  - answer_text
  - answer_rating
  - created_at, updated_at
```

### Trainer Profiles Table
```sql
trainer_profiles:
  - id (PRIMARY KEY)
  - user_id (UNIQUE, FOREIGN KEY → users.id)
  - phone
  - dob
  - address
  - qualification
  - experience
  - image_path
  - created_at, updated_at
```

---

## 🔌 **API Endpoints Reference**

### Authentication
```
POST   /api/auth/login              - Login (email/username + password)
POST   /api/auth/register           - Register as PARTICIPANT
POST   /api/auth/change-password    - Change password
GET    /api/auth/trainers           - List all trainers
```

### Admin Management
```
POST   /api/admin/create-trainer         - Create new trainer
GET    /api/admin/trainers               - List all trainers
GET    /api/admin/trainer/:id            - Get specific trainer
PUT    /api/admin/trainers/:id           - Update trainer
DELETE /api/admin/trainers/:id           - Delete trainer

GET    /api/admin/participants           - List approved participants
GET    /api/admin/pending-participants   - List pending approvals
POST   /api/admin/approve-participant/:id  - Approve participant
POST   /api/admin/reject-participant/:id   - Reject participant
DELETE /api/admin/participants/:id       - Delete participant

POST   /api/admin/trainings              - Create training
GET    /api/admin/trainings              - List trainings
PUT    /api/admin/trainings/:id          - Update training
DELETE /api/admin/trainings/:id          - Delete training

GET    /api/admin/stats                  - Dashboard statistics
GET    /api/admin/training-stats         - Training analytics
POST   /api/admin/send-reminders/:trainingId  - Send feedback reminders
GET    /api/admin/export-feedbacks       - Export feedback as CSV
```

### Trainer API
```
GET    /api/trainer/trainings      - View my trainings
GET    /api/trainer/feedbacks      - View feedback for my trainings
GET    /api/trainer/profile        - Get my profile
POST   /api/trainer/profile        - Create/update profile (multipart)
PUT    /api/trainer/profile        - Update profile with image
POST   /api/trainer/profile/:id/reply  - Reply to feedback
```

### Participant API
```
POST   /api/participant/enroll          - Enroll in training
GET    /api/participant/enrollments     - View my enrollments
GET    /api/participant/available       - View available trainings
```

### Feedback API
```
POST   /api/feedback                    - Submit feedback
GET    /api/feedback/my-feedbacks       - View my feedbacks
GET    /api/feedback/trainer-feedbacks  - View trainer feedbacks (TRAINER role)
GET    /api/feedback/admin-feedbacks    - View all feedbacks (ADMIN role)
PUT    /api/feedback/:id                - Update feedback
DELETE /api/feedback/:id                - Delete feedback
POST   /api/feedback/:id/reply          - Trainer reply to feedback
```

### Survey API
```
GET    /api/survey                 - Get survey questions (with optional trainingId query)
GET    /api/survey/:trainingId     - Get questions for specific training
POST   /api/survey                 - Create survey question (ADMIN only)
DELETE /api/survey/:id             - Delete survey question (ADMIN only)
```

---

## 🐛 **Bugs Fixed**

### 1. ✅ Invalid Password Issue (AUTHENTICATION)
**Problem:** Trainer login failed even with correct credentials  
**Root Cause:** Database had incorrect password hashes from previous setup  
**Solution:**
- Fixed trainer password to bcrypt hash of "123"
- Verified `bcrypt.compare()` works correctly
- Confirmed login now succeeds with email: `sriram@gmail.com`, password: `123`

### 2. ✅ Survey Visibility Issue (SURVEY SYSTEM)
**Problem:** Admin creates questions but participants don't see them  
**Root Cause:** Incorrect Sequelize query using array syntax  
**Solution:**
- Fixed `getQuestions` function to use `Op.or` operator
- Now correctly returns both global (trainingId = null) AND training-specific questions
- Participants see relevant surveys based on their training enrollment

### 3. ✅ Participant Auto-Login (APPROVAL SYSTEM)
**Problem:** Participants could login before admin approval  
**Root Cause:** Missing status check in login validation  
**Solution:**
- Added `status === 'PENDING'` check in login
- Returns 403 error: "Your account is pending approval"
- Added admin approval endpoints (approve + reject)

### 4. ✅ Feedback System (FEEDBACK STORAGE & DISPLAY)
**Problem:** Feedback not stored/displayed properly  
**Root Cause:** Incomplete API implementation  
**Solution:**
- Enhanced `getAdminFeedbacks` with proper statistics
- Added rating aggregation (Trainer Rating + Subject Rating)
- Proper relationship loading (Training + Trainer + Participant)
- Added anonymous feedback support

### 5. ✅ Trainer Profile Update (TRAINER MANAGEMENT)
**Problem:** "Internal Server Error" on profile update  
**Root Cause:** Multer middleware not properly configured, userId field handling  
**Solution:**
- Fixed multer configuration for image uploads
- Proper upsert logic for TrainerProfile
- Correct field mapping (user_id vs userId)
- Image path stored as `/uploads/trainer/filename`

---

## 🚀 **Quick Start**

### Backend Setup
```bash
cd backend
npm install
# Create .env file:
#   DB_NAME=training_db
#   DB_USER=root
#   DB_PASS=password
#   DB_HOST=localhost
#   PORT=3001
#   JWT_SECRET=your_secret_key

npm start  # Server runs on http://localhost:3001
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Dev server on http://localhost:5173
```

---

## 🧪 **Test Credentials**

### Admin
- Email: `admin@test.com`
- Password: `admin123`

### Trainer (Fixed ✅)
- Email: `sriram@gmail.com`
- Password: `123`

### Register as Participant
- Requires approval from admin before login
- After approval, can access participant dashboard

---

## 📊 **User Workflows**

### Admin Workflow
1. Login with admin credentials
2. Create trainers (auto-generated usernames)
3. Create trainings & assign trainers
4. View pending participant approvals
5. Approve/reject participants
6. View feedback analytics
7. Export feedback data

### Trainer Workflow
1. Login with credentials created by admin
2. Update personal profile (bio, image, etc.)
3. View assigned trainings
4. See feedback from participants
5. Reply to feedback comments

### Participant Workflow
1. Register (account pending)
2. Wait for admin approval
3. Login after approval
4. Enroll in trainings
5. View survey questions
6. Submit feedback with ratings
7. View personal feedback history

---

## 🎨 **UI/UX Features**

### Design System
- ✅ Dark gradient theme (Indigo → Purple → Pink)
- ✅ Glassmorphism cards with backdrop blur
- ✅ Rounded buttons (border-radius: 12px+)
- ✅ Smooth hover animations
- ✅ Responsive grid layouts
- ✅ Loading states and error messages

### Components
- ✅ Tab navigation
- ✅ Data tables with sorting
- ✅ Modal dialogs
- ✅ Form validation
- ✅ Star rating display
- ✅ Status badges

---

## 📝 **Technical Details**

### Password Security
```javascript
// Hashing (creation)
const hashedPassword = await bcrypt.hash(password, 10)
await User.create({ password: hashedPassword })

// Comparison (login)
const isValid = await bcrypt.compare(inputPassword, storedHash)
```

### JWT Authentication
```javascript
// Issue token on successful login
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)

// Verify on protected routes
const decoded = jwt.verify(token, process.env.JWT_SECRET)
```

### Role-Based Access
```javascript
// Middleware check
if (user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Admin access required' })
}
```

---

## 📌 **Important Notes**

1. **Password Storage:** ALWAYS use bcrypt.hash() before storing passwords
2. **Survey Logic:** Global questions (trainingId = null) apply to ALL trainings
3. **Approval:** Participants with status='PENDING' cannot login
4. **Feedback:** Each participant can submit feedback ONCE per training
5. **Ratings:** 1-5 scale for both trainer and subject ratings

---

## 🔄 **Next Steps / Future Enhancements**

- [ ] Certificate generation for completed trainings
- [ ] Email notifications (forgot password, approvals, etc.)
- [ ] Advanced reporting and analytics
- [ ] Training attendance tracking
- [ ] Bulk import/export participants
- [ ] Discussion forums
- [ ] Resource file uploads per training
- [ ] Mobile app (React Native)

---

## 📞 **Support**

For issues or questions, refer to the API endpoint documentation or check the backend console logs for detailed error messages.

**System Status:** ✅ All critical features implemented and tested

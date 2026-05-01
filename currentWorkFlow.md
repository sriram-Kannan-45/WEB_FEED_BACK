# LMS Project Workflow

## 1. Authentication Flow

```
Register (Participant)
├── POST /api/auth/register
│   └── Creates user with role=PARTICIPANT, status=PENDING
│   └── User redirect to /participant (cannot fully access until approved)

Login
├── Select role (ADMIN/TRAINER/PARTICIPANT)
├── POST /api/auth/login
│   └── Validates credentials, returns {id, name, email, role, status, token}
│   └── Redirects based on role:
│       ├── ADMIN → /admin
│       ├── TRAINER → /trainer
│       └── PARTICIPANT → /participant (if APPROVED)

Change Password
└── POST /api/auth/change-password
```

---

## 2. User Management Flow

```
Admin Creates Trainer
└── POST /api/admin/create-trainer
    └── Creates user with role=TRAINER

Admin Creates Training
└── POST /api/admin/trainings
    └── Creates training, assigns trainer, notifies trainer

Participant Registration & Approval
├── POST /api/auth/register → status=PENDING
├── Admin views pending → GET /api/admin/pending-participants
├── Admin approves → POST /api/admin/approve-participant/:id → status=APPROVED
└── Admin rejects → POST /api/admin/reject-participant/:id → delete user
```

---

## 3. Training & Enrollment Flow

```
Participant Views Available Trainings
└── GET /api/trainings
    └── Returns all trainings with isEnrolled, isFull flags

Participant Enrolls
└── POST /api/participant/enroll {trainingId}
    └── Creates enrollment, notifies participant

Participant Views My Enrollments
└── GET /api/participant/enrollments

Participant Cancels Enrollment
└── DELETE /api/participant/enroll/:trainingId
```

---

## 4. Notes Flow

```
Trainer Uploads Note
├── POST /api/notes (with file or link)
│   └── Creates note with status=PENDING

Trainer Views Own Notes
└── GET /api/notes/my-notes

Admin Approves/Rejects Note
└── PUT /api/notes/:id/status {status: APPROVED|REJECTED}

Participant Views Approved Notes
└── GET /api/notes
```

---

## 5. Feedback & Survey Flow

```
Admin Creates Survey Question
├── POST /api/survey {questionText, questionType, options}
└── Global (trainingId=null) or training-specific

Participant Submits Feedback
├── GET /api/survey/:trainingId → loads survey questions
├── POST /api/feedback {
│   trainingId, trainerRating, subjectRating,
│   comments, anonymous, surveyAnswers
│ }
│   └── Creates feedback, notifies admin + trainer

Trainer Views & Replies to Feedback
├── GET /api/trainer/feedbacks
└── POST /api/feedback/:id/reply {trainerResponse}

Admin Views All Feedbacks
├── GET /api/feedback/admin-feedbacks
└── GET /api/admin/export-feedbacks → CSV
```

---

## 6. Trainer Profile Flow

```
Trainer Views Profile
└── GET /api/trainer/profile

Trainer Updates Profile (with image)
├── PUT /api/trainer/update (FormData)
│   └── Uploads image, updates profile fields

Trainer Updates Profile (JSON)
└── PUT /api/trainer/profile
```

---

## 7. Admin Dashboard Flow

```
Overview Tab
├── GET /api/admin/stats
│   └── Returns: totalTrainings, completedTrainings, activeTrainings,
│       totalTrainers, totalParticipants, pendingParticipants,
│       pendingNotes, avgTrainerRating, avgSubjectRating,
│       ratingDistribution, enrollmentRate

Participants Tab
└── GET /api/admin/participants?search&status&limit&offset

Activity Logs (NEW)
└── GET /api/admin/activity-logs?action&userId&startDate&endDate
```

---

## 8. Notification Flow

```
User Gets Notifications
└── GET /api/notifications

User Marks as Read
└── PUT /api/notifications/read
```

---

## Role-Based Access Summary

| Endpoint | ADMIN | TRAINER | PARTICIPANT |
|----------|------|---------|-------------|
| /api/auth/register | - | - | POST |
| /api/auth/login | POST | POST | POST |
| /api/admin/* | ALL | - | - |
| /api/trainer/* | - | ALL | - |
| /api/participant/* | - | - | ALL |
| /api/feedbacks | R/W | R/W | R/W |
| /api/notes | R/W* | C/R/W | R |
| /api/survey | C/R/D | R | R |

**Legend:** R=Read, C=Create, W=Write/Update, D=Delete, *=with conditions

---

## Key Database Status Fields

| Model | Field | Values |
|-------|-------|--------|
| User | status | PENDING, APPROVED |
| User | role | ADMIN, TRAINER, PARTICIPANT |
| User | isDeleted | true, false (soft delete) |
| Note | status | PENDING, APPROVED, REJECTED |
| Enrollment | status | ENROLLED, CANCELLED |
| Feedback | - | - |
| ActivityLog | status | SUCCESS, FAILED |
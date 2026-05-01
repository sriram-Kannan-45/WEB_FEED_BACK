module.exports = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    CHANGE_PASSWORD: "/api/auth/change-password"
  },
  ADMIN: {
    CREATE_TRAINER: "/api/admin/create-trainer",
    TRAININGS: "/api/admin/trainings",
    TRAINERS: "/api/admin/trainers",
    DELETE_TRAINING: "/api/admin/delete-training"
  },
  PARTICIPANT: {
    TRAININGS: "/api/trainings",
    ENROLL: "/api/participant/enroll",
    MY_ENROLLMENTS: "/api/participant/enrollments"
  },
  FEEDBACK: {
    SUBMIT: "/api/feedback"
  }
};
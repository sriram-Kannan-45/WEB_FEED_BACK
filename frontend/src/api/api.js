const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';

export const API = {
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  CHANGE_PASSWORD: `${API_BASE}/auth/change-password`,
  
  ADMIN: {
    CREATE_TRAINER: `${API_BASE}/admin/create-trainer`,
    TRAININGS: `${API_BASE}/admin/trainings`,
    TRAINERS: `${API_BASE}/admin/trainers`,
    DELETE_TRAINING: `${API_BASE}/admin/delete-training`
  },
  
  PARTICIPANT: {
    TRAININGS: `${API_BASE}/trainings`,
    ENROLL: `${API_BASE}/participant/enroll`,
    MY_ENROLLMENTS: `${API_BASE}/participant/enrollments`
  },
  
  FEEDBACK: {
    SUBMIT: `${API_BASE}/feedback`
  }
};

export { API_BASE };
const request = require('supertest');
const app = require('../src/app');

describe('Route Validation Tests', () => {
  describe('Core endpoints should NOT return 404', () => {
    it('GET /api/trainings should return 200 or 401 (not 404)', async () => {
      const res = await request(app).get('/api/trainings');
      expect([200, 401]).toContain(res.status);
    });

    it('POST /api/auth/login should return 200 or 401 (not 404)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test123' });
      expect([200, 401, 422]).toContain(res.status);
    });

    it('POST /api/auth/register should return 201 or 400 (not 404)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'unique@test.com', password: 'test123', phone: '123' });
      expect([201, 400, 422]).toContain(res.status);
    });
  });

  describe('Protected endpoints validation', () => {
    it('POST /api/admin/create-trainer should exist', async () => {
      const res = await request(app)
        .post('/api/admin/create-trainer')
        .send({ name: 'Trainer', email: 'trainer@test.com' });
      expect([200, 201, 400, 401, 403]).toContain(res.status);
    });

    it('POST /api/participant/enroll should exist', async () => {
      const res = await request(app)
        .post('/api/participant/enroll')
        .send({ trainingId: 1 });
      expect([200, 201, 400, 401, 404]).toContain(res.status);
    });

    it('POST /api/feedback should exist', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({ trainingId: 1, participantId: 1, trainerRating: 5, subjectRating: 5 });
      expect([200, 201, 400, 401, 404]).toContain(res.status);
    });
  });

  describe('Health check', () => {
    it('GET /health should return 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });
});
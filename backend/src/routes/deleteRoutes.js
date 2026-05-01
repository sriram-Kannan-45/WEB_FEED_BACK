const express = require('express');
const deleteController = require('../controllers/deleteController');
const authenticateToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

router.delete(
  '/admin/user/:id',
  authenticateToken,
  roleMiddleware('ADMIN'),
  (req, res) => deleteController.deleteUser(req, res)
);

module.exports = router;
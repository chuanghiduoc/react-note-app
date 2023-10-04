const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/users-and-notes-info', authMiddleware, adminController.getUsersAndNotesInfo);
router.post('/change-password/:userId', adminController.changePassword);

module.exports = router;

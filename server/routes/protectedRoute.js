const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Áp dụng authMiddleware cho tài nguyên bảo vệ
router.get('/protected-resource', authMiddleware, (req, res) => {
  // Đã xác thực, người dùng hiện đang được cho phép truy cập tài nguyên này
  res.json({ message: 'Tài nguyên bảo vệ đã được truy cập.' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Áp dụng authMiddleware cho tài nguyên bảo vệ
router.get('/protected-resource', authMiddleware, (req, res) => {
  // Đã xác thực, người dùng hiện đang được cho phép truy cập tài nguyên này
  res.json({ message: 'Tài nguyên bảo vệ đã được truy cập.' });
});

router.get('/me', authMiddleware, (req, res) => {
  // Lấy thông tin người dùng từ req.user
  const currentUser = req.user;

  // Tạo một bản sao của đối tượng người dùng và loại bỏ trường 'password'
  const userWithoutPassword = { ...currentUser._doc };
  delete userWithoutPassword.password;

  res.json({ user: userWithoutPassword });
});

module.exports = router;
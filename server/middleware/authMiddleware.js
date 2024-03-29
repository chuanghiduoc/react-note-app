const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Lấy token từ tiêu đề yêu cầu
    const authorizationHeader = req.header('Authorization');

    // Kiểm tra xem tiêu đề 'Authorization' có tồn tại
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'Không có token được cung cấp.' });
    }

    const token = authorizationHeader.replace('Bearer ', '');

    // Xác thực token bằng Promises
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) reject(err);
        resolve(decodedToken);
      });
    });

    // Lấy thông tin người dùng từ token
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }

    // Lưu thông tin người dùng trong yêu cầu để sử dụng ở các middleware sau này
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

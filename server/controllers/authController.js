const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Đăng ký
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: 'Tên người dùng đã tồn tại.' });
    }

    // Tạo một đối tượng User với vai trò (role) tuỳ chọn
    const newUser = new User({ username, password, role });

    await newUser.save();

    // Tìm người dùng sau khi đã tạo
    const user = await User.findOne({ username });

    // Lưu token với thông tin người dùng và vai trò (role) vào token JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ message: 'Đăng ký thành công.', token, username: user.username, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký.' });
  }
};
  
// Đăng nhập
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Tên người dùng không tồn tại.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
    }

    // Lấy vai trò của người dùng
    const userRole = user.role || 'user';

    // Tạo token với thông tin vai trò
    const token = jwt.sign({ userId: user._id, role: userRole }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Đăng nhập thành công.', token, username: user.username, role: userRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập.' });
  }
};






  
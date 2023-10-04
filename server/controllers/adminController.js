const User = require('../models/User');
const Note = require('../models/Note');
const bcrypt = require('bcrypt');

const adminController = {
    getUsersAndNotesInfo: async (req, res) => {
        try {
          // Truy vấn tất cả người dùng
          const users = await User.find();
    
          // Tạo một mảng chứa thông tin về người dùng và số lượng ghi chú của họ
          const usersInfo = await Promise.all(
            users.map(async (user) => {
              const userId = user._id;
              const userNotes = await Note.find({ userId });
              return {
                userId: user._id,
                username: user.username,
                numNotes: userNotes.length,
              };
            })
          );
    
          // Tính tổng số lượng ghi chú
          const totalNotes = usersInfo.reduce((sum, userInfo) => sum + userInfo.numNotes, 0);
    
          // Trả về thông tin dưới dạng JSON
          res.json({ usersInfo, totalNotes });
        } catch (error) {
          res.status(500).json({ error: 'Failed to fetch user and notes info' });
        }
      },    

      changePassword: async (req, res) => {
        try {
          // Lấy mật khẩu mới từ yêu cầu
          const { newPassword } = req.body;
      
          if (!newPassword) {
            return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu mới.' });
          }
      
          // Cập nhật mật khẩu mới vào cơ sở dữ liệu
          const userId = req.params.userId;

           // Tạo salt mới cho việc hash mật khẩu
           const saltRounds = 10;
           bcrypt.genSalt(saltRounds, async (err, salt) => {
               if (err) {
                   return res.status(500).json({ error: 'Đã xảy ra lỗi khi thay đổi mật khẩu.' });
               }

               // Sử dụng salt để hash mật khẩu mới
               bcrypt.hash(newPassword, salt, async (err, hash) => {
                   if (err) {
                       return res.status(500).json({ error: 'Đã xảy ra lỗi khi thay đổi mật khẩu.' });
                   }

                   // Cập nhật mật khẩu đã được hash vào cơ sở dữ liệu
                   const adminUser = await User.findOneAndUpdate(
                       { _id: userId },
                       { password: hash },
                       { new: true }
                   );

                   if (!adminUser) {
                       return res.status(404).json({ error: 'Không tìm thấy người dùng admin.' });
                   }

                   res.json({ message: 'Mật khẩu đã được thay đổi thành công.' });
               });
           });
        } catch (error) {
            console.error(error);
          res.status(500).json({ error: 'Đã xảy ra lỗi khi thay đổi mật khẩu.' });
        }
      },
      
};

module.exports = adminController;

const Note = require('../models/Note');
const shortid = require('shortid'); 

// Hàm tạo đường dẫn chia sẻ duy nhất
const generateUniqueShareableLink = async () => {
  let link;
  let existingNote;

  do {
    // Tạo một đoạn mã ngẫu nhiên cho link chia sẻ
    link = shortid.generate(); // Sử dụng shortid để tạo đoạn mã ngẫu nhiên

    // Kiểm tra xem có ghi chú nào khác sử dụng link này chưa
    existingNote = await Note.findOne({ shareableLink: link });

  } while (existingNote);

  return link;
};

// Xử lý các chức năng khác liên quan đến ghi chú
const noteController = {
  createNote: async (req, res) => {
    try {
      const { userId, title, content, password } = req.body;

      // Tạo một đường dẫn chia sẻ duy nhất
      const shareableLink = await generateUniqueShareableLink();

      const newNote = new Note({
        userId,
        title,
        content,
        password,
        shareableLink,
      });

      const savedNote = await newNote.save();
      res.json(savedNote);
    } catch (error) {
      res.status(500).json({ error: 'Không thể thêm ghi chú' });
    }
  },

  getNotesByUserId: async (req, res) => {
    try {
      const userId = req.params.userId;
      const notes = await Note.find({ userId });
      const sanitizedNotes = notes.map((note) => ({
        _id: note._id,
        title: note.title,
        content: note.content,
        shareableLink: note.shareableLink,
      }));
      res.json(sanitizedNotes);
    } catch (error) {
      res.status(500).json({ error: 'Không tìm nạp được ghi chú' });
    }
  },

  deleteNote: async (req, res) => {
    try {
      const userId = req.params.userId;
      const noteId = req.params.noteId;
      const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });
      if (deletedNote) {
        res.json({ message: 'Đã xóa ghi chú thành công' });
      } else {
        res.status(404).json({ error: 'Không tìm thấy ghi chú' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Không thể xóa ghi chú' });
    }
  },

  updateNote: async (req, res) => {
    try {
      const userId = req.params.userId;
      const noteId = req.params.noteId;
      const { title, content, password } = req.body;

      const updatedNote = await Note.findOneAndUpdate(
        { _id: noteId, userId },
        { title, content, password },
        { new: true }
      );

      if (updatedNote) {
        res.json(updatedNote);
      } else {
        res.status(404).json({ error: 'Không tìm thấy ghi chú' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Không cập nhật được ghi chú' });
    }
  },

  createShareableLink: async (req, res) => {
    try {
      const noteId = req.params.noteId;

      // Tìm ghi chú dựa trên ID
      const note = await Note.findOne({ _id: noteId });

      if (!note) {
        return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
      }

      res.json({ shareableLink: note.shareableLink });
    } catch (error) {
      res.status(500).json({ error: 'Không tạo được liên kết có thể chia sẻ' });
    }
  },

  accessNoteByShareableLink: async (req, res) => {
    try {
      const shareableLink = req.params.shareableLink;
  
      // Tìm ghi chú dựa trên đường dẫn chia sẻ
      const note = await Note.findOne({ shareableLink });
  
      if (!note) {
        return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
      }
  
      const { password } = req.query;
  
      // Kiểm tra xem ghi chú có password hay không
      if (!note.password) {
        // Nếu không có password, hiển thị nội dung ngay lập tức
        return res.json({ title: note.title, content: note.content });
      }
  
      // Nếu có password, kiểm tra mật khẩu
      if (!password) {
        return res.status(401).json({ error: 'Cần có mật khẩu' });
      }
  
      if (note.password !== password) {
        return res.status(401).json({ error: 'Mật khẩu không hợp lệ' });
      }
  
      // Nếu mật khẩu đúng, hiển thị nội dung
      res.json({ title: note.title, content: note.content });
    } catch (error) {
      res.status(500).json({ error: 'Không thể truy cập ghi chú' });
    }
  },
};

module.exports = noteController;

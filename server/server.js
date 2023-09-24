const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const shortid = require('shortid'); // Thêm thư viện shortid để tạo đoạn mã ngẫu nhiên

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

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

// Routes
const protectedRoute = require('./routes/protectedRoute');
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoute);

//Notes
const NoteSchema = new mongoose.Schema({
  userId: String,
  content: String,
  password: String,
  shareableLink: String, // Thêm trường shareableLink vào schema
});

const Note = mongoose.model('Note', NoteSchema);

// Thêm ghi chú
app.post('/api/notes', async (req, res) => {
  try {
    const { userId, content, password } = req.body;

    // Tạo một đường dẫn chia sẻ duy nhất
    const shareableLink = await generateUniqueShareableLink();

    const newNote = new Note({
      userId,
      content,
      password,
      shareableLink, // Lưu đường dẫn chia sẻ vào ghi chú
    });

    const savedNote = await newNote.save();
    res.json(savedNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Lấy danh sách các ghi chú của người dùng
app.get('/api/notes/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const notes = await Note.find({ userId });
    const sanitizedNotes = notes.map((note) => ({
      _id: note._id,
      content: note.content,
      shareableLink: note.shareableLink, // Bao gồm đường dẫn chia sẻ
    }));
    res.json(sanitizedNotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Xoá ghi chú
app.delete('/api/notes/:userId/:noteId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const noteId = req.params.noteId;
    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });
    if (deletedNote) {
      res.json({ message: 'Note deleted successfully' });
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Sửa ghi chú
app.put('/api/notes/:userId/:noteId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const noteId = req.params.noteId;
    const { content, password } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { content, password },
      { new: true }
    );

    if (updatedNote) {
      res.json(updatedNote);
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Thêm một API endpoint để tạo đường dẫn chia sẻ cho ghi chú
app.post('/api/share/:noteId', async (req, res) => {
  try {
    const noteId = req.params.noteId;

    // Tìm ghi chú dựa trên ID
    const note = await Note.findOne({ _id: noteId });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Trả về đường dẫn chia sẻ
    res.json({ shareableLink: note.shareableLink });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shareable link' });
  }
});

app.get('/api/share/:shareableLink', async (req, res) => {
  try {
    const shareableLink = req.params.shareableLink;

    // Tìm ghi chú dựa trên đường dẫn chia sẻ
    const note = await Note.findOne({ shareableLink });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Kiểm tra xem người dùng đã cung cấp mật khẩu không
    const { password } = req.query;
    if (!password) {
      return res.status(401).json({ error: 'Password is required' });
    }

    // Kiểm tra mật khẩu có khớp không
    if (note.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Trả về nội dung của ghi chú
    res.json({ content: note.content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to access note' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
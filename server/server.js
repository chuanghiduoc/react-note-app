const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Routes
const protectedRoute = require('./routes/protectedRoute');
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoute);


//Notes
const NoteSchema = new mongoose.Schema({
  userId: String,
  content: String,
});

const Note = mongoose.model('Note', NoteSchema);

// Thêm ghi chú
app.post('/api/notes', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const newNote = new Note({
      userId,
      content,
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
    res.json(notes);
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
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

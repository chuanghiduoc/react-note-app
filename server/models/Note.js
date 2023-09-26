const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: String,
  title: String,
  content: String,
  password: String,
  shareableLink: String,
});

module.exports = mongoose.model('Note', NoteSchema);
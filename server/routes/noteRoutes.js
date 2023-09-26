const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController'); 
const authMiddleware = require('../middleware/authMiddleware');

router.post('/notes', authMiddleware, noteController.createNote);
router.get('/notes/:userId', authMiddleware, noteController.getNotesByUserId);
router.delete('/notes/:userId/:noteId', authMiddleware, noteController.deleteNote);
router.put('/notes/:userId/:noteId', authMiddleware, noteController.updateNote);
router.post('/share/:noteId', noteController.createShareableLink);
router.get('/share/:shareableLink', noteController.accessNoteByShareableLink);

module.exports = router;

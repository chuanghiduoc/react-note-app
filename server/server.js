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
const noteRoutes = require('./routes/noteRoutes'); 
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', protectedRoute);
app.use('/api', noteRoutes);
app.use('/api/admin', adminRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

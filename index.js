const express = require('express');
const mongoose = require('mongoose');
const app = express();
const uploadRoutes = require('./api/upload');
const downloadRoutes = require('./api/download');

require('dotenv').config(); // To load environment variables from .env

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// API Routes
app.use('/api', uploadRoutes);
app.use('/api', downloadRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

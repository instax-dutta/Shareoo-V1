const express = require('express');
const formidable = require('formidable');
const path = require('path');
const { uploadToS3, downloadFromS3 } = require('./middleware/s3');
const File = require('./models/File'); // Assuming you're using mongoose for file metadata
const mongoose = require('mongoose');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve the HTML form at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle file uploads
app.post('/api/upload', (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing the file' });
    }

    const { expiry } = fields;
    const { file } = files;

    try {
      // Upload file to S3
      const s3Response = await uploadToS3(file);
      const downloadCode = generateRandomCode();

      // Save file metadata to MongoDB
      const newFile = new File({
        downloadCode,
        s3Key: s3Response.key,
        originalName: file.originalFilename,
        expiry: new Date(Date.now() + parseExpiry(expiry)),
      });

      await newFile.save();

      res.status(200).send(`<h2>File uploaded successfully!</h2><p>Download Code: ${downloadCode}</p>`);
    } catch (error) {
      return res.status(500).json({ message: 'Error uploading file' });
    }
  });
});

// Handle file downloads
app.get('/api/download', async (req, res) => {
  const { code } = req.query;

  try {
    const file = await File.findOne({ downloadCode: code });

    if (!file) {
      return res.status(404).send('<h2>File not found or expired</h2>');
    }

    const s3Response = await downloadFromS3(file.s3Key);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.send(s3Response.Body);
  } catch (error) {
    return res.status(500).send('<h2>Error downloading file</h2>');
  }
});

// Helper functions
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function parseExpiry(expiry) {
  switch (expiry) {
    case '10': return 10 * 60 * 1000; // 10 Minutes
    case '60': return 60 * 60 * 1000; // 1 Hour
    case '1440': return 24 * 60 * 60 * 1000; // 1 Day
    case '10080': return 7 * 24 * 60 * 60 * 1000; // 7 Days
    default: return 10 * 60 * 1000; // Default 10 Minutes
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
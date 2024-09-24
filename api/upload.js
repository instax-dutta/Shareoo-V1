const express = require('express');
const router = express.Router();
const { generatePresignedUrl } = require('../middleware/s3');
const File = require('../models/File');

// Helper function to generate a random 6-digit code
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to parse expiry time
function parseExpiry(expiry) {
  const expiryMinutes = parseInt(expiry);
  return expiryMinutes * 60 * 1000; // Convert minutes to milliseconds
}

// Route to handle file uploads
router.post('/upload', async (req, res) => {
  const { fileName, fileType, expiry } = req.body;

  try {
    // Generate the presigned URL
    const presignedUrl = await generatePresignedUrl(fileName, fileType);

    // Generate a random 6-digit download code
    const downloadCode = generateRandomCode();

    // Save file metadata to the database (MongoDB)
    const newFile = new File({
      downloadCode,
      s3Key: fileName,
      expiry: new Date(Date.now() + parseExpiry(expiry)), // Calculate expiry date
    });

    await newFile.save();

    // Return the presigned URL and download code to the frontend
    return res.status(200).json({
      url: presignedUrl,
      downloadCode,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error generating presigned URL' });
  }
});

module.exports = router;

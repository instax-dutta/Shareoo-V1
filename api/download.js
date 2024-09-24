const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const File = require('../models/File');

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Route to download the file
router.get('/download', async (req, res) => {
  const { code } = req.query;

  try {
    // Find the file in the database
    const file = await File.findOne({ downloadCode: code });

    if (!file) {
      return res.status(404).json({ message: 'Invalid download code' });
    }

    // Check if the file has expired
    if (new Date() > file.expiry) {
      return res.status(410).json({ message: 'File has expired' });
    }

    // Generate a presigned URL for downloading the file from S3
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: file.s3Key,
      Expires: 60, // URL valid for 60 seconds
    };

    const downloadUrl = s3.getSignedUrl('getObject', s3Params);

    // Redirect the user to the presigned download URL
    return res.redirect(downloadUrl);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching the file' });
  }
});

module.exports = router;

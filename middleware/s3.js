const AWS = require('aws-sdk');

// Configure the Ola Krutrim Cloud S3 connection
const s3 = new AWS.S3({
    accessKeyId: process.env.OLA_ACCESS_KEY, // Access key from environment variables
    secretAccessKey: process.env.OLA_SECRET_KEY, // Secret key from environment variables
    endpoint: 'https://blr1.kos.olakrutrimsvc.com', // Krutrim Cloud endpoint
    region: 'blr1', // Set region
    s3ForcePathStyle: true, // Force path-style URL
    signatureVersion: 'v4' // Use signature version v4
});

// Function to upload file to the bucket
const uploadFile = (key, fileContent) => {
    const params = {
        Bucket: 'buck01', // Your bucket name
        Key: key, // File key (usually the file name or path)
        Body: fileContent, // File content to upload
        ACL: 'public-read', // File permission (optional, can be 'private' if needed)
    };
    return s3.upload(params).promise();
};

// Function to delete a file from the bucket
const deleteFile = (key) => {
    const params = {
        Bucket: 'buck01', // Your bucket name
        Key: key, // File key to delete
    };
    return s3.deleteObject(params).promise();
};

// Function to generate a pre-signed URL for downloading a file
const getSignedUrl = (key, expiresIn) => {
    const params = {
        Bucket: 'buck01', // Your bucket name
        Key: key, // File key
        Expires: expiresIn || 60, // Expiration time for the signed URL (in seconds)
    };

    // Generate and return the signed URL for downloading the file
    return s3.getSignedUrlPromise('getObject', params);
};

module.exports = { uploadFile, deleteFile, getSignedUrl };

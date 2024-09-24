const AWS = require('aws-sdk');

// Configure the Ola Krutrim Cloud S3 connection
const s3 = new AWS.S3({
    accessKeyId: process.env.OLA_ACCESS_KEY, // Access key from the environment variable
    secretAccessKey: process.env.OLA_SECRET_KEY, // Secret key from the environment variable
    endpoint: 'https://blr1.kos.olakrutrimsvc.com', // Krutrim Cloud endpoint
    s3ForcePathStyle: true, // To handle bucket paths correctly
    signatureVersion: 'v4' // Use v4 for signature
});

// Function to upload file to the bucket
const uploadFile = (bucketName, key, fileContent) => {
    const params = {
        Bucket: bucketName, 
        Key: key,
        Body: fileContent,
        ACL: 'public-read', // Set permissions for file
    };
    return s3.upload(params).promise();
};

// Function to delete file from the bucket
const deleteFile = (bucketName, key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };
    return s3.deleteObject(params).promise();
};

// Function to generate a pre-signed URL for downloading a file
const getSignedUrl = (bucketName, key, expires) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: expires, // Set expiration time for the link in seconds
    };
    return s3.getSignedUrlPromise('getObject', params);
};

module.exports = { uploadFile, deleteFile, getSignedUrl };

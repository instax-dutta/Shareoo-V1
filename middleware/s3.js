const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.OLA_ACCESS_KEY,
    secretAccessKey: process.env.OLA_SECRET_KEY,
    endpoint: 'https://blr1.kos.olakrutrimsvc.com',
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
});

module.exports = s3;

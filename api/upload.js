import multer from 'multer';
import crypto from 'crypto';
import moment from 'moment';
import mongoose from 'mongoose';
import s3 from '../middleware/s3';
import File from '../models/File'; // Import MongoDB model

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        upload.single('file')(req, res, async (err) => {
            if (err) return res.status(500).json({ error: 'File upload failed' });

            const { expiry } = req.body;
            const file = req.file;
            if (!file) return res.status(400).json({ error: 'No file uploaded' });

            const code = crypto.randomInt(100000, 999999).toString();
            const expiryTime = moment().add(parseInt(expiry), 'minutes').toISOString();
            const fileName = file.originalname;

            try {
                // Upload to S3
                const params = {
                    Bucket: process.env.OLA_BUCKET_NAME,
                    Key: fileName,
                    Body: file.buffer,
                };
                await s3.upload(params).promise();

                // Store metadata in MongoDB
                const newFile = new File({ code, fileName, expiry: expiryTime });
                await newFile.save();

                return res.status(200).json({ code, message: 'File uploaded successfully' });
            } catch (error) {
                return res.status(500).json({ error: 'Upload failed' });
            }
        });
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

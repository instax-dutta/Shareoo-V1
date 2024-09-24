import mongoose from 'mongoose';
import s3 from '../middleware/s3';
import File from '../models/File';
import moment from 'moment';

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
    try {
        const expiredFiles = await File.find({ expiry: { $lte: moment().toISOString() } });

        for (const file of expiredFiles) {
            await s3.deleteObject({
                Bucket: process.env.OLA_BUCKET_NAME,
                Key: file.fileName
            }).promise();
            await file.remove();
        }

        res.status(200).json({ message: 'Expired files deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Cleanup failed' });
    }
}

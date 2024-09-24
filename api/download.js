import mongoose from 'mongoose';
import s3 from '../middleware/s3';
import File from '../models/File';

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
    const { code } = req.query;

    try {
        const file = await File.findOne({ code });

        if (!file) return res.status(404).json({ error: 'File not found or expired' });

        const params = {
            Bucket: process.env.OLA_BUCKET_NAME,
            Key: file.fileName,
        };

        const s3File = await s3.getObject(params).promise();
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.send(s3File.Body);
    } catch (error) {
        return res.status(500).json({ error: 'File download failed' });
    }
}

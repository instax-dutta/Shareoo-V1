import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    code: String,
    fileName: String,
    expiry: Date,
});

const File = mongoose.models.File || mongoose.model('File', fileSchema);

export default File;

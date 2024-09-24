const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  downloadCode: { type: String, required: true, unique: true },
  s3Key: { type: String, required: true },
  expiry: { type: Date, required: true },
});

module.exports = mongoose.model('File', fileSchema);

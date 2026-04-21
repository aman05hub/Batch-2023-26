const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  title: { type: String, trim: true },
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  fileId: { type: String, required: true },
  fileName: { type: String },
  width: { type: Number },
  height: { type: Number },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);

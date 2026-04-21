const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  coverImage: { type: String, default: '' },
  coverImageFileId: { type: String, default: '' },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: true },
  photoCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

albumSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Album', albumSchema);

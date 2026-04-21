const express = require('express');
const router = express.Router();
const Album = require('../models/Album');
const Photo = require('../models/Photo');
const { protect } = require('../middleware/auth');

// GET /api/albums - public, get all published albums
router.get('/', async (req, res) => {
  try {
    const albums = await Album.find({ isPublished: true }).sort({ date: -1 });
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/albums/:id - public, get single album with photos
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    const photos = await Photo.find({ album: album._id }).sort({ uploadedAt: -1 });
    res.json({ album, photos });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/albums - admin only
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, date, tags } = req.body;
    const album = await Album.create({ title, description, date, tags });
    res.status(201).json(album);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/albums/:id - admin only
router.put('/:id', protect, async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.json(album);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/albums/:id - admin only
router.delete('/:id', protect, async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    // Delete all photos in album
    await Photo.deleteMany({ album: req.params.id });
    res.json({ message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

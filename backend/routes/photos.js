const express = require('express');
const router = express.Router();
const multer = require('multer');
const ImageKit = require('imagekit');
const Photo = require('../models/Photo');
const Album = require('../models/Album');
const { protect } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// POST /api/photos/upload - admin only, upload multiple photos to an album
router.post('/upload', protect, upload.array('photos', 50), async (req, res) => {
  try {
    const { albumId } = req.body;
    if (!albumId) return res.status(400).json({ message: 'albumId required' });

    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const uploadedPhotos = [];

    for (const file of req.files) {
      const result = await imagekit.upload({
        file: file.buffer.toString('base64'),
        fileName: file.originalname,
        folder: `/bca-batch-2023-26/${albumId}`,
        useUniqueFileName: true,
        tags: ['bca', 'batch-2023-26', albumId]
      });

      const photo = await Photo.create({
        album: albumId,
        title: file.originalname.replace(/\.[^/.]+$/, ''),
        imageUrl: result.url,
        thumbnailUrl: result.thumbnailUrl || result.url,
        fileId: result.fileId,
        fileName: result.name,
        width: result.width,
        height: result.height,
        size: result.size
      });

      uploadedPhotos.push(photo);
    }

    // Update album cover and count
    const count = await Photo.countDocuments({ album: albumId });
    const update = { photoCount: count };
    if (!album.coverImage && uploadedPhotos.length > 0) {
      update.coverImage = uploadedPhotos[0].imageUrl;
      update.coverImageFileId = uploadedPhotos[0].fileId;
    }
    await Album.findByIdAndUpdate(albumId, update);

    res.json({ message: `${uploadedPhotos.length} photos uploaded`, photos: uploadedPhotos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// DELETE /api/photos/:id - admin only
router.delete('/:id', protect, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    // Delete from ImageKit
    try {
      await imagekit.deleteFile(photo.fileId);
    } catch (e) {
      console.warn('ImageKit delete failed:', e.message);
    }

    await Photo.findByIdAndDelete(req.params.id);

    // Update count
    const count = await Photo.countDocuments({ album: photo.album });
    await Album.findByIdAndUpdate(photo.album, { photoCount: count });

    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/photos/:albumId/cover - set album cover
router.put('/:albumId/cover', protect, async (req, res) => {
  try {
    const { photoId } = req.body;
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    await Album.findByIdAndUpdate(req.params.albumId, {
      coverImage: photo.imageUrl,
      coverImageFileId: photo.fileId
    });

    res.json({ message: 'Cover updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

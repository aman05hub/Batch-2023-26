const express = require('express');
const router = express.Router();
const ImageKit = require('imagekit');
const { protect } = require('../middleware/auth');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// GET /api/imagekit/auth - admin only, get auth params for client-side upload
router.get('/auth', protect, (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json({ ...authParams, publicKey: process.env.IMAGEKIT_PUBLIC_KEY, urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get auth params' });
  }
});

module.exports = router;

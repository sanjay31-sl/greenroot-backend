const router = require('express').Router();
const Nursery = require('../models/Nursery');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/nurseries — public, approved nurseries
router.get('/', async (req, res) => {
  try {
    const nurseries = await Nursery.find({ status: 'approved' });
    res.json({ nurseries });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/nurseries/my — owner get their nursery
router.get('/my', protect, restrictTo('owner'), async (req, res) => {
  try {
    const nursery = await Nursery.findOne({ owner: req.user._id });
    res.json({ nursery });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/nurseries/my — owner create nursery
router.post('/my', protect, restrictTo('owner'), async (req, res) => {
  try {
    const exists = await Nursery.findOne({ owner: req.user._id });
    if (exists) return res.status(400).json({ message: 'Nursery already exists. Use PUT to update.' });
   const nursery = await Nursery.create({ ...req.body, owner: req.user._id, status: 'approved' });
    res.status(201).json({ nursery });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/nurseries/my — owner update nursery
router.put('/my', protect, restrictTo('owner'), async (req, res) => {
  try {
    const nursery = await Nursery.findOneAndUpdate(
      { owner: req.user._id }, req.body, { new: true, upsert: true }
    );
    res.json({ nursery });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

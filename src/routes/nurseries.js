const router = require('express').Router();
const Nursery = require('../models/Nursery');
const { protect, restrictTo } = require('../middleware/auth');

// MUST be before /:id
router.get('/my', protect, restrictTo('owner'), async (req, res) => {
  try {
    const nursery = await Nursery.findOne({ owner: req.user._id });
    res.json({ nursery });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

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

router.put('/my', protect, restrictTo('owner'), async (req, res) => {
  try {
    const nursery = await Nursery.findOneAndUpdate(
      { owner: req.user._id }, { ...req.body, status: 'approved' }, { new: true, upsert: true }
    );
    res.json({ nursery });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const nurseries = await Nursery.find({ status: 'approved' });
    res.json({ nurseries });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const nursery = await Nursery.findById(req.params.id);
    if (!nursery) return res.status(404).json({ message: 'Nursery not found' });
    res.json({ nursery });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
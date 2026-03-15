const router = require('express').Router();
const Plant = require('../models/Plant');
const Nursery = require('../models/Nursery');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/plants — public, all active plants
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const plants = await Plant.find(filter).sort({ createdAt: -1 });
    res.json({ plants });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/plants/nursery — owner's plants
router.get('/nursery', protect, restrictTo('owner'), async (req, res) => {
  try {
    const nursery = await Nursery.findOne({ owner: req.user._id });
    if (!nursery) return res.json({ plants: [] });
    const plants = await Plant.find({ nursery: nursery._id }).sort({ createdAt: -1 });
    res.json({ plants });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/plants — owner add plant
router.post('/', protect, restrictTo('owner'), async (req, res) => {
  try {
    const nursery = await Nursery.findOne({ owner: req.user._id });
    if (!nursery) return res.status(400).json({ message: 'Create your nursery first' });
    const plant = await Plant.create({ ...req.body, nursery: nursery._id, nurseryName: nursery.name });
    res.status(201).json({ plant });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/plants/:id/stock — update stock
router.patch('/:id/stock', protect, restrictTo('owner'), async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true });
    res.json({ plant });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/plants/:id
router.delete('/:id', protect, restrictTo('owner'), async (req, res) => {
  try {
    await Plant.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Plant removed' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

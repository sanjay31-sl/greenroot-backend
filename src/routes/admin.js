const router = require('express').Router();
const User = require('../models/User');
const Nursery = require('../models/Nursery');
const Order = require('../models/Order');
const { protect, restrictTo } = require('../middleware/auth');

const guard = [protect, restrictTo('admin')];

// GET /api/admin/stats
router.get('/stats', ...guard, async (req, res) => {
  try {
    const [users, nurseries, orders] = await Promise.all([
      User.countDocuments(),
      Nursery.countDocuments(),
      Order.find()
    ]);
    const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
    res.json({ users, nurseries, orders: orders.length, revenue });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', ...guard, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', ...guard, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).select('-password');
    res.json({ user });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/nurseries
router.get('/nurseries', ...guard, async (req, res) => {
  try {
    const nurseries = await Nursery.find().populate('owner', 'name email');
    res.json({ nurseries });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/nurseries/:id/approve
router.patch('/nurseries/:id/approve', ...guard, async (req, res) => {
  try {
    const nursery = await Nursery.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json({ nursery });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/nurseries/:id
router.delete('/nurseries/:id', ...guard, async (req, res) => {
  try {
    await Nursery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Nursery deleted' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const router = require('express').Router();
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const Nursery = require('../models/Nursery');
const { protect, restrictTo } = require('../middleware/auth');

// POST /api/orders — customer place order
router.post('/', protect, restrictTo('customer'), async (req, res) => {
  try {
    const { items, total, fulfilment, deliveryAddress, deliveryDate } = req.body;
    // Get nursery from first plant
    const plant = await Plant.findById(items[0].plant);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    const order = await Order.create({
      customer: req.user._id,
      nursery: plant.nursery,
      items, total, fulfilment, deliveryAddress, deliveryDate
    });
    // Decrement stock
    for (const item of items) {
      await Plant.findByIdAndUpdate(item.plant, { $inc: { stock: -item.qty } });
    }
    res.status(201).json({ order });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my — customer orders
router.get('/my', protect, restrictTo('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('nursery', 'name')
      .sort({ createdAt: -1 });
    res.json({ orders, total: orders.length });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/cancel — customer cancel
router.patch('/:id/cancel', protect, restrictTo('customer'), async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id, status: 'pending' },
      { status: 'cancelled' }, { new: true }
    );
    if (!order) return res.status(400).json({ message: 'Cannot cancel this order' });
    // Restore stock
    for (const item of order.items) {
      await Plant.findByIdAndUpdate(item.plant, { $inc: { stock: item.qty } });
    }
    res.json({ order });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/nursery — owner orders
router.get('/nursery', protect, restrictTo('owner'), async (req, res) => {
  try {
    const nursery = await Nursery.findOne({ owner: req.user._id });
    if (!nursery) return res.json({ orders: [] });
    const { status } = req.query;
    const filter = { nursery: nursery._id };
    if (status && status !== 'all') filter.status = status;
    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('items.plant', 'name emoji price')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status — owner update status
router.patch('/:id/status', protect, restrictTo('owner'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    res.json({ order });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nursery:         { type: mongoose.Schema.Types.ObjectId, ref: 'Nursery', required: true },
  items: [{
    plant:  { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    name:   String,
    qty:    { type: Number, required: true, min: 1 },
    price:  { type: Number, required: true },
  }],
  total:           { type: Number, required: true },
  fulfilment:      { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
  deliveryAddress: { type: String, default: '' },
  deliveryDate:    { type: String, default: '' },
  status:          { type: String, enum: ['pending','processing','shipped','delivered','cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

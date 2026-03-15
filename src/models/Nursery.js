const mongoose = require('mongoose');

const nurserySchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  owner:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address:            { type: String, default: '' },
  phone:              { type: String, default: '' },
  description:        { type: String, default: '' },
  openTime:           { type: String, default: '08:00' },
  closeTime:          { type: String, default: '20:00' },
  deliveryCharge:     { type: Number, default: 50 },
  freeDeliveryAbove:  { type: Number, default: 999 },
  status:             { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Nursery', nurserySchema);

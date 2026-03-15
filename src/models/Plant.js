const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  scientificName: { type: String, default: '' },
  category:       { type: String, enum: ['indoor','outdoor','succulent','herb','flowering','tree'], required: true },
  emoji:          { type: String, default: '🌿' },
  price:          { type: Number, required: true, min: 0 },
  stock:          { type: Number, required: true, min: 0, default: 0 },
  description:    { type: String, default: '' },
  careTips:       { type: String, default: '' },
  nursery:        { type: mongoose.Schema.Types.ObjectId, ref: 'Nursery', required: true },
  nurseryName:    { type: String, default: '' },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Plant', plantSchema);

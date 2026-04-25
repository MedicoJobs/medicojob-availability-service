const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['available', 'busy'], default: 'available' },
  shiftStart: { type: String }, // e.g., "08:00"
  shiftEnd: { type: String }   // e.g., "17:00"
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);

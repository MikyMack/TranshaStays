const mongoose = require('mongoose');

const pgBedSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'PgRoom', required: true },
  bedNumber: { type: String, required: true },
  isOccupied: { type: Boolean, default: false },
  pricePerMonth: { type: Number, default: 0 },
  depositAmount: { type: Number, default: 0 },
  currentTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'PgTenant' }
}, { timestamps: true });



module.exports = mongoose.model('PgBed', pgBedSchema);

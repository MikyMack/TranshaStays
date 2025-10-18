const mongoose = require('mongoose');

const pgLeaseSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'PgTenant', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'PgProperty' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'PgRoom' },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'PgBed' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  rentAmount: { type: Number, required: true },
  depositAmount: { type: Number },
  paymentHistory: [{ date: Date, amount: Number, method: String }]
}, { timestamps: true });

module.exports = mongoose.model('PgLease', pgLeaseSchema);

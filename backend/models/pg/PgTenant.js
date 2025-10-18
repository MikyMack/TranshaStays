const mongoose = require('mongoose');

const pgTenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  gender: { type: String, enum: ['Male','Female','Other'] },
  idProofUrl: { type: String },
  emergencyContact: { name: String, phone: String, relation: String },
  totalStayMonths: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PgTenant', pgTenantSchema);

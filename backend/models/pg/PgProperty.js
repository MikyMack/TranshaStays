const mongoose = require('mongoose');

const pgPropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  description: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  contactNumber: { type: String },
  email: { type: String },
  googleMapLink: { type: String },
  totalFloors: { type: Number, default: 0 },
  totalRooms: { type: Number, default: 0 },
  totalBeds: { type: Number, default: 0 },
  amenities: [{ type: String }],
  rules: [{ type: String }],
  images: [{ type: String }],
  genderType: { type: String, enum: ['Male', 'Female', 'Co-Living'], default: 'Co-Living' },
  checkInTime: { type: String, default: '12:00 PM' },
  checkOutTime: { type: String, default: '11:00 AM' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true,toJSON: { virtuals: true }, toObject: { virtuals: true } });

pgPropertySchema.virtual('floors', {
    ref: 'PgFloor',
    localField: '_id',
    foreignField: 'property'
  });

  module.exports = mongoose.models.PgProperty || mongoose.model('PgProperty', pgPropertySchema);


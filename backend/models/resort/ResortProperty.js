const mongoose = require('mongoose');

const resortPropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  description: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: String },
  contactNumber: { type: String },
  email: { type: String },
  googleMapLink: { type: String },
  amenities: [{ type: String }],
  rules: [{ type: String }],
  images: [{ type: String }],
  totalRooms: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  checkInTime: { type: String, default: '12:00 PM' },
  checkOutTime: { type: String, default: '11:00 AM' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

resortPropertySchema.virtual('rooms', {
    ref: 'ResortRoom',        
    localField: '_id',        
    foreignField: 'property', 
  });

module.exports = mongoose.model('ResortProperty', resortPropertySchema);

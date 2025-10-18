const mongoose = require('mongoose');

const resortRoomSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'ResortProperty', required: true },
  name: { type: String, required: true }, // Added name
  roomNumber: { type: String, required: true },
  roomType: { type: String, enum: ['Standard', 'Deluxe', 'Suite'], required: true },
  bedType: { type: String }, 
  capacity: { type: Number, default: 2 },
  pricePerNight: { type: Number, default: 0 },
  extraBedPrice: { type: Number }, 
  maxOccupants: { type: Number },   
  description: { type: String },
  amenities: [{ type: String }],
  images: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  status: { type: String, enum: ['Available', 'Booked', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('ResortRoom', resortRoomSchema);

const mongoose = require('mongoose');

const pgRoomSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'PgProperty', required: true },
  floor: { type: mongoose.Schema.Types.ObjectId, ref: 'PgFloor' },
  roomNumber: { type: String },
  sharingType: { type: String, enum: ['Single', 'Double', 'Triple', 'Shared'], required: true },
  capacity: { type: Number, default: 1 },
  pricePerMonth: { type: Number, default: 0 },
  depositAmount: { type: Number, default: 0 },
  amenities: [{ type: String }],
  images: [{ type: String }],
  beds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PgBed' }],
  isAvailable: { type: Boolean, default: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' }
}, { timestamps: true , toJSON: { virtuals: true }, toObject: { virtuals: true } });

pgRoomSchema.virtual('allBeds', {
    ref: 'PgBed',
    localField: '_id',
    foreignField: 'room'
  });

module.exports = mongoose.model('PgRoom', pgRoomSchema);

const mongoose = require('mongoose');

const resortBookingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'ResortProperty', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'ResortRoom', required: true },
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, default: 1 },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending','Paid','Refunded'], default: 'Pending' },
  bookingStatus: { type: String, enum: ['Pending','Confirmed','CheckedIn','CheckedOut','Cancelled'], default: 'Pending' },
  specialRequests: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ResortBooking', resortBookingSchema);

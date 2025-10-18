const mongoose = require('mongoose');

const pgBookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PgProperty',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PgRoom',
    required: true
  },
  bed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PgBed'
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date
  },
  totalRent: {
    type: Number,
    required: true
  },
  advanceAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed'
  }
}, { timestamps: true });

module.exports = mongoose.model('PgBooking', pgBookingSchema);

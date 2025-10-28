const mongoose = require("mongoose");
const { Schema } = mongoose;

const premiumApartmentBookingSchema = new Schema(
  {
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PremiumApartment",
      required: true,
    },

    // Either full apartment or room booking
    bookingType: {
      type: String,
      enum: ["Full Apartment", "Room"],
      required: true,
    },

    // If full apartment
    fullApartmentId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // If booking individual room(s)
    roomIds: [{ type: mongoose.Schema.Types.ObjectId }],

    guestDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },

    totalGuests: { type: Number, required: true },
    totalNights: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },

    bookingStatus: {
      type: String,
      enum: ["Confirmed", "Cancelled", "Completed"],
      default: "Confirmed",
    },

    specialRequests: { type: String },

    // Keep record of room/apartment availability changes
    availabilityUpdated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PremiumApartmentBooking", premiumApartmentBookingSchema);

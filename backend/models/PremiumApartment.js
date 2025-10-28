const mongoose = require('mongoose');
const { Schema } = mongoose;

// Reusable Schema for each room inside an apartment
const roomSchema = new Schema({
  roomName: { type: String, required: true },
  roomType: { type: String, enum: ["Single", "Double", "Suite", "Deluxe"], required: true },
  capacity: { type: Number, required: true },
  bedType: { type: String },
  pricePerNight: { type: Number, required: true },
  amenities: [String],
  images: [String], // Cloudinary URLs
  isAvailable: { type: Boolean, default: true },
  description: { type: String },
});

// Schema for each full apartment or unit inside the property
const fullApartmentSchema = new Schema({
  apartmentName: { type: String, required: true },
  totalRooms: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number },
  amenities: [String],
  images: [String],
  isAvailable: { type: Boolean, default: true },
  description: { type: String },
  // ✅ Nested Rooms: optional if apartment has room-based booking
  rooms: [roomSchema],
});

// Main Premium Apartment Schema
const premiumApartmentSchema = new Schema(
  {
    propertyTitle: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ["Full Apartment", "Room Based", "Mixed"],
      default: "Mixed",
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, default: "India" },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    floors: { type: Number, default: 1 },

    // ✅ Apartments (each may have rooms)
    apartments: [fullApartmentSchema],

    // Optional for “Room Based” type
    rooms: [roomSchema],

    checkInTime: { type: String, default: "12:00 PM" },
    checkOutTime: { type: String, default: "11:00 AM" },
    minStayNights: { type: Number, default: 1 },
    maxStayNights: { type: Number },

    highlights: [String],
    rules: [String],
    cancellationPolicy: {
      type: String,
      default: "Free cancellation up to 24 hours before check-in",
    },

    taxesAndFees: {
      cleaningFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      taxPercent: { type: Number, default: 0 },
    },

    host: {
      name: { type: String },
      contact: { type: String },
      email: { type: String },
    },

    gallery: [String],
    featured: { type: Boolean, default: false },
    rating: {
      average: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
    },
    reviews: [
      {
        name: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PremiumApartment", premiumApartmentSchema);

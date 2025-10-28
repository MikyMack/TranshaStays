const mongoose = require("mongoose");
const { Schema } = mongoose;

const pgSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" },
      pincode: { type: String },
    },
    images: {
      type: [String], // Cloudinary URLs
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one image is required",
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PG", pgSchema);

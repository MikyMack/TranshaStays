const express = require('express');
const upload = require("../utils/multer.js");
const {
  createPremiumApartment,
  getAllPremiumApartments,
  getPremiumApartmentById,
  updatePremiumApartment,
  deletePremiumApartment,
  toggleActiveStatus,
  updateAvailability,
  addReview,
  editReview,
  deleteReview,
} = require("../controllers/premiumApartmentController.js");

const router = express.Router();

// Create
router.post("/", upload.array("gallery", 10), createPremiumApartment);

// List all
router.get("/", getAllPremiumApartments);

// Get by ID
router.get("/:id", getPremiumApartmentById);

// Update
router.put("/:id", upload.array("gallery", 10), updatePremiumApartment);

// Delete
router.delete("/:id", deletePremiumApartment);

// Toggle active/inactive
router.patch("/:id/toggle", toggleActiveStatus);

// Update availability (room or apartment)
router.patch("/:id/availability", updateAvailability);

router.post("/:apartmentId/reviews", addReview);

// PUT → Edit a review
router.put("/:apartmentId/reviews/:reviewId", editReview);

// DELETE → Delete a review
router.delete("/:apartmentId/reviews/:reviewId", deleteReview);

module.exports = router;

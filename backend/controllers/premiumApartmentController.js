const PremiumApartment = require("../models/PremiumApartment");
const cloudinary = require("../utils/cloudinary");

// ✅ Create new Premium Apartment
const createPremiumApartment = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);

    // Upload gallery images to Cloudinary (if any)
    let gallery = [];
    if (req.files && req.files.length > 0) {
      gallery = req.files.map((file) => file.path);
    }

    const apartment = new PremiumApartment({
      ...data,
      gallery,
    });

    await apartment.save();
    res.status(201).json({ success: true, apartment });
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating premium apartment",
      error: error.message,
    });
  }
};

// ✅ Get all apartments (with filters + pagination)
const getAllPremiumApartments = async (req, res) => {
  try {
    const { city, featured, active, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (city) filter["location.city"] = city;
    if (featured) filter.featured = featured === "true";
    if (active) filter.isActive = active === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const apartments = await PremiumApartment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PremiumApartment.countDocuments(filter);

    // Derived values fallback
    const mapped = apartments.map((apt) => {
      const firstRoom = apt.rooms?.[0];
      const firstFull = apt.apartments?.[0];

      return {
        ...apt.toObject(),
        derivedDescription:
          apt.description ||
          firstFull?.description ||
          firstRoom?.description ||
          "No description provided.",
        derivedPrice:
          firstRoom?.pricePerNight ||
          firstFull?.pricePerNight ||
          apt.apartmentPricePerNight ||
          0,
        derivedAmenities:
          firstFull?.amenities?.length > 0
            ? firstFull.amenities
            : firstRoom?.amenities || [],
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      apartments: mapped,
    });
  } catch (error) {
    console.error("List Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching premium apartments",
      error: error.message,
    });
  }
};

// ✅ Get single apartment by ID
const getPremiumApartmentById = async (req, res) => {
  try {
    const apt = await PremiumApartment.findById(req.params.id);
    if (!apt)
      return res
        .status(404)
        .json({ success: false, message: "Apartment not found" });

    const firstRoom = apt.rooms?.[0];
    const firstFull = apt.apartments?.[0];

    const derived = {
      derivedDescription:
        apt.description ||
        firstFull?.description ||
        firstRoom?.description ||
        "No description available.",
      derivedPrice:
        firstRoom?.pricePerNight ||
        firstFull?.pricePerNight ||
        apt.apartmentPricePerNight ||
        0,
      derivedAmenities:
        firstFull?.amenities?.length > 0
          ? firstFull.amenities
          : firstRoom?.amenities || [],
    };

    res.status(200).json({
      success: true,
      apartment: { ...apt.toObject(), ...derived },
    });
  } catch (error) {
    console.error("Get Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching apartment details",
      error: error.message,
    });
  }
};

// ✅ Update apartment (with optional image replace)
const updatePremiumApartment = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const existing = await PremiumApartment.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Apartment not found" });

    let gallery = existing.gallery;

    if (req.files && req.files.length > 0) {
      // Delete old gallery
      for (const img of existing.gallery) {
        try {
          const publicId = img.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch {}
      }
      gallery = req.files.map((file) => file.path);
    }

    const updated = await PremiumApartment.findByIdAndUpdate(
      req.params.id,
      { ...data, gallery },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Apartment updated successfully",
      apartment: updated,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating apartment",
      error: error.message,
    });
  }
};

// ✅ Delete apartment
const deletePremiumApartment = async (req, res) => {
  try {
    const apt = await PremiumApartment.findById(req.params.id);
    if (!apt)
      return res
        .status(404)
        .json({ success: false, message: "Apartment not found" });

    // Delete gallery images
    if (apt.gallery?.length > 0) {
      for (const img of apt.gallery) {
        try {
          const publicId = img.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch {}
      }
    }

    await apt.deleteOne();
    res.status(200).json({ success: true, message: "Apartment deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting apartment",
      error: error.message,
    });
  }
};

// ✅ Toggle active/inactive
const toggleActiveStatus = async (req, res) => {
  try {
    const apt = await PremiumApartment.findById(req.params.id);
    if (!apt)
      return res
        .status(404)
        .json({ success: false, message: "Apartment not found" });

    apt.isActive = !apt.isActive;
    await apt.save();

    res.status(200).json({
      success: true,
      message: `Apartment is now ${apt.isActive ? "Active" : "Inactive"}`,
      isActive: apt.isActive,
    });
  } catch (error) {
    console.error("Toggle Error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling active status",
      error: error.message,
    });
  }
};

// ✅ Update room or apartment availability (use sub_id)
const updateAvailability = async (req, res) => {
  try {
    const { type, subId, available } = req.body; // subId = _id of room/apartment

    const apt = await PremiumApartment.findById(req.params.id);
    if (!apt)
      return res.status(404).json({ success: false, message: "Apartment not found" });

    let updated = false;

    if (type === "room") {
      const room = apt.rooms.id(subId);
      if (room) {
        room.isAvailable = available;
        updated = true;
      }
    } else if (type === "apartment") {
      const full = apt.apartments.id(subId);
      if (full) {
        full.isAvailable = available;
        updated = true;
      }
    }

    if (!updated)
      return res.status(400).json({ success: false, message: "Invalid type or subId" });

    await apt.save();
    res.status(200).json({ success: true, message: "Availability updated", apartment: apt });
  } catch (error) {
    console.error("Availability Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating availability",
      error: error.message,
    });
  }
};


// Add Review (no 'user' property, as per model)
const addReview = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const { name, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and comment are required" });
    }

    const apartment = await PremiumApartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ success: false, message: "Apartment not found" });
    }

    apartment.reviews.push({
      name,
      rating,
      comment,
      date: new Date(),
    });

    // Update average rating and count
    apartment.rating.reviewsCount = apartment.reviews.length;
    apartment.rating.average =
      apartment.reviews.reduce((sum, r) => sum + r.rating, 0) / apartment.reviews.length;

    await apartment.save();

    res.status(201).json({ success: true, message: "Review added successfully", apartment });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({ success: false, message: "Error adding review", error: error.message });
  }
};

// Edit Review (no 'user' in schema)
const editReview = async (req, res) => {
  try {
    const { apartmentId, reviewId } = req.params;
    const { rating, comment } = req.body;

    const apartment = await PremiumApartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ success: false, message: "Apartment not found" });
    }

    const review = apartment.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.date = new Date();

    // Recalculate ratings
    apartment.rating.reviewsCount = apartment.reviews.length;
    apartment.rating.average =
      apartment.reviews.reduce((sum, r) => sum + r.rating, 0) / apartment.reviews.length;

    await apartment.save();

    res.status(200).json({ success: true, message: "Review updated successfully", apartment });
  } catch (error) {
    console.error("Edit Review Error:", error);
    res.status(500).json({ success: false, message: "Error updating review", error: error.message });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { apartmentId, reviewId } = req.params;

    const apartment = await PremiumApartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ success: false, message: "Apartment not found" });
    }

    const review = apartment.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Remove review
    review.remove();

    // Recalculate ratings
    if (apartment.reviews.length > 0) {
      apartment.rating.reviewsCount = apartment.reviews.length;
      apartment.rating.average =
        apartment.reviews.reduce((sum, r) => sum + r.rating, 0) / apartment.reviews.length;
    } else {
      apartment.rating.reviewsCount = 0;
      apartment.rating.average = 0;
    }

    await apartment.save();

    res.status(200).json({ success: true, message: "Review deleted successfully", apartment });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({ success: false, message: "Error deleting review", error: error.message });
  }
};


module.exports = {
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
};

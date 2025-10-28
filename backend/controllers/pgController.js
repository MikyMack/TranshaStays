const PG = require("../models/PayingGuest");
const cloudinary = require("cloudinary").v2;


exports.createPG = async (req, res) => {
  try {
    const { title, location } = req.body;

    if (!title || !location)
      return res.status(400).json({ message: "Title and location are required." });

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "pg_images",
        });
        imageUrls.push(result.secure_url);
      }
    }

    const newPG = await PG.create({
      title,
      location: JSON.parse(location), // in case location is sent as JSON string
      images: imageUrls,
    });

    res.status(201).json({ message: "PG created successfully", pg: newPG });
  } catch (error) {
    console.error("Error creating PG:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.updatePG = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location } = req.body;

    const pg = await PG.findById(id);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    // Upload new images if any
    const imageUrls = [...pg.images];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "pg_images",
        });
        imageUrls.push(result.secure_url);
      }
    }

    pg.title = title || pg.title;
    pg.location = location ? JSON.parse(location) : pg.location;
    pg.images = imageUrls;

    const updatedPG = await pg.save();

    res.status(200).json({ message: "PG updated successfully", pg: updatedPG });
  } catch (error) {
    console.error("Error updating PG:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.deletePG = async (req, res) => {
  try {
    const { id } = req.params;
    const pg = await PG.findById(id);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    await PG.findByIdAndDelete(id);
    res.status(200).json({ message: "PG deleted successfully" });
  } catch (error) {
    console.error("Error deleting PG:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const pg = await PG.findById(id);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    pg.isAvailable = isAvailable;
    await pg.save();

    res.status(200).json({ message: "Availability updated successfully", pg });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

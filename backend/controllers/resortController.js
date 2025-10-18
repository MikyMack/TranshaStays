const ResortProperty = require('../models/resort/ResortProperty');
const cloudinary = require('cloudinary').v2;

// ✅ CREATE Resort
exports.createResort = async (req, res) => {
 
    
  try {
    const {
      name,
      slug,
      description,
      address,
      city,
      state,
      country,
      pincode,
      contactNumber,
      email,
      googleMapLink,
      amenities,
      rules,
      checkInTime,
      checkOutTime,
      rating
    } = req.body;

    function normalizeArrayField(field) {
      if (!field) return [];
      if (Array.isArray(field)) return field.map(a => (typeof a === 'string' ? a.trim() : a));
      if (typeof field === 'string') {
        return field.split(',').map(a => a.trim()).filter(Boolean);
      }
      return [];
    }

    // Handle uploaded images from Cloudinary
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const resort = new ResortProperty({
      name,
      slug,
      description,
      address,
      city,
      state,
      country,
      pincode,
      contactNumber,
      email,
      rating,
      googleMapLink,
      amenities: normalizeArrayField(amenities),
      rules: normalizeArrayField(rules),
      images: imageUrls,
      checkInTime,
      checkOutTime
    });

    await resort.save();
    res.status(201).json({ success: true, message: 'Resort created successfully', resort });
  } catch (error) {
    console.error('Error creating resort:', error);
    res.status(500).json({ success: false, message: 'Failed to create resort', error: error.message });
  }
};
// ✅ UPDATE Resort (edit)
exports.updateResort = async (req, res) => {
    try {
      const { id } = req.params;
  
      const {
        name,
        slug,
        description,
        address,
        city,
        state,
        country,
        pincode,
        contactNumber,
        email,
        rating,
        googleMapLink,
        amenities,
        rules,
        checkInTime,
        checkOutTime
      } = req.body;
  
      // Same normalization helper as above
      function normalizeArrayField(field) {
        if (!field) return undefined;
        if (Array.isArray(field)) return field.map(a => (typeof a === 'string' ? a.trim() : a));
        if (typeof field === 'string') {
          return field.split(',').map(a => a.trim()).filter(Boolean);
        }
        return undefined;
      }
  
      const resort = await ResortProperty.findById(id);
      if (!resort) return res.status(404).json({ success: false, message: 'Resort not found' });
  
      // Upload new images if provided
      let newImageUrls = [];
      if (req.files && req.files.length > 0) {
        newImageUrls = req.files.map(file => file.path);
  
        // Optional: delete old images from Cloudinary
        if (resort.images.length > 0) {
          for (const img of resort.images) {
            try {
              const publicId = img.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(`Transha-Stays/${publicId}`);
            } catch (err) {
              console.log('Error deleting old image:', err.message);
            }
          }
        }
      }
  
      resort.name = name || resort.name;
      resort.slug = slug || resort.slug;
      resort.description = description || resort.description;
      resort.address = address || resort.address;
      resort.city = city || resort.city;
      resort.state = state || resort.state;
      resort.country = country || resort.country;
      resort.pincode = pincode || resort.pincode;
      resort.contactNumber = contactNumber || resort.contactNumber;
      resort.email = email || resort.email;
      resort.rating = rating || resort.rating;
      resort.googleMapLink = googleMapLink || resort.googleMapLink;
      const amenitiesNormalized = normalizeArrayField(amenities);
      if (amenitiesNormalized !== undefined) resort.amenities = amenitiesNormalized;
      const rulesNormalized = normalizeArrayField(rules);
      if (rulesNormalized !== undefined) resort.rules = rulesNormalized;
      resort.checkInTime = checkInTime || resort.checkInTime;
      resort.checkOutTime = checkOutTime || resort.checkOutTime;
      if (newImageUrls.length > 0) resort.images = newImageUrls;
  
      await resort.save();
      res.status(200).json({ success: true, message: 'Resort updated successfully', resort });
    } catch (error) {
      console.error('Error updating resort:', error);
      res.status(500).json({ success: false, message: 'Failed to update resort', error: error.message });
    }
  };


// ✅ LIST all resorts (with filters)
exports.getAllResorts = async (req, res) => {
  try {
    const { city, state, active } = req.query;
    const filters = {};

    if (city) filters.city = city;
    if (state) filters.state = state;
    if (active !== undefined) filters.isActive = active === 'true';

    const resorts = await ResortProperty.find(filters).sort({ createdAt: -1 });
    res.status(200).json({ success: true, resorts });
  } catch (error) {
    console.error('Error fetching resorts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resorts', error: error.message });
  }
};



// ✅ GET single resort by ID
exports.getResortById = async (req, res) => {
  try {
    const { id } = req.params;
    const resort = await ResortProperty.findById(id);

    if (!resort) return res.status(404).json({ success: false, message: 'Resort not found' });

    res.status(200).json({ success: true, resort });
  } catch (error) {
    console.error('Error fetching resort:', error);
    res.status(500).json({ success: false, message: 'Failed to get resort', error: error.message });
  }
};







// ✅ DELETE Resort (and delete images from Cloudinary)
exports.deleteResort = async (req, res) => {
  try {
    const { id } = req.params;
    const resort = await ResortProperty.findById(id);

    if (!resort) return res.status(404).json({ success: false, message: 'Resort not found' });

    // Delete images from Cloudinary
    for (const img of resort.images) {
      try {
        const publicId = img.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`Transha-Stays/${publicId}`);
      } catch (err) {
        console.log('Error deleting image:', err.message);
      }
    }

    await resort.deleteOne();
    res.status(200).json({ success: true, message: 'Resort deleted successfully' });
  } catch (error) {
    console.error('Error deleting resort:', error);
    res.status(500).json({ success: false, message: 'Failed to delete resort', error: error.message });
  }
};



// ✅ TOGGLE Active/Inactive
exports.toggleResortStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const resort = await ResortProperty.findById(id);
    if (!resort) return res.status(404).json({ success: false, message: 'Resort not found' });

    resort.isActive = !resort.isActive;
    await resort.save();

    res.status(200).json({
      success: true,
      message: `Resort is now ${resort.isActive ? 'Active' : 'Inactive'}`,
      isActive: resort.isActive
    });
  } catch (error) {
    console.error('Error toggling resort status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle resort status', error: error.message });
  }
};

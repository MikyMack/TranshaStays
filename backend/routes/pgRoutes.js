


const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const PgProperty = require('../models/pg/PgProperty');
const PgFloor = require('../models/pg/PgFloor');
const PgRoom = require('../models/pg/PgRoom');
const PgBed = require('../models/pg/PgBed');
const PgTenant = require('../models/pg/PgTenant');
const PgLease = require('../models/pg/PgLease');



// Create PG Property
router.post('/property/create', upload.array('images', 10), async (req, res) => {
    try {
        const { name, slug, description, city, state, address, contactNumber, email, totalFloors, amenities, rules } = req.body;
        const images = req.files?.map(f => f.path) || [];

        const property = new PgProperty({
            name, slug, description, city, state, address, contactNumber, email,
            totalFloors, amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
            rules: rules ? rules.split(',').map(r => r.trim()) : [],
            images
        });
        await property.save();
        res.status(201).json({ success: true, message: 'PG Property created', data: property });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Update PG Property
router.put('/property/:id', upload.array('images', 10), async (req, res) => {
    try {
        const updates = req.body;
        if (req.files && req.files.length) updates.images = req.files.map(f => f.path);

        const property = await PgProperty.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        res.json({ success: true, message: 'Property updated', data: property });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete PG Property
router.delete('/property/:id', async (req, res) => {
    try {
        await PgProperty.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Property deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// List Properties
router.get('/property', async (req, res) => {
    try {
        const properties = await PgProperty.find().sort({ createdAt: -1 });
        res.json({ success: true, data: properties });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Toggle Active
router.patch('/property/toggle/:id', async (req, res) => {
    try {
        const property = await PgProperty.findById(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
        property.isActive = !property.isActive;
        await property.save();
        res.json({ success: true, message: `Property is now ${property.isActive ? 'Active' : 'Inactive'}`, data: property });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});



// Create Floor
router.post('/floor/create', async (req, res) => {
    try {
        const { property, floorNumber, name ,description } = req.body;
        const floor = new PgFloor({ property, floorNumber, name,description });
        await floor.save();
        res.status(201).json({ success: true, message: 'Floor created', data: floor });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Update Floor
router.put('/floor/:id', async (req, res) => {
    try {
        const floor = await PgFloor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Floor updated', data: floor });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete Floor
router.delete('/floor/:id', async (req, res) => {
    try { await PgFloor.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Floor deleted' }); }
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// List Floors
router.get('/floor', async (req, res) => {
    try { const floors = await PgFloor.find().populate('property'); res.json({ success: true, data: floors }); }
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});



// Create Room
router.post('/room/create', async (req, res) => {
    try {
        const { property, floor, roomNumber, sharingType, capacity, pricePerMonth, depositAmount, amenities, images, beds, isAvailable, status , description } = req.body;
        const room = new PgRoom({
            property,
            floor,
            roomNumber,
            sharingType,
            capacity,
            pricePerMonth,
            depositAmount,
            amenities,
            description,
            images,
            beds,
            isAvailable,
            status
        });
        await room.save();
        res.status(201).json({ success: true, message: 'Room created', data: room });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Update Room
router.put('/room/:id', async (req, res) => {
    try {
        const room = await PgRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Room updated', data: room });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete Room
router.delete('/room/:id', async (req, res) => {
    try { await PgRoom.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Room deleted' }); }
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// List Rooms
router.get('/room', async (req, res) => {
    try { const rooms = await PgRoom.find().populate('floor'); res.json({ success: true, data: rooms }); }
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


// Create Bed
router.post('/bed/create', async (req, res) => {
    try {
        const { room, bedNumber, pricePerMonth } = req.body;
        const bed = new PgBed({ room, bedNumber, pricePerMonth });
        await bed.save();
        res.status(201).json({ success: true, message: 'Bed created', data: bed });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Update Bed
router.put('/bed/:id', async (req, res) => {
    try {
        const bed = await PgBed.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Bed updated', data: bed });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete Bed
router.delete('/bed/:id', async (req, res) => {
    try { await PgBed.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Bed deleted' }); }
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// List Beds
router.get('/bed', async (req, res) => {
    try { const beds = await PgBed.find().populate('room'); res.json({ success: true, data: beds }); }
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});



// Create Tenant
router.post('/tenant/create', async (req, res) => {
    try {
        const tenant = new PgTenant(req.body);
        await tenant.save();
        res.status(201).json({ success: true, message: 'Tenant created', data: tenant });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


// Create Lease (prevent double booking)
router.post('/lease/create', async (req, res) => {
    try {
      const { tenant, bed, startDate, endDate, rentAmount, paymentStatus } = req.body;
  
      if (!tenant || !bed || !startDate || !endDate)
        return res.status(400).json({ success: false, message: 'tenant, bed, startDate and endDate are required' });
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      // Check for overlapping lease
      const overlappingLease = await PgLease.findOne({
        bed: bed,
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } } // overlap condition
        ]
      });
  
      if (overlappingLease) {
        return res.status(400).json({ success: false, message: 'Bed is already booked in the selected date range' });
      }
  
      const lease = new PgLease({ tenant, bed, startDate: start, endDate: end, rentAmount, paymentStatus });
      await lease.save();
  
      res.status(201).json({ success: true, message: 'Lease created successfully', data: lease });
  
    } catch (err) {
      console.error('Lease creation error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
  


// Check Availability with fullyAvailable flag
router.post('/pgAvailability', async (req, res) => {
    try {
      const { propertyId, startDate, endDate } = req.body;
  
      if (!propertyId || !startDate || !endDate)
        return res.status(400).json({ success: false, message: 'propertyId, startDate and endDate are required' });
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      // Fetch floors for property
      const floors = await PgFloor.find({ property: propertyId }).lean();
  
      const result = [];
  
      for (const floor of floors) {
        // Fetch rooms in floor
        const rooms = await PgRoom.find({ floor: floor._id }).lean();
  
        const roomsAvailability = [];
  
        for (const room of rooms) {
          // Fetch beds in room
          const beds = await PgBed.find({ room: room._id }).lean();
  
          const availableBeds = [];
  
          for (const bed of beds) {
            // Check for overlapping lease
            const overlappingLease = await PgLease.findOne({
              bed: bed._id,
              $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
              ]
            });
  
            if (!overlappingLease) {
              availableBeds.push(bed);
            }
          }
  
          // Room is fully available if all beds are available
          const fullyAvailable = availableBeds.length === beds.length;
  
          roomsAvailability.push({
            ...room,
            availableBeds,
            totalBeds: beds.length,
            fullyAvailable
          });
        }
  
        result.push({
          ...floor,
          rooms: roomsAvailability
        });
      }
  
      res.json({ success: true, propertyId, availability: result });
  
    } catch (err) {
      console.error('Availability check error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
  
  router.post('/admin-booking/pg/update-status', async (req, res) => {
    try {
      const { leaseId, status } = req.body; // you can add `status` to PgLease if needed
  
      const lease = await PgLease.findByIdAndUpdate(
        leaseId,
        { status }, // make sure you add a `status` field in PgLease if not already
        { new: true }
      );
  
      res.json({ success: true, data: lease });
    } catch (err) {
      console.error('PG lease status update error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
  

module.exports = router;

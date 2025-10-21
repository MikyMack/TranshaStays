


const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const PgProperty = require('../models/pg/PgProperty');
const PgFloor = require('../models/pg/PgFloor');
const PgRoom = require('../models/pg/PgRoom');
const PgBed = require('../models/pg/PgBed');
const PgBooking = require('../models/pg/pgBooking');



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






router.get('/pgAvailability', async (req, res) => {
  try {
    const { propertyId } = req.query;

    if (!propertyId)
      return res.status(400).json({ success: false, message: 'Property ID required' });

    const property = await PgProperty.findById(propertyId)
      .populate({
        path: 'floors',
        populate: {
          path: 'allRooms',
          populate: {
            path: 'allBeds',
            model: 'PgBed'
          }
        }
      })
      .lean();

    if (!property)
      return res.status(404).json({ success: false, message: 'PG property not found' });

    const floorsAvailability = (property.floors || []).map(floor => ({
      floorNumber: floor.floorNumber,
      name: floor.name,
      rooms: (floor.allRooms || []).map(room => ({
        _id: room._id,
        roomNumber: room.roomNumber,
        sharingType: room.sharingType,
        capacity: room.capacity,
        pricePerMonth: room.pricePerMonth,
        depositAmount: room.depositAmount,
        isAvailable: room.isAvailable,
        beds: (room.allBeds || []).map(bed => ({
          _id: bed._id,
          bedNumber: bed.bedNumber,
          isOccupied: bed.isOccupied,
          pricePerMonth: bed.pricePerMonth,
          depositAmount: bed.depositAmount
        }))
      }))
    }));

    res.json({
      success: true,
      available: true,
      property: property.name,
      floors: floorsAvailability
    });
  } catch (error) {
    console.error('Error checking PG availability:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.post('/bookPG', async (req, res) => {
  try {

    if (typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid body format, expected JSON." });
    }

    const {
      propertyId, roomId, bedId,
      name, phone, email,
      checkInDate, checkOutDate,
      totalRent, advanceAmount, advance
    } = req.body;

    const finalPropertyId = propertyId || req.body.property;
    const finalRoomId = roomId || req.body.room;
    const finalBedId = bedId || req.body.bed;
    const finalAdvanceAmount = (advanceAmount !== undefined) ? advanceAmount : (advance !== undefined ? advance : undefined);

    if (!finalPropertyId) {
      return res.status(400).json({ message: 'Property ID is required', detail: { reqBody: req.body } });
    }
    if (!finalRoomId) {
      return res.status(400).json({ message: 'Room ID is required', detail: { reqBody: req.body } });
    }
    if (!checkInDate) {
      return res.status(400).json({ message: 'Check-in date is required', detail: { reqBody: req.body } });
    }
    if (!totalRent) {
      return res.status(400).json({ message: 'Total rent is required', detail: { reqBody: req.body } });
    }

    const room = await PgRoom.findById(finalRoomId).populate('beds');
    if (!room || !room.isAvailable) {
      return res.status(400).json({ message: 'Room is not available' });
    }

    let selectedBed = null;
    if (finalBedId) {
      selectedBed = await PgBed.findById(finalBedId);
      if (!selectedBed || selectedBed.isOccupied) {
        return res.status(400).json({ message: 'Bed is not available' });
      }
      selectedBed.isOccupied = true;
      await selectedBed.save();
    }

    if (!finalBedId && room.beds && room.beds.length === 0) {
      room.isAvailable = false;
      await room.save();
    }

    const bookingData = {
      property: finalPropertyId,
      room: finalRoomId,
      bed: finalBedId || null,
      name,
      phone,
      email,
      checkInDate,
      checkOutDate: checkOutDate || null,
      totalRent,
      advanceAmount: finalAdvanceAmount,
      paymentStatus: Number(finalAdvanceAmount) > 0 ? 'Paid' : 'Pending',
      bookingStatus: 'Confirmed'
    };

    const booking = await PgBooking.create(bookingData);

    // Email sending block for user and admin notification
    if (
      email && typeof email === 'string' && email.includes('@')
      ||
      (typeof process.env.ADMIN_EMAIL === 'string' && process.env.ADMIN_EMAIL.includes('@'))
    ) {

      let propertyDoc = null;
      try {
        propertyDoc = await PgProperty.findById(finalPropertyId);
      } catch (_) {}

      const propertyName = propertyDoc?.name || 'Our Premium PG';
      const formattedCheckIn = checkInDate ? new Date(checkInDate).toLocaleDateString() : 'your check-in date';
      const formattedCheckOut = checkOutDate ? new Date(checkOutDate).toLocaleDateString() : undefined;

      // Compose user mail
      let subjectUser = `You're In! 🎉 Your PG Booking is Confirmed at ${propertyName}`;
      let htmlUser = `
        <div style="font-family:sans-serif;padding:20px;">
          <h2 style="color:#006699;">Welcome Aboard, ${name || 'PG Guest'}!</h2>
          <p>We're excited to let you know that your booking at <strong>${propertyName}</strong> is <span style="color:green;"><b>confirmed</b></span>!</p>
          <ul>
            <li><b>Check-in Date:</b> ${formattedCheckIn}</li>
            ${formattedCheckOut ? `<li><b>Check-out Date:</b> ${formattedCheckOut}</li>` : ''}
            <li><b>Total Rent To Be Paid:</b> ₹${totalRent}</li>
            ${finalAdvanceAmount ? `<li><b>Advance To be Paid:</b> ₹${finalAdvanceAmount}</li>` : ''}
            <li><b>Room:</b> ${room.roomNumber || '[Assigned Room]'}</li>
            ${selectedBed && selectedBed.bedNumber ? `<li><b>Bed:</b> ${selectedBed.bedNumber}</li>` : ''}
          </ul>
          <p style="font-size:16px;margin-top:24px;">
            Have questions or special requests? Just reply to this email or call us on ${propertyDoc?.contactNumber || '+91 96058 32333'}.
          </p>
          <div style="background:#eee;padding:14px;border-radius:6px;margin-top:18px;">
            <b>Pack your bags – your hassle-free stay awaits at <span style="color:#007BA7;">${propertyName}</span>!</b> <br>
            <span style="color:#555;font-size:13px;">We can't wait to welcome you.</span>
          </div>
          <p style="margin-top:24px;">Best regards,<br><b>The ${propertyName} Team</b></p>
        </div>
      `;

      // Compose admin mail
      let subjectAdmin = `PG Booking Alert: New Booking at ${propertyName}`;
      let htmlAdmin = `
        <div style="font-family:sans-serif;padding:20px;">
          <h2 style="color:#ce2525;">New PG Booking Received</h2>
          <p><b>Property:</b> ${propertyName}</p>
          <ul>
            <li><b>Name:</b> ${name || '[Guest]'}</li>
            <li><b>Phone:</b> ${phone || '[Not provided]'}</li>
            <li><b>Email:</b> ${email || '[Not provided]'}</li>
            <li><b>Check-in Date:</b> ${formattedCheckIn}</li>
            ${formattedCheckOut ? `<li><b>Check-out Date:</b> ${formattedCheckOut}</li>` : ''}
            <li><b>Total Rent:</b> ₹${totalRent}</li>
            ${finalAdvanceAmount ? `<li><b>Advance:</b> ₹${finalAdvanceAmount}</li>` : ''}
            <li><b>Room:</b> ${room.roomNumber || '[Assigned Room]'}</li>
            ${selectedBed && selectedBed.bedNumber ? `<li><b>Bed:</b> ${selectedBed.bedNumber}</li>` : ''}
          </ul>
          <p><b>Booking details:</b> <code style="background:#eee;">${booking._id}</code></p>
          <p>Logged at: ${new Date().toLocaleString()}</p>
        </div>
      `;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_PASS
        }
      });

      // Prepare email send promises
      const emailPromises = [];
      if (email && typeof email === 'string' && email.includes('@')) {
        emailPromises.push(
          transporter.sendMail({
            from: `"${propertyName}" <${process.env.ADMIN_EMAIL}>`,
            to: email,
            subject: subjectUser,
            html: htmlUser
          })
        );
      }
      if (
        typeof process.env.ADMIN_EMAIL === 'string'
        && process.env.ADMIN_EMAIL.includes('@')
      ) {
        emailPromises.push(
          transporter.sendMail({
            from: `"${propertyName} Booking Alert" <${process.env.ADMIN_EMAIL}>`,
            to: process.env.ADMIN_EMAIL,
            subject: subjectAdmin,
            html: htmlAdmin
          })
        );
      }

      try {
        await Promise.all(emailPromises);
      } catch (mailErr) {
        console.error('Booking email failed:', mailErr);
      }
    }

    res.json({ message: 'Booking successful', booking });
  } catch (error) {
    console.error('Error booking PG:', error, req.body);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


router.put('/Pgbooking/:id/status', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { bookingStatus } = req.body;

    if (
      !bookingStatus ||
      !['Confirmed', 'Cancelled', 'Completed'].includes(bookingStatus)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid or missing bookingStatus' });
    }

    const booking = await PgBooking.findByIdAndUpdate(
      bookingId,
      { bookingStatus },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking status updated', data: booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.delete('/PgDeletebooking/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;

    const deletedBooking = await PgBooking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking deleted successfully', data: deletedBooking });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});








module.exports = router;

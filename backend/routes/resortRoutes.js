const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const resortController = require('../controllers/resortController');
const ResortRoom = require('../models/resort/ResortRoom');
const ResortProperty = require('../models/resort/ResortProperty');
const ResortBooking = require('../models/resort/ResortBooking');
const nodemailer = require('nodemailer');


// CREATE resort
router.post('/create', upload.array('images', 10), resortController.createResort);

// LIST resorts
router.get('/', resortController.getAllResorts);

// GET single resort
router.get('/:id', resortController.getResortById);

// UPDATE resort
router.put('/:id', upload.array('images', 10), resortController.updateResort);

// DELETE resort
router.delete('/:id', resortController.deleteResort);

// TOGGLE active/inactive
router.patch('/:id/toggle', resortController.toggleResortStatus);



router.post('/bookingResort', async (req, res) => {
  try {
    const { propertyId, roomId, fullName, email, phone, checkInDate, checkOutDate, guests, specialRequests, totalAmount } = req.body;

    if (!propertyId || !roomId || !fullName || !phone || !checkInDate || !checkOutDate || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    // Check if room exists
    const room = await ResortRoom.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // Check if property exists
    const property = await ResortProperty.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Check overlapping bookings for this room
    const overlappingBooking = await ResortBooking.findOne({
      room: roomId,
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ success: false, message: 'Room is already booked for selected dates' });
    }

    // Create Booking
    const booking = new ResortBooking({
      property: propertyId,
      room: roomId,
      fullName,
      email,
      phone,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: guests || 1,
      specialRequests,
      totalAmount: totalAmount || room.price 
    });

    await booking.save();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
      }
    });

    // Catchy content - Booking User
    const userMailOptions = {
      from: `"Transha Stayss" <${adminEmail}>`,
      to: email,
      subject: "🌴 Your Resort Booking is Confirmed! See you soon!",
      html: `
        <div style="font-family:sans-serif;">
          <h2 style="color:#34568B;">Your getaway is booked! 🎉</h2>
          <p>Hey <strong>${fullName}</strong>,</p>
          <p>We're thrilled to have you at <strong>${property.name}</strong>!</p>
          <ul>
            <li><b>Room:</b> ${room.roomNumber || room._id}</li>
            <li><b>Type:</b> ${room.roomType || "-"}</li>
            <li><b>Check-in:</b> ${checkIn.toDateString()}</li>
            <li><b>Check-out:</b> ${checkOut.toDateString()}</li>
            <li><b>Guests:</b> ${guests || 1}</li>
          </ul>
          <p>
            <em>Special Requests:</em> ${specialRequests || 'None'}
          </p>
          <p style="margin-top:18px;">
            Our team is prepping your room and rolling out the red carpet for your arrival. If you have any ❤️-felt questions, reply to this email!
          </p>
          <p>
            We can’t wait to welcome you to an unforgettable experience. See you soon!<br>
            <strong style="color:#34568B;">Transha Stayss Team</strong>
          </p>
        </div>
      `
    };

    // Catchy content - Admin (same email—which is adminEmail)
    const adminMailOptions = {
      from: `"Transha Stayss" <${adminEmail}>`,
      to: adminEmail,
      subject: "🏨 New Resort Booking Received!",
      html: `
        <div style="font-family:sans-serif;">
          <h3>New Booking Alert!</h3>
          <p>A new booking has been placed for <strong>${property.name}</strong>.</p>
          <ul>
            <li><b>Guest:</b> ${fullName}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Phone:</b> ${phone}</li>
            <li><b>Room:</b> ${room.roomNumber || room._id}</li>
            <li><b>Type:</b> ${room.roomType || '-'}</li>
            <li><b>Check-in:</b> ${checkIn.toDateString()}</li>
            <li><b>Check-out:</b> ${checkOut.toDateString()}</li>
            <li><b>Guests:</b> ${guests || 1}</li>
            <li><b>Special Requests:</b> ${specialRequests || 'None'}</li>
          </ul>
          <p><b>Time:</b> ${new Date().toLocaleString()}</p>
          <p style="color:#34568B;">Let’s make their stay amazing! 🚀</p>
        </div>
      `
    };

    try {
      await Promise.all([
        transporter.sendMail(userMailOptions),
        transporter.sendMail(adminMailOptions)
      ]);
    } catch (err) {
      console.error('Booking email error:', err);
    }

    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });

  } catch (err) {
    console.error('Resort booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
  
  router.post('/availability', async (req, res) => {
    try {
      const { propertyId, checkInDate, checkOutDate } = req.body;
  
      if (!propertyId || !checkInDate || !checkOutDate) {
        return res.status(400).json({ success: false, message: 'propertyId, checkInDate and checkOutDate are required' });
      }
  
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
  
      if (checkOut <= checkIn) {
        return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
      }
  
      // Verify property exists
      const property = await ResortProperty.findById(propertyId);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  
      // Fetch all rooms in this property
      const rooms = await ResortRoom.find({ property: propertyId }).lean();
  
      const availability = [];
  
      for (const room of rooms) {
        // Check overlapping bookings for this room
        const overlappingBooking = await ResortBooking.findOne({
          room: room._id,
          $or: [
            { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
          ]
        });
  
        availability.push({
          ...room,
          available: !overlappingBooking
        });
      }
  
      res.json({
        success: true,
        property: { _id: property._id, name: property.name },
        checkInDate,
        checkOutDate,
        rooms: availability
      });
  
    } catch (err) {
      console.error('Resort availability error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

// DELETE /resort/booking/:id - Delete a resort booking by ID
router.delete('/deleteResortbooking/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await ResortBooking.findByIdAndDelete(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Resort booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting resort booking:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/update-status', async (req, res) => {
  try {
    const { bookingId, bookingStatus } = req.body;
    if (!bookingId || !bookingStatus) {
      return res.status(400).json({ success: false, message: 'bookingId and bookingStatus are required' });
    }

    const allowedStatuses = ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];
    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid bookingStatus value' });
    }

    const booking = await ResortBooking.findById(bookingId).populate('property');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    let subject = '';
    let content = '';
    const userName = booking.fullName || 'Guest';
    const resortName = booking.property?.name || 'Resort';

    switch(bookingStatus) {
      case 'Pending':
        subject = "Your Booking is Pending – " + resortName;
        content = `Hello ${userName},<br>
        Your booking at <b>${resortName}</b> is currently <b>PENDING</b>. We’ve received your request and our team will confirm it shortly!<br>
        We’ll notify you as soon as it is updated. For queries, reply to this email.<br>
        <br>Thank you for choosing us!`;
        break;
      case 'Confirmed':
        subject = "Booking Confirmed! Get Ready for Your Stay at " + resortName;
        content = `Hi ${userName},<br>
        Great news! Your stay at <b>${resortName}</b> is <b>CONFIRMED</b>.<br>
        We look forward to hosting you. Welcome to a memorable experience!<br>
        For assistance, reply to this email.<br>
        <br>See you soon!`;
        break;
      case 'CheckedIn':
        subject = "Welcome to " + resortName + " – Enjoy Your Stay!";
        content = `Dear ${userName},<br>
        We’re delighted to welcome you. You’ve <b>checked in</b> at <b>${resortName}</b>!<br>
        If you need anything, our team is here for you. Relax and have a wonderful stay.<br>
        <br>Warm regards,`;
        break;
      case 'CheckedOut':
        subject = "Thanks for Staying with Us – Checked Out Successfully";
        content = `Dear ${userName},<br>
        Hope you had a fantastic time at <b>${resortName}</b>!<br>
        You’ve <b>checked out</b> successfully. We’d love to host you again soon.<br>
        <br>Safe travels!`;
        break;
      case 'Cancelled':
        subject = "Booking Cancelled – " + resortName;
        content = `Hi ${userName},<br>
        Your booking at <b>${resortName}</b> has been <b>CANCELLED</b> as requested.<br>
        If you wish to rebook or need any help, just let us know.<br>
        <br>We hope to see you in the future!`;
        break;
      default:
        subject = "Booking Status Update";
        content = `Your booking status at ${resortName} was updated to <b>${bookingStatus}</b>. For details, please contact support.`;
        break;
    }

    if (booking.email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ashif.india91@gmail.com',
          pass: 'ycxi jbrb ibcz nvpn'
        }
      });

      await transporter.sendMail({
        from: `"Transha Stayss" <ashif.india91@gmail.com>`,
        to: booking.email,
        subject,
        html: content
      });
    }

    res.json({ success: true, message: 'Booking status updated and user notified', booking });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE ResortRoom
router.post('/room', upload.array('images'), async (req, res) => {
  try {
    const {
      property,
      roomNumber,
      roomType,
      capacity,
      pricePerNight,
      description,
      amenities,
      name,
      bedType,
      maxOccupants,
      extraBedPrice
    } = req.body;

    // Validate property
    if (!property) return res.status(400).json({ success: false, message: 'property is required' });

    // Normalize amenities
    let amenitiesArr = [];
    if (amenities) {
      if (Array.isArray(amenities)) {
        amenitiesArr = amenities.map(a => (typeof a === 'string' ? a.trim() : a));
      } else if (typeof amenities === 'string') {
        amenitiesArr = amenities.split(',').map(a => a.trim()).filter(Boolean);
      }
    }

    // Handle image uploads from Cloudinary
    let imagesArr = [];
    if (req.files && req.files.length > 0) {
      imagesArr = req.files.map(file => file.path);
    } else if (req.body.images) {
      // fallback: Accept comma-separated string or array of image URLs
      if (Array.isArray(req.body.images)) imagesArr = req.body.images;
      else if (typeof req.body.images === 'string') imagesArr = req.body.images.split(',').map(s => s.trim()).filter(Boolean);
    }

    const room = new ResortRoom({
      property,
      roomNumber,
      roomType,
      capacity,
      pricePerNight,
      description,
      name,
      bedType,
      maxOccupants,
      extraBedPrice,
      amenities: amenitiesArr,
      images: imagesArr
    });
    await room.save();

    // Optionally, update totalRooms on ResortProperty
    await ResortProperty.findByIdAndUpdate(property, { $inc: { totalRooms: 1 } });

    res.status(201).json({ success: true, message: 'Room created', room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Failed to create room', error: error.message });
  }
});

// EDIT ResortRoom
router.put('/room/:id', upload.array('images'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      roomNumber,
      roomType,
      capacity,
      pricePerNight,
      description,
      amenities,
      bedType,
      name,
      isAvailable,
      status,
      maxOccupants,
      extraBedPrice
    } = req.body;

    // Normalize amenities
    let amenitiesArr;
    if (amenities !== undefined) {
      if (Array.isArray(amenities)) {
        amenitiesArr = amenities.map(a => (typeof a === 'string' ? a.trim() : a));
      } else if (typeof amenities === 'string') {
        amenitiesArr = amenities.split(',').map(a => a.trim()).filter(Boolean);
      }
    }

    const room = await ResortRoom.findById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // If new images are uploaded, update them and optionally remove old ones from Cloudinary.
    let newImagesArr = [];
    if (req.files && req.files.length > 0) {
      newImagesArr = req.files.map(file => file.path);

      // Optional: Remove old images from Cloudinary
      if (room.images && room.images.length > 0) {
        for (const img of room.images) {
          try {
            const publicId = img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`Transha-Stays/${publicId}`);
          } catch (err) {
            console.log('Error deleting old image:', err.message);
          }
        }
      }
    } else if (req.body.images !== undefined) {
      if (Array.isArray(req.body.images)) newImagesArr = req.body.images;
      else if (typeof req.body.images === 'string') newImagesArr = req.body.images.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (roomNumber !== undefined) room.roomNumber = roomNumber;
    if (roomType !== undefined) room.roomType = roomType;
    if (capacity !== undefined) room.capacity = capacity;
    if (pricePerNight !== undefined) room.pricePerNight = pricePerNight;
    if (description !== undefined) room.description = description;
    if (amenitiesArr !== undefined) room.amenities = amenitiesArr;
    if (name !== undefined) room.name = name;
    if (bedType !== undefined) room.bedType = bedType;
    if (maxOccupants !== undefined) room.maxOccupants = maxOccupants;
    if (extraBedPrice !== undefined) room.extraBedPrice = extraBedPrice;
    if (newImagesArr.length > 0) room.images = newImagesArr;
    if (isAvailable !== undefined) room.isAvailable = isAvailable;
    if (status !== undefined) room.status = status;

    await room.save();

    res.status(200).json({ success: true, message: 'Room updated', room });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: 'Failed to update room', error: error.message });
  }
});

// DELETE ResortRoom (and delete images from Cloudinary)
router.delete('/room/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const room = await ResortRoom.findById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // Delete images from Cloudinary
    if (room.images && room.images.length > 0) {
      for (const img of room.images) {
        try {
          const publicId = img.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`Transha-Stays/${publicId}`);
        } catch (err) {
          console.log('Error deleting image:', err.message);
        }
      }
    }

    await room.deleteOne();
    // Optionally, update totalRooms on ResortProperty
    await ResortProperty.findByIdAndUpdate(room.property, { $inc: { totalRooms: -1 } });

    res.status(200).json({ success: true, message: 'Room deleted' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Failed to delete room', error: error.message });
  }
});

// TOGGLE ROOM STATUS (Available <-> Unavailable)
router.patch('/room/:id/toggle', async (req, res) => {
    console.log(req.body);
    
  try {
    const { id } = req.params;
    const { toggle } = req.body;

    const room = await ResortRoom.findById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (typeof toggle === 'boolean') {
      room.isAvailable = toggle;
    } else {
      room.isAvailable = !room.isAvailable;
    }
    await room.save();

    res.status(200).json({
      success: true,
      message: `Room is now ${room.isAvailable ? 'Available' : 'Unavailable'}`,
      isAvailable: room.isAvailable
    });
  } catch (error) {
    console.error('Error toggling room status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle room status', error: error.message });
  }
});

// (OPTIONAL) GET all rooms for a property
router.get('/property/:propertyId/rooms', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const rooms = await ResortRoom.find({ property: propertyId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error('Error getting property rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to get rooms', error: error.message });
  }
});

// (OPTIONAL) GET single room
router.get('/room/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const room = await ResortRoom.findById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ success: false, message: 'Failed to get room', error: error.message });
  }
});

router.post('/admin-booking/resort/update-status', async (req, res) => {
    try {
      const { bookingId, bookingStatus } = req.body;
  
      const booking = await ResortBooking.findByIdAndUpdate(
        bookingId,
        { bookingStatus },
        { new: true }
      );
  
      res.json({ success: true, data: booking });
    } catch (err) {
      console.error('Resort booking status update error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
  


module.exports = router;

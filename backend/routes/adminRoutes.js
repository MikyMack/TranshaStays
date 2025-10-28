const express = require('express');
const Banner = require("../models/Banner")
const mainbanner = require("../models/MainBanner")
const app = express();
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');


const authMiddleware = require('../middleware/auth'); 
const authController =require('../controllers/authController');
const PayingGuest = require('../models/PayingGuest');

const PremiumApartmentBooking = require('../models/PremiumApartmentBooking');


// Admin Login Page
app.get('/login', (req, res) => {
    res.render('admin-login', { title: 'Admin Login' });
});
app.get('/logout', authController.logout);

app.get('/dashboard', authMiddleware, async (req, res) => {
    try {
     
        res.render('admin-dashboard', { title: 'Admin Dashboard'});
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});


app.get("/admin-booking", authMiddleware, async (req, res) => {
  try {
    const bookings = await PremiumApartmentBooking.find()
      .populate({
        path: "apartment",
        select: "propertyTitle location apartments",
      })
      .sort({ createdAt: -1 })
      .lean();

    const detailedBookings = bookings.map((booking) => {
      const apartment = booking.apartment;

      if (!apartment) {
        booking.propertyName = "N/A";
      } else {
        booking.propertyName = apartment.propertyTitle || "Unnamed Property";
      }

      // ✅ PUT THE NEW CODE HERE ↓
      if (booking.bookingType === "Full Apartment" && booking.fullApartmentId) {
        const fullApartment = apartment?.apartments?.find(
          (apt) => apt._id?.toString() === booking.fullApartmentId?.toString()
        );

        if (fullApartment) {
          booking.fullApartmentDetails = {
            name: fullApartment.apartmentName || fullApartment.name || "Unnamed Apartment",
            pricePerNight: fullApartment.pricePerNight || 0,
            totalRooms: fullApartment.rooms?.length || 0,
            rooms: fullApartment.rooms || [],
          };
        } else {
          booking.fullApartmentDetails = null;
        }
      }

      // 🚪 If room(s)
      if (booking.bookingType === "Room" && booking.roomIds?.length > 0) {
        const allRooms = [
          ...(apartment.rooms || []),
          ...(apartment.apartments?.flatMap((a) => a.rooms) || []),
        ];

        booking.roomDetails = allRooms.filter((room) =>
          booking.roomIds.map((id) => id.toString()).includes(room._id.toString())
        );
      }

      return booking;
    });

    res.render("admin-bookings", { bookings: detailedBookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).send("Server Error");
  }
});



app.get('/admin-resort', authMiddleware, async (req, res) => {
  try {
   
    res.render('admin-resort');
  } catch (err) {
    console.error('Error fetching resorts or rooms:', err);
    res.status(500).send('Server Error');
  }
});
app.get('/admin-pg', authMiddleware, async (req, res) => {
  try {
    const payingGuests = await PayingGuest.find().sort({ createdAt: -1 });
    res.render('admin-pg', { payingGuests });
  } catch (err) {
    console.error('Error fetching PG properties:', err);
    res.status(500).send('Server Error');
  }
});


app.get('/admin-blogs',authMiddleware, (req, res) => {
  res.render('admin-blogs');
});
app.get('/admin-testimonials',authMiddleware, (req, res) => {
  res.render('admin-testimonials');
});
app.get('/admin-banner', authMiddleware, async (req, res) => {
    try {

        const banners = await Banner.find(); 

        res.render('admin-banner', { title: 'Admin banners', banners });
    } catch (error) {
        console.error("Error fetching banner:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.get('/admin-mainbanner', authMiddleware, async (req, res) => {
  try {
      const banners = await mainbanner.find();
      res.render('main-banner', { title: 'Manage Banners', banners }); 
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error retrieving banners' });
  }
});



module.exports = app;
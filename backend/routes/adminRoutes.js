const express = require('express');
const Banner = require("../models/Banner")
const mainbanner = require("../models/MainBanner")
const app = express();
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const ResortRoom = require('../models/resort/ResortRoom');

const authMiddleware = require('../middleware/auth'); 
const authController =require('../controllers/authController');
const ResortProperty = require('../models/resort/ResortProperty');
const PgProperty = require('../models/pg/PgProperty');
const PgLease = require('../models/pg/PgLease');
const ResortBooking = require('../models/resort/ResortBooking');

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

app.get('/admin-booking', authMiddleware, async (req, res) => {
  try {
   
    const bookingStatus = req.query.status; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {};
    if (bookingStatus && ['Pending','Confirmed','CheckedIn','CheckedOut','Cancelled'].includes(bookingStatus)) {
      filter.bookingStatus = bookingStatus;
    }

    const resortBookingQuery = ResortBooking.find(filter)
      .populate('property', 'name city')
      .populate('room', 'roomNumber roomType pricePerNight')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const [resortBookings, totalResortBookings] = await Promise.all([
      resortBookingQuery.exec(),
      ResortBooking.countDocuments(filter)
    ]);

    const leaseStatus = req.query.leaseStatus; 
    const leasePage = parseInt(req.query.leasePage) || 1;
    const leaseLimit = parseInt(req.query.leaseLimit) || 10;

    const pgLeasesFilter = {};

    const pgLeasesQuery = PgLease.find(pgLeasesFilter)
      .populate({
        path: 'tenant',
        select: 'name phone email'
      })
      .populate({
        path: 'property',
        select: 'name city'
      })
      .populate({
        path: 'room',
        select: 'roomNumber sharingType'
      })
      .populate({
        path: 'bed',
        select: 'bedNumber pricePerMonth'
      })
      .sort({ createdAt: -1 })
      .skip((leasePage - 1) * leaseLimit)
      .limit(leaseLimit);

    const [pgLeases, totalPgLeases] = await Promise.all([
      pgLeasesQuery.exec(),
      PgLease.countDocuments(pgLeasesFilter)
    ]);

    res.render('admin-bookings', {
      resortBookings,
      resortBookingsTotal: totalResortBookings,
      resortBookingsPage: page,
      resortBookingsPages: Math.ceil(totalResortBookings / limit),
      resortBookingsLimit: limit,
      bookingStatusFilter: bookingStatus || '',

      pgLeases,
      pgLeasesTotal: totalPgLeases,
      pgLeasesPage: leasePage,
      pgLeasesPages: Math.ceil(totalPgLeases / leaseLimit),
      pgLeasesLimit: leaseLimit,
      leaseStatusFilter: leaseStatus || ''
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).send('Server Error');
  }
});



app.get('/admin-resort', authMiddleware, async (req, res) => {
  try {
    const resorts = await ResortProperty.find()
    .populate('rooms')
    .sort({ createdAt: -1 });
    res.render('admin-resort', { resorts });
  } catch (err) {
    console.error('Error fetching resorts or rooms:', err);
    res.status(500).send('Server Error');
  }
});
app.get('/admin-pg', authMiddleware, async (req, res) => {
  try {
    const properties = await PgProperty.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'floors',        
        populate: {
          path: 'allRooms',    
          populate: { path: 'allBeds' } 
        }
      });

    res.render('admin-pg', { properties });
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
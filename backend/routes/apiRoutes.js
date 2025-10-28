const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const bannerController = require('../controllers/bannerController');
const testimonialController = require('../controllers/testimonialController');
  const mainBannerCtrl = require('../controllers/mainBannerController');
  const pgController = require('../controllers/pgController');
const upload = require('../utils/multer');
const {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
  deletePremiumApartmentBooking
} = require("../controllers/premiumApartmentBookingController");

router.get('/main', mainBannerCtrl.getAll);
router.post('/main', upload.single('image'), mainBannerCtrl.create);
router.put('/main/:id', upload.single('image'), mainBannerCtrl.update);
router.delete('/main/:id', mainBannerCtrl.delete);
router.patch('/main/:id/toggle', mainBannerCtrl.toggleStatus);

// 📰 Blogs Routes
router.post('/admin-blogs', upload.single('image'), blogController.createBlog);
router.get('/get-admin-blogs', blogController.getAllBlogs);
router.get('/admin-blogs/:id', blogController.getBlogById);
router.put('/admin-blogs/:id', upload.single('image'), blogController.updateBlog);
router.delete('/admin-blogs/:id', blogController.deleteBlog);

// 🎭 Banners Routes
router.post('/banners', upload.array('images', 5), bannerController.createBanner);
router.get('/banners', bannerController.getAllBanners);
router.get('/banners/:id', bannerController.getBannerById);
router.put('/banners/:id', upload.array('images', 5), bannerController.updateBanner);
router.delete('/banners/:id', bannerController.deleteBanner);
router.patch('/banners/:id/status', bannerController.updateBannerStatus);

// Testimonials
router.post('/admin-testimonials', upload.single('image'), testimonialController.createTestimonial);
router.get('/testimonials', testimonialController.listTestimonials);
router.get('/admin-testimonials/:id', testimonialController.getTestimonialForEdit);
router.put('/admin-testimonials/:id', upload.single('image'), testimonialController.updateTestimonial);
router.delete('/admin-testimonials/:id', testimonialController.deleteTestimonial);
router.patch('/admin-testimonials/toggle-status/:id', testimonialController.toggleTestimonialStatus);


  // CREATE booking
router.post("/premium-apartment-booking", createBooking);
router.delete("/premium-apartment-booking", deletePremiumApartmentBooking);

// GET all bookings
router.get("/premium-apartment-booking", listBookings);

// GET single booking
router.get("/premium-apartment-booking/:id", getBooking);

// CANCEL booking
router.put("/premium-apartment-booking/:id/cancel", cancelBooking);

// UPDATE booking status
router.put("/premium-apartment-booking/:id/status", updateBookingStatus);
  
// Create PG
router.post("/create-pg", upload.array("images", 10), pgController.createPG);

// Update PG
router.put("/update-pg/:id", upload.array("images", 10), pgController.updatePG);

// Delete PG
router.delete("/delete-pg/:id", pgController.deletePG);

// Update Availability
router.patch("/update-pg/:id/availability", pgController.updateAvailability);

module.exports = router;

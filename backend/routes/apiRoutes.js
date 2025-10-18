const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const bannerController = require('../controllers/bannerController');
const testimonialController = require('../controllers/testimonialController');
const mainBannerCtrl = require('../controllers/mainBannerController');
const upload = require('../utils/multer');
const { sendEmailToAdmin } = require('../utils/email');

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

// routes/apiRoutes.js
router.post('/book', async (req, res) => {
    try {
      const booking = req.body;
  
      await sendEmailToAdmin(booking);
      
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Notification failed' });
    }
  });
  

module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Blog = require('../models/Blog');
const Testimonial = require('../models/Testimonial');
const MainBanner = require('../models/MainBanner');
const PremiumApartment = require('../models/PremiumApartment');
const PayingGuest = require('../models/PayingGuest');


router.get('/', async (req, res) => {
    try {
      const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 }).lean();

      const blogs = await Blog.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      const mainBanners = await MainBanner.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      const premiumApartments = await PremiumApartment.find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();

      const payingGuest = await PayingGuest.find()
        .sort({ createdAt: -1 }).limit(16)
        .lean();

      res.render('index', {
        title: 'Home',
        testimonials,
        blogs,
        mainBanners,
        premiumApartments,
        payingGuest
      });

    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading Home page data');
    }
});
  

router.get('/about', async (req, res) => {
    try {
      const premiumApartments = await PremiumApartment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
        const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 }).lean();

        res.render('about', {
            title: 'About us',premiumApartments , testimonials
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading about page data');
    }
});
router.get('/spa-wellness', async (req, res) => {
    try {
      const premiumApartments = await PremiumApartment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
        res.render('spa-wellness', {
            title: 'spa-wellness',premiumApartments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading spa-wellness page data');
    }
});
router.get('/pg', async (req, res) => {
    try {
        const premiumApartments = await PremiumApartment.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        // Pagination parameters
        let { page = 1, limit = 12 } = req.query;
        page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
        limit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 12;

        // Count total PGs
        const totalPGs = await PayingGuest.countDocuments();
        const totalPages = Math.ceil(totalPGs / limit);

        // Fetch paginated PGs
        const payingGuest = await PayingGuest.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.render('pg', {
            title: 'pg',
            premiumApartments,
            payingGuest,
            pagination: {
                page,
                limit,
                totalPages,
                totalPGs,
                hasPrev: page > 1,
                hasNext: page < totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading pg page data');
    }
});

router.get('/blogs', async (req, res) => {
    try {
      const premiumApartments = await PremiumApartment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
        const { page = 1, limit = 10 } = req.query;

        // Fetch blogs with pagination
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const totalBlogs = await Blog.countDocuments();

        res.render('blogs', {
            title: 'Blogs',
            blogs: blogs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalBlogs / limit), premiumApartments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading blogs page data');
    }
});

router.get('/contact', async (req, res) => {
    try {
      const premiumApartments = await PremiumApartment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
        res.render('contact', {
            title: 'Contact Us',premiumApartments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading contact page data');
    }
});
router.get('/resorts', async (req, res) => {
    try {
      const premiumApartments = await PremiumApartment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

        res.render('resorts', {
            title: 'resorts',premiumApartments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading resorts page data');
    }
});
router.get('/near-by-locations', async (req, res) => {
    try {
      const premiumApartments = await PremiumApartment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
        res.render('near-by-locations', {
            title: 'near-by-locations',premiumApartments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading near-by-locations page data');
    }
});

// Package details page
router.get('/apartmentDetails/:title', async (req, res) => {
    try {
        const slugOrName = decodeURIComponent(req.params.title);

        const premiumApartment = await PremiumApartment.findOne({
            $or: [
                { slug: slugOrName },
                { propertyTitle: slugOrName }
            ],
            isActive: true
        }).lean();

        if (!premiumApartment) {
            return res.status(404).send('Premium Apartment not found');
        }

        const premiumApartments = await PremiumApartment.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        res.render('resortDetails', {
            title: premiumApartment.metaTitle || premiumApartment.propertyTitle || 'Premium Apartment Details',
            premiumApartment,
            premiumApartments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading premiumApartmentDetails page data');
    }
});


router.get('/blogDetail/:title', async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title);
        const blog = await Blog.findOne({ title: title }).lean();

        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        const relatedBlogs = await Blog.find({
            _id: { $ne: blog._id },
            metaKeywords: { $in: blog.metaKeywords }
        }).limit(3).lean();

        const premiumApartments = await PremiumApartment.find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();

        res.render('blogdetails', {
            title: blog.metaTitle || blog.title || 'blogDetails',
            blog,
            relatedBlogs,
            premiumApartments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading blog detail page data');
    }
});







module.exports = router;
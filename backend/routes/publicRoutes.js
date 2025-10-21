const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Blog = require('../models/Blog');
const Testimonial = require('../models/Testimonial');
const MainBanner = require('../models/MainBanner');
const ResortProperty = require('../models/resort/ResortProperty');
const PgProperty = require('../models/pg/PgProperty');
const PgFloor = require('../models/pg/PgFloor');
const PgRoom = require('../models/pg/PgRoom');
const PgBed = require('../models/pg/PgBed');

router.get('/', async (req, res) => {
    try {
      const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();

      const pgs = await PgProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate({
          path: 'floors',
          populate: {
            path: 'allRooms',
            model: 'PgRoom'
          }
        })
        .lean();

      const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 }).lean();

      const blogs = await Blog.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      res.render('index', {
        title: 'Home',
        resorts,
        pgs,
        testimonials,
        blogs
      });

    } catch (error) {
      console.error(error);
      res.status(500).send('Error loading Home page data');
    }
  });
  

router.get('/about', async (req, res) => {
    try {
        const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();
        const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 }).lean();

        res.render('about', {
            title: 'About us',resorts , testimonials
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading about page data');
    }
});
router.get('/spa-wellness', async (req, res) => {
    try {
        const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();
        res.render('spa-wellness', {
            title: 'spa-wellness',resorts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading spa-wellness page data');
    }
});
router.get('/pg', async (req, res) => {
    try {
        const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();

      const pgs = await PgProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate({
          path: 'floors',
          populate: {
            path: 'allRooms',
            model: 'PgRoom'
          }
        })
        .lean();
        res.render('pg', {
            title: 'pg',pgs,resorts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading pg page data');
    }
});
router.get('/pgDetails/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
  
      // Find property and populate everything (floors → rooms → beds)
      const pg = await PgProperty.findOne({ slug, isActive: true })
        .populate({
          path: 'floors',
          options: { sort: { floorNumber: 1 } }, // ascending order
          populate: {
            path: 'allRooms',
            options: { sort: { createdAt: 1 } },
            populate: {
              path: 'allBeds',
              model: 'PgBed',
              options: { sort: { bedNumber: 1 } }
            }
          }
        })
        .lean();
  
      if (!pg) {
        return res.status(404).send('PG not found');
      }
  
      const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();
  
      res.render('pgDetails', {
        title: `${pg.name} – PG Details`,
        pg,
        resorts
      });
    } catch (error) {
      console.error('Error loading PG details:', error);
      res.status(500).send('Error loading PG details');
    }
  });
router.get('/blogs', async (req, res) => {
    try {
        const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
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
            totalPages: Math.ceil(totalBlogs / limit), resorts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading blogs page data');
    }
});

router.get('/contact', async (req, res) => {
    try {
        const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();
        res.render('contact', {
            title: 'Contact Us',resorts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading contact page data');
    }
});
router.get('/resorts', async (req, res) => {
    try {
        const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();

        res.render('resorts', {
            title: 'resorts',resorts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading resorts page data');
    }
});
router.get('/near-by-locations', async (req, res) => {
    try {
        const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();
        res.render('near-by-locations', {
            title: 'near-by-locations',resorts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading near-by-locations page data');
    }
});

// Package details page
router.get('/resortDetails/:title', async (req, res) => {
    try {
        const slugOrName = decodeURIComponent(req.params.title);
        const resort = await ResortProperty.findOne({
            $or: [
                { slug: slugOrName },
                { name: slugOrName }
            ],
            isActive: true
        })
        .populate('rooms')
        .lean();

        if (!resort) {
            return res.status(404).send('Resort not found');
        }

        const resorts = await ResortProperty.find({ isActive: true })
            .sort({ createdAt: -1 })
            .populate('rooms')
            .lean();

        res.render('resortDetails', {
            title: resort.metaTitle || resort.name || 'Resort Details',
            resort,
            resorts 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading resortDetails page data');
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

        const resorts = await ResortProperty.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('rooms')
        .lean();

        res.render('blogDetails', {
            title: blog.metaTitle || blog.title || 'blogDetails',
            blog,
            relatedBlogs,
            resorts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading blog detail page data');
    }
});







module.exports = router;
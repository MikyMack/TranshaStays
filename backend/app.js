require('dotenv').config({ path: '.env' });
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
// Import Routes
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const apartmentsRoutes = require('./routes/premiumApartmentRoutes');
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, '../assets')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(methodOverride('_method'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60 * 24 * 7 
  })
}));

// Use Routes
app.use('/', publicRoutes);
app.use('/', adminRoutes); 
app.use('/api/auth', authRoutes); 
app.use('/', apiRoutes); 
app.use('/apartments', apartmentsRoutes); 

app.use(async (req, res) => {
    res.status(404).render('errorPage', { title: 'Page Not Found' });
});
module.exports = app;

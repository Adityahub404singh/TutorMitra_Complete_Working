require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path'); // ⭐ bas ye add kiya

const app = express();
app.use(cors());
app.use(express.json());

// ⭐⭐ For file/image downloads, safest universal way ⭐⭐
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // ✔️ this is the fix!

// Session and Passport middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Import routes
const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutor');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user'); // ⭐⭐

app.use('/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/booking', bookingRoutes);
app.use('/payment', paymentRoutes);
app.use('/review', reviewRoutes);
app.use('/api/user', userRoutes); // ⭐⭐

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Import passport config
require('./config/passport');

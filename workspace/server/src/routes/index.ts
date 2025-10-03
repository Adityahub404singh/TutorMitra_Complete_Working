import express from 'express';
import courseRoutes from './Courses.js';  // sahi path verify karen

const app = express();

// Baaki middlewares jaise body-parser, cors, etc.

// Course routes ka use
app.use('/api/courses', courseRoutes);

// Baaki routes

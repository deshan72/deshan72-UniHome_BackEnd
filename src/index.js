// src/index.js
import express from "express";
import accommodationRoutes from './routes/accommodation/accommodationRoutes.js';


const app = express();

// ==================== ROUTES ====================
app.use('/api/accommodations', accommodationRoutes);




// Middleware to parse JSON
app.use(express.json());

export default app;  // Export 'app' so it can be used in server.js
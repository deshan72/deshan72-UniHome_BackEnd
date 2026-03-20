// server.js
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import app from "./src/index.js";  // Import 'app' from index.js


import accommodationRoutes from './src/routes/accommodation/accommodationRoutes.js';



dotenv.config();  // Load environment variables from .env

// Connect to the database
connectDB();



const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ==================== ROUTES ====================
app.use('/api/accommodations', accommodationRoutes);
// server.js
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import app from "./src/index.js";  // Import 'app' from index.js


import accommodationRoutes from './src/routes/accommodation/accommodationRoutes.js';
import uploadRoutes from './src/routes/accommodation/uploadRoutes.js';



dotenv.config();  // Load environment variables from .env

// Connect to the database
connectDB();



const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ==================== ROUTES ====================
// app.use('/api/auth', authRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/upload', uploadRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/users', userRoutes);

// ==================== START SERVER ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

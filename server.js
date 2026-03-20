// server.js
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import app from "./src/index.js";  // Import 'app' from index.js

import accommodationRoutes from './routes/accommodationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();  // Load environment variables from .env

// Connect to the database
connectDB();

// ==================== ROUTES ====================
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/upload', uploadRoutes);


// ==================== START SERVER ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
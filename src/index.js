// src/index.js
import express from "express";
import accommodationRoutes from './routes/accommodation/accommodationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

// ==================== ROUTES ====================
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/upload', uploadRoutes);



// ==================== START SERVER ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Middleware to parse JSON
app.use(express.json());

export default app;  // Export 'app' so it can be used in server.js
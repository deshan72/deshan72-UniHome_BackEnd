// server.js
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import app from "./src/index.js";  // Import 'app' from index.js

dotenv.config();  // Load environment variables from .env

// Connect to the database
connectDB();

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
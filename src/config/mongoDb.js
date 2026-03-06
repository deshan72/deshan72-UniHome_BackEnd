import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔍 Attempting to connect with URI:", process.env.MONGO_URI ? "URI found" : "URI is undefined");
    
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Database connected:", conn.connection.host);
  } catch (error) {
    console.log("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
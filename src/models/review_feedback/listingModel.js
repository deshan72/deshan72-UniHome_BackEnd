import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({

  listingId: {
    type: String,
    required: true,
    unique: true
  },

  averageRating: {
    type: Number,
    default: 0
  },

  sentiment: {
    type: String,
    enum: ["Mostly Positive", "Neutral", "Mostly Negative"],
    default: "Neutral"
  },

  aiSummary: {
    type: String,
    default: ""
  },

  totalReviews: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("Listing", listingSchema);
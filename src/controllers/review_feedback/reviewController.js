import Review from "../../models/review_feedback/reviewModel.js";
import Listing from "../../models/review_feedback/listingModel.js";
import axios from "axios";

/* ================= HELPER FUNCTION ================= */

const regenerateSummary = async (listingId) => {

  const reviews = await Review.find({ listingId });

  if (!reviews.length) {

    await Listing.findOneAndUpdate(
      { listingId },
      {
        listingId,
        averageRating: 0,
        sentiment: "Neutral",
        aiSummary: "No reviews yet",
        totalReviews: 0
      },
      { upsert: true }
    );

    return;
  }

  const comments = reviews.map(r => r.comment).join("\n");

  const response = await axios.post(
    "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6",
    {
      inputs: comments.slice(0,2000)
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  const summary =
    response.data?.[0]?.summary_text ||
    response.data?.generated_text ||
    "Summary could not be generated";

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  let sentiment = "Neutral";

  if (avgRating >= 3) sentiment = "Mostly Positive";
  else sentiment = "Mostly Negative";

  await Listing.findOneAndUpdate(
    { listingId },
    {
      listingId,
      averageRating: avgRating,
      sentiment,
      aiSummary: summary,
      totalReviews: reviews.length
    },
    { upsert: true }
  );

};

/* ================= CREATE REVIEW ================= */

export const createReview = async (req, res) => {

  try {

    const review = await Review.create(req.body);

    await regenerateSummary(review.listingId);

    res.json(review);

  } catch (error) {

    res.status(500).json({
      message: "Failed to create review"
    });

  }

};

/* ================= READ REVIEWS ================= */

export const getReviewsByListing = async (req, res) => {

  try {

    const { listingId } = req.params;

    const reviews = await Review.find({ listingId });

    res.json(reviews);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch reviews"
    });

  }

};

/* ================= UPDATE REVIEW ================= */

export const updateReview = async (req, res) => {

  try {

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    await regenerateSummary(review.listingId);

    res.json({
      message: "Review updated successfully",
      review
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to update review"
    });

  }

};

/* ================= DELETE REVIEW ================= */

export const deleteReview = async (req, res) => {

  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    await regenerateSummary(review.listingId);

    res.json({
      message: "Review deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to delete review"
    });

  }

};

/* ================= GENERATE SUMMARY MANUALLY ================= */

export const generateReviewSummary = async (req, res) => {

  try {

    const { listingId } = req.params;

    await regenerateSummary(listingId);

    const listing = await Listing.findOne({ listingId });

    res.json(listing);

  } catch (error) {

    res.status(500).json({
      message: "AI summary generation failed"
    });

  }

};
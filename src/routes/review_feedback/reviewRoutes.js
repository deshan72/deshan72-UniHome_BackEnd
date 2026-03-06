import express from "express";

import {
  createReview,
  getReviewsByListing,
  updateReview,
  deleteReview,
  generateReviewSummary
} from "../../controllers/review_feedback/reviewController.js";

const router = express.Router();

/* CREATE REVIEW */
router.post("/review", createReview);

/* READ REVIEWS BY LISTING */
router.get("/review/:listingId", getReviewsByListing);

/* UPDATE REVIEW */
router.put("/review/:id", updateReview);

/* DELETE REVIEW */
router.delete("/review/:id", deleteReview);

/* GENERATE AI SUMMARY */
router.post("/generate-summary/:listingId", generateReviewSummary);

export default router;
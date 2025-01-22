const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require('../schemas');
const { isLoggedIn, isReviewAuthor } = require('../middleware');
const review = require('../controllers/reviews');

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((ele) => ele.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  isLoggedIn,
  validateReview,
  review.postReview
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  review.deleteReview
);

module.exports = router;

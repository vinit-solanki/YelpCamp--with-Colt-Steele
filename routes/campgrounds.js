const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
} = require("../middleware");
const campground = require("../controllers/campgrounds");
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.get("/", isLoggedIn, catchAsync(campground.index));
router.post(
  "/",
  isLoggedIn,
  upload.array('image'),
  validateCampground, 
  catchAsync(campground.postCampground)
);
router.get("/new", isLoggedIn, campground.getNewForm);
router.get("/:id", isLoggedIn, catchAsync(campground.getCampground));
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campground.getEditCampgroundForm)
);
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array('image'),
  validateCampground,
  catchAsync(campground.editCampground)
);
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campground.deleteCampground)
);

module.exports = router;

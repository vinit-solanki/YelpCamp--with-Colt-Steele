const express = require("express");
const multer = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const Campground = require("../models/campground");
const maptilerClient = require('@maptiler/client');
const upload = multer({ storage });

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function getCoordinates(location) {
  try {
      const fetch = (await import("node-fetch")).default; // Dynamic import for ESM module
      const apiKey = process.env.MAPTILER_API_KEY;
      const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${apiKey}`);
      const data = await response.json();
      console.log(data);      
      if (data && data.features && data.features.length > 0) {
          return data.features[0].geometry.coordinates; // Returns [lng, lat]
      } else {
          throw new Error("Invalid location, coordinates not found.");
      }
  } catch (error) {
      console.error("Error fetching geolocation:", error);
      return null; // Handle gracefully
  }
}


module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.getNewForm = (req, res) => {
  res.render("campgrounds/new", { camp: {} });
};

module.exports.getCampground = async (req, res) => {
  try {
    const camp = await Campground.findById(req.params.id)
      .populate("author") // Ensure campground author is populated
      .populate({
        path: "reviews",
        populate: { path: "author" }, // Ensure review authors are populated
      });

    if (!camp) {
      req.flash("error", "Campground not found!");
      return res.redirect("/campgrounds");
    }

    res.render("campgrounds/show", { camp });
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    res.redirect("/campgrounds");
  }
};


// Middleware to handle file uploads
module.exports.uploadImages = upload.array('image');

module.exports.postCampground = async (req, res) => {
  try {
      // Fetch coordinates from MapTiler
      const coordinates = await getCoordinates(req.body.camp.location);
      
      if (!coordinates) {
          req.flash("error", "Invalid location. Please try again.");
          return res.redirect("/campgrounds/new");
      }

      // Create new campground
      const newCampground = new Campground(req.body.camp);
      newCampground.geometry = { type: "Point", coordinates }; // Ensure proper GeoJSON format

      // Save to DB
      await newCampground.save();

      req.flash("success", "Successfully created a new campground!");
      res.redirect(`/campgrounds/${newCampground._id}`);
  } catch (error) {
      console.error("Error creating campground:", error);
      req.flash("error", "Something went wrong while creating the campground.");
      res.redirect("/campgrounds/new");
  }
};


module.exports.getEditCampgroundForm = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (!camp) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
};

module.exports.editCampground = async (req, res) => {
  try {
      const { id } = req.params;
      
      // Find and update basic campground data
      const campground = await Campground.findById(id);
      if (!campground) {
          throw new Error('Campground not found');
      }

      // Update basic info
      Object.assign(campground, req.body.camp);

      // Get new geocoding data if location changed
      if (req.body.camp.location) {
          const geoData = await maptilerClient.geocoding
              .forward(req.body.camp.location)
              .send();

          if (geoData.body.features && geoData.body.features.length > 0) {
              campground.geometry = {
                  type: 'Point',
                  coordinates: geoData.body.features[0].geometry.coordinates
              };
          } else {
              throw new Error('Location not found');
          }
      }

      // Handle new images
      if (req.files && req.files.length > 0) {
          const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
          campground.images.push(...imgs);
      }

      // Handle image deletion
      if (req.body.deleteImages) {
          for (let filename of req.body.deleteImages) {
              await cloudinary.uploader.destroy(filename);
          }
          await campground.updateOne({ 
              $pull: { images: { filename: { $in: req.body.deleteImages } } } 
          });
      }

      await campground.save();
      console.log("Updated campground geometry:", campground.geometry); // Debug log

      req.flash('success', 'Successfully updated campground!');
      res.redirect(`/campgrounds/${campground._id}`);
  } catch (error) {
      console.error("Error updating campground:", error);
      req.flash("error", "Failed to update campground: " + error.message);
      res.redirect(`/campgrounds/${req.params.id}/edit`);
  }
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findByIdAndDelete(id);
  if (!camp) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.redirect("/campgrounds");
};
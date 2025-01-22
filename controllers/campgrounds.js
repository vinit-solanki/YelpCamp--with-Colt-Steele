const express = require("express");
const Campground = require("../models/campground");
const campground = require("../controllers/campgrounds");

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};
module.exports.getNewForm = (req, res) => {
  res.render("campgrounds/new");
};
module.exports.getCampground = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  console.log(camp);
  if (!camp) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { camp });
};
module.exports.postCampground = async (req, res, next) => {
  try {
    const campground = new Campground(req.body.camp);
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
      }));    
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);    
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (error) {
    console.error("Error creating campground:", error);
    req.flash("error", "Failed to create campground: " + error.message);
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
    console.log(req.body);
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.camp });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...imgs);
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${camp._id}`)
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

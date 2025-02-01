const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/reviews');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Please log in first!');
    return res.redirect('/login');
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(ele => ele.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    req.flash('error', 'Campground not found!');
    return res.redirect('/campgrounds');
  }

  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You are not allowed to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash('error', 'Review not found!');
    return res.redirect(`/campgrounds/${id}`);
  }

  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};
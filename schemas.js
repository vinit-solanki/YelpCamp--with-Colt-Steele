const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required(),
      price: Joi.number().min(0).required(),
      // images: Joi.array().items(Joi.object({
      //   url: Joi.string(),
      //   filename: Joi.string()
      // })).required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
  });

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(0).max(5),
    body: Joi.string().required()
  }).required()
})
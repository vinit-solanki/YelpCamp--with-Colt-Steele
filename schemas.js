const Joi = require('joi');
const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const extension = (joi)=>({
  type: 'string',
  base: joi.string(),
  message: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHTML(value, {
          allowedTage: [],
          allowedAttributes: {},
        });
        if(clean !== value)
          return helpers.error('string.escapeHTML', { value })
      }
    }
  }
})


module.exports.campgroundSchema = Joi.object({
  camp: Joi.object({
    title: Joi.string().required(),
    location: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string().required(),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().required(),
        filename: Joi.string().required(),
      })
    ),
  }).required(),
});
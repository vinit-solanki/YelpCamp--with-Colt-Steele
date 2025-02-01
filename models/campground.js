const mongoose = require('mongoose');
const { Schema } = mongoose;

const CampgroundSchema = new Schema({
  title: String,
  location: String,
  price: Number,
  description: String,
  images: [
    {
      url: String,
      filename: String,
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  geometry: {
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
}
});
CampgroundSchema.index({ geometry: '2dsphere' });
module.exports = mongoose.model('Campground', CampgroundSchema);
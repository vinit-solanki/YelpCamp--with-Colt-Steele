const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Index route
router.get('/', campgrounds.index);

// Create new campground routes
router.get('/new', isLoggedIn, campgrounds.getNewForm);
router.post('/',
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    campgrounds.postCampground
);

// Show route
router.get('/:id', campgrounds.getCampground);

// Edit routes
router.get('/:id/edit',
    isLoggedIn,
    isAuthor,
    campgrounds.getEditCampgroundForm
);

router.put('/:id',
    isLoggedIn,
    isAuthor,
    upload.array('image'),
    validateCampground,
    campgrounds.editCampground
);

// Delete route
router.delete('/:id',
    isLoggedIn,
    isAuthor,
    campgrounds.deleteCampground
);

module.exports = router;
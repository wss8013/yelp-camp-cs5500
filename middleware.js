const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

const logger = require('./utils/logger');
const log = new logger("middleware");

function isLoggedInFunc(req, res, next) {
    if (!req.isAuthenticated()) {
        // store the url the user initially requesting
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

function validateCampgroundFunc(req, res, next) {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        log.error(`validate campground failed: ${msg}`);
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

function validateReviewFunc(req, res, next) {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

async function isAuthorFunc(req, res, next) {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        log.error(`author authorization failed, campground id: ${id}, user id: ${req.user._id}`);
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

async function isReviewAuthorFunc(req, res, next) {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        log.error(`author authorization failed, review id: ${reviewId}, user id: ${req.user._id}`);
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports = {
    isLoggedIn: isLoggedInFunc,
    validateCampground: validateCampgroundFunc,
    validateReview: validateReviewFunc,
    isAuthor: isAuthorFunc,
    isReviewAuthor: isReviewAuthorFunc,
}
const Campground = require('../models/campground');
const Review = require('../models/review');

const logger = require('../utils/logger');
const log = new logger("controllers/reviews");

async function createReviewFunc(req, res) {
    log.info(`create new review for campground ${req.params.id}, review detail: ${req.body.review}`);
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    review.body = review.body.replace(/\r\n/g, " ").replace("'"," ");
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

async function deleteReviewFunc(req, res) {
    const { id, reviewId } = req.params;
    log.info(`delete review ${reviewId} for campground ${id}`);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}

module.exports = {
    createReview: createReviewFunc,
    deleteReview: deleteReviewFunc
};

// module.exports.createReview = async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     review.author = req.user._id;
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     req.flash('success', 'Created new review!');
//     res.redirect(`/campgrounds/${campground._id}`);
// }

// module.exports.deleteReview = async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     req.flash('success', 'Successfully deleted review');
//     res.redirect(`/campgrounds/${id}`);
// }
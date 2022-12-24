const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const ExpressError = require('../utils/ExpressError');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
console.log(process.env.MAPBOX_TOKEN)
const geoCoder = mbxGeoCoding({accessToken: process.env.MAPBOX_TOKEN});

const logger = require('../utils/logger');
const log = new logger("controllers/campgrounds");
// const shuffle = require('array-shuffle');
async function indexFunc(req, res) {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

function renderNewFormFunc(req, res) {
    res.render('campgrounds/new');
}

async function createCampgroundFunc(req, res, next) {
    log.info("receive campground creation request");
    const geoRes = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    if (geoRes.body.features.length == 0) {
        throw new ExpressError("Cannot find input location", 400);
    }
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.geometry = geoRes.body.features[0].geometry;
    campground.description=campground.description.replace(/\r\n/g, " ").replace("'"," ")
    log.info(campground.description);
    campground.author = req.user._id;
    await campground.save();
    log.debug(campground);
    log.info(`create new campground by ${req.user._id}:`);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

async function showCampgroundFunc(req, res) {
    log.debug(`visit campground ${req.params.id}`);
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path:'author'
        }
    }).populate('author');;
    if (!campground) {
        log.error(`campground ${req.params.id} does not exist`);
        // flash for error when campground does not exist
        req.flash('error', 'Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

async function searchFunc (req, res)  {
    const searchTerm = req.query.q ? (req.query.q).match(/\w+/g).join(' ') : "";
    console.log(searchTerm);

    const campgrounds = 
        await Campground.find({
        $text: {
            $search: searchTerm
        }
    });

    res.render('campgrounds/search', {
        searchTerm,
        campgrounds
    });
}

async function renderEditFormFunc(req, res) {
    const { id } = req.params;
    log.debug(`request edit campground ${id}`);
    const campground = await Campground.findById(id)
    if (!campground) {
        log.error(`campground ${id} not found`);
        // flash for error when campground does not exist for editing
        req.flash('error', 'Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

async function updateCampgroundFunc(req, res) {
    const { id } = req.params;
    log.info(`update campground request`);
    log.info(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const geoRes = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    if (geoRes.body.features.length == 0) {
        throw new ExpressError("Cannot find input location", 400);
    }
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.geometry = geoRes.body.features[0].geometry;
    campground.description=campground.description.replace(/\r\n/g, " ").replace("'"," ");
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

async function deleteCampgroundFunc(req, res){
    const { id } = req.params;
    log.info(`delete campground ${id} request`);
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}

module.exports = {
    index: indexFunc,
    renderNewForm: renderNewFormFunc,
    createCampground: createCampgroundFunc,
    showCampground: showCampgroundFunc,
    renderEditForm: renderEditFormFunc,
    updateCampground: updateCampgroundFunc,
    deleteCampground: deleteCampgroundFunc,
    search: searchFunc
}

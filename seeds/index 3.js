if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const dbUrl = process.argv.length >= 3 && process.argv[2] == 'online'? process.env.DB_URL : 'mongodb://localhost:27017/yelp-camp';
const authorId = process.argv.length >= 3 && process.argv[2] == 'online'? '635784d51581d85a03e3f4f4' : '636c42d8d8cf5b7d45440589'; // update your local user id here
console.log(process.argv);
console.log(dbUrl);

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // replace with your own author id
            author: `${authorId}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "New campground in the woods!",
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images:[
                {
                    url: 'https://res.cloudinary.com/darmtuatc/image/upload/v1666837257/YelpCamp/ljdhy7wjxqb03ec3zigt.jpg',
                    filename: 'YelpCamp/ljdhy7wjxqb03ec3zigt.jpg',
                },
                {
                    url: 'https://res.cloudinary.com/darmtuatc/image/upload/v1666766158/YelpCamp/p96jmcn7aefxpce44cqd.jpg',
                    filename: 'YelpCamp/p96jmcn7aefxpce44cqd.jpg',
                }
                ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});

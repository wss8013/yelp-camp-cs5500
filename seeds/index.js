const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
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
            author: '6357278db7d42402af6056a7',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "New campground in the woods!",
            price,
            images:[
                {
                  url: 'https://res.cloudinary.com/darmtuatc/image/upload/v1666739291/YelpCamp/d0ypyveljk9vefr4m6re.jpg',
                  filename: 'YelpCamp/d0ypyveljk9vefr4m6re',
                },
                {
                  url: 'https://res.cloudinary.com/darmtuatc/image/upload/v1666739291/YelpCamp/ua22vydibl4vappuvoos.jpg',
                  filename: 'YelpCamp/ua22vydibl4vappuvoos',
                },
                {
                  url: 'https://res.cloudinary.com/darmtuatc/image/upload/v1666739291/YelpCamp/xneav2ye840t5tj9ictq.jpg',
                  filename: 'YelpCamp/xneav2ye840t5tj9ictq',
                },
                {
                  url: 'https://res.cloudinary.com/darmtuatc/image/upload/v1666739292/YelpCamp/hifnsivs4ijum0h5qdpa.jpg',
                  filename: 'YelpCamp/hifnsivs4ijum0h5qdpa',
                }
              ],
            
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const User = require('../models/user');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>console.log('Database Connected...'))
.catch((err)=>console.error(err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected...");
});

const sample = arr => arr[Math.floor(Math.random()*arr.length)];

const seedDB = async ()=>{
    await Campground.deleteMany({});
    const user = await User.findOne({ username: 'admin' });
    for(let i=0;i<50;i++){
        const random50 = Math.floor(Math.random()*50);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: user._id,
            location: `${cities[random50].city}, ${cities[random50].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/483251",
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            price
        })
        await camp.save();
    }
}
seedDB().then(()=>console.log('Data Added')).catch((err)=>{console.log(err)});
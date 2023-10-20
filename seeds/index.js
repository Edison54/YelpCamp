const mongoose = require('mongoose')
const cities = require('./cities')
const{places,descriptos, descriptors}= require('./seedHelpers')
const Campground = require('../models/campground')


//this is for seeding the database of the campgrounds. you can test with this code 
//that uses cities and seedHelpers to insert randoms campgrounds in the mongobd
//it deletes every campground before inserting new ones
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}); 

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open",()=>{
    console.log("Database connected")
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async()=>{
    //this deletes all the campgrounds
    await Campground.deleteMany();
    for(let i =0; i<50; i++){
        const random1000= Math.floor(Math.random() * 1000)
        const price= Math.floor(Math.random() * 20+10)
    const camp =  new Campground({
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image:'https://source.unsplash.com/collection/483251',
        description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dignissim suspendisse in est ante in nibh mauris cursus. Sagittis orci a scelerisque purus. Egestas maecenas pharetra convallis posuere morbi leo urna molestie. Potenti nullam ac tortor vitae purus faucibus ornare suspendisse. Dignissim enim sit amet venenatis.',
        price
     
    })  
      await camp.save()
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
});
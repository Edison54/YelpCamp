const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const Joi = require('joi')
const { campgroundSchema,reviewSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const catchAsyncError = require('./utils/CatchAsyncError')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const Review = require('./models/review')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected")
});


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

//validation of the campgrounds
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // This line creates a string 'msg' by extracting the 'message' property from each object in the 'error.details' array,
        // and joining them together with commas.
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
const validateReview= (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // This line creates a string 'msg' by extracting the 'message' property from each object in the 'error.details' array,
        // and joining them together with commas.
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

//campground find index PAGE
//we use a catchAsyncError in all async routes so  we can catch te error and trow it with next().
app.get('/campgrounds', catchAsyncError(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })

}));

//campground add PAGE
app.get('/campgrounds/new', catchAsyncError(async (req, res,) => {

    res.render('campgrounds/new');
}));

//campground POST 
app.post('/campgrounds', validateCampground, catchAsyncError(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError("Invalid campground data", 400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))




app.post('/campgrounds/:id/reviews',  catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}))
//campground show
app.get('/campgrounds/:id', catchAsyncError(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

//campground EDIT PAGE
app.get('/campgrounds/:id/edit', catchAsyncError(async (req, res,) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

//campground PUT
app.put('/campgrounds/:id', validateCampground, catchAsyncError(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsyncError(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));


app.delete('/campgrounds/:id/reviews/:reviewId', catchAsyncError(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

//error for  rutes unknown
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})
//GENERAL ERROR 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Someting went wrong"
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {

    console.log('Servin on port 3000')
})
if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const session = require('express-session');
const MongoDbStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const dbUrl = 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl)
.then(() => {
    console.log("Database connected");
  }).catch(err => {
    console.error("Connection error", err);
});  

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected...");
});

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride('_method'));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
const store = MongoDbStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: 'thisshouldbeabettersecret!'
  }
});

const sessionConfig = {
  store,
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7 ,
    maxAge: 1000*60*60*24*7,
  }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.get('/fakeUser', async (req,res)=>{
  const user = new User({ email: 'xyz@abc.com', username: 'user_xyz' });
  const newUser = await User.register(user, 'xyz123');
  res.send(newUser);
})

app.get("/", (req, res) => {
  console.log("YelpCamp Started!");
  res.render("home");
});
// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({
//     title: "My Balcony",
//     price: "$33/night",
//     location: "Mulund",
//     description: "Only 2 people allowed",
// });
//   try {
//     await camp.save();
//     res.send(camp);
//   } catch (error) {
//     console.error("Error saving campground:", error);
//     res.status(500).send("Error saving campground");
//   }
// });

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes); 

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong!' } = err;
    res.status(statusCode).render('error', {
              statusCode, message, 
    });
});

app.listen(3000, () => console.log("Server Started..."));

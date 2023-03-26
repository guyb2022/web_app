//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser  = require('body-parser');
const mongoose = require('mongoose')
const ejs = require('ejs');
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express()

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
  cookie: {secure: true}
}));

app.use(session({
  secret:"This is my bla bla",
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1/userDB")

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res) {
  res.render("home")
});

app.get('/login', function(req, res) {
  res.render('login')
});

app.get('/register', function(req, res) {
  res.render('register')
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.post('/register', async (req, res) => {
  const user = await User.register({username: req.body.username}, req.body.password);
  if(user){
    console.log('Successfuly register user')
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets");
    });
  } else {
    console.log("Error on registration")
    res.redirect('/register')
  };
});

app.post('/login', async (req, res) => {
  const user = new User({
    username: req.body.username,
    passport: req.body.passport
  });

  req.login(user, function(err){
    if (!err) {
      passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets")
      });
    } else {
      console.log(err);
      res.redirect("/login");
    }
  });
});

app.get('/logout', function(req,res){
  req.logout(function(err){
    if (!err) {
      res.redirect("/");
    } else {
      console.log("Unexpected error occoured");
    };
  });
})

app.listen(3000, function(req,res){
  console.log("Server started on port 3000.")
})

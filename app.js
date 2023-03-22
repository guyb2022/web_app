//jshint esversion:6
const express = require('express');
const bodyParser  = require('body-parser');
const mongoose = require('mongoose')
const ejs = require('ejs');

const app = express()

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://127.0.0.1/userDB")

const userSchema = {
  emai: String,
  password: String
};

const User = new mongoose.model("User", userSchema)

app.get('/', function(req, res) {
  res.render("home")
});

app.get('/login', function(req, res) {
  res.render('login')
});

app.get('/register', function(req, res) {
  res.render('register')
});

app.post('/register', async (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  const action = await newUser.save()
  if (action !== ""){
    res.render('secrets')
  };
});

app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username," ",password)
  const find_user = await User.findOne({email: username});
  console.log(find_user)
  if(find_user){
    if (find_user.password === password){
      res.render('secrets');
    }
  };
});

app.listen(3000, function(req,res){
  console.log("Server started on port 3000.")
})

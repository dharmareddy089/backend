require("dotenv").config()

const express=require("express");
const app=express();
var session = require("express-session");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require('dotenv')
var findOrCreate = require("mongoose-findorcreate")
const md5 = require("md5");
const passport=require("passport");
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.static("public"));
const  GoogleStrategy = require('passport-google-oauth20').Strategy;


mongoose.connect(process.env.PORT, {useNewUrlParser: true, useUnifiedTopology: true});
var userSchema=new mongoose.Schema({
  fname:String,
  lname:String,
  email:String,
  password:String,
  cpassword:String
});
userSchema.plugin(findOrCreate);
var User=mongoose.model("User",userSchema);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret:process.env.CLIENTSECRET,
    callbackURL: "http://localhost:3000/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
   res.render("register");
});

app.post("/register",function(req,res){
  var user1=new User({
    fname:req.body.fname,
    lname:req.body.lname,
    email:req.body.g,
    password:md5(req.body.pass),
    cpassword:md5(req.body.cpass)
  });
  user1.save(function(error){
    if(error){
      console.log(error);
    }else {
      res.redirect("/");
    }
  });
});
app.post("/",function(req,res){
  var username=req.body.username;
  var password=md5(req.body.password);
  User.findOne({email:username},function(error,found){
    if(error){
     console.log(error);
    }else {
      if(found){
        if(found.password===password){
          res.render("index");
        }else{
          res.send("wrong password");
        }
      }
    }
  });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email','profile'] }));

app.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/index');
  });


app.get("/index",function(req,res){
  res.render("index");
});

app.get("/collection",function(req,res){
  res.render("collection");
});

app.get("/shop",function(req,res){
  res.render("shop");
});

app.get("/contact",function(req,res){
  res.render("contact");
});

app.get("/buy",function(req,res){
  res.render("buy");
});
app.listen(3000,function(){
  console.log("server started");
});

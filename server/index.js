// Requires all the dependencies and routes
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const User = require("./Models/User");
const port = 3001;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const compression = require("compression");
const cloudinary = require("./cloudinary.js");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

// DB Connection
require("./DB/Database.js");

// Middlewares
app.use(compression());
app.use(cors());

// Compression for base64, to handle large images
var jsonParser = bodyParser.json({
  limit: 1024 * 1024 * 10,
  type: "application/json",
});
var urlencodedParser = bodyParser.urlencoded({
  extended: true,
  limit: 1024 * 1024 * 10,
  type: "application/x-www-form-urlencoded",
});

// JSON Parser middlewares
app.use(jsonParser);
app.use(urlencodedParser);

// Routes
// Note: Used all the routes in a single file for simplicity, as it is one page application ;)

// Authentication Routes

// Register User
app.post("/api/register", async (req, res) => {
  const [name, email, password, dob, username] = [
    req.body.name,
    req.body.email,
    req.body.password,
    req.body.dob,
    req.body.username,
  ];
  if (!name || !email || !password || !dob || !username) {
    res.status(400).json({
      message: "Please fill all the fields",
    });
  } else {
    try {
      bcrypt.hash(password, 13, function (err, hash) {
        // Store hash in your password DB.
        console.log(hash);
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          dob: req.body.dob,
          username: req.body.username,
        });
        user.save();
        res.status(200).json({
          message: "User registered successfully",
        });
      });
    } catch (err) {
      res.status(400).json({
        message: "User already exists",
      });
    }
  }
});

// Login User
app.post("/api/login", async (req, res) => {
  const [username, password] = [req.body.username, req.body.password];
  if (!username || !password) {
    res.status(400).json({
      message: "Please fill all the fields",
    });
  } else {
    try {
      const user = await User.findOne({ username: username });
      bcrypt.compare(password, user.password, function (err, result) {
        // result == true
        if (!result) {
          res.status(400).json({
            message: "Invalid Credentials",
          });
        } else {
          const token = jwt.sign({ _id: user._id }, "secretkey12345");
          res.status(200).json({
            message: "User logged in successfully",
            status: true,
            token: token,
            username: user.username,
          });
        }
      });
    } catch (error) {
      res.status(400).json({
        message: "Invalid Credentials",
        status: false,
      });
    }
  }
});

//   Verify by token, if the person is registered user or not
app.post("/api/verify", async (req, res) => {
  const token = req.body.token;
  try {
    const verified = await jwt.verify(token, "secretkey12345");
    if (verified) {
      const user = await User.findOne({ _id: verified._id }).select(
        "-password"
      );
      res.status(200).json({
        message: "User verified successfully",
        user: user,
      });
    } else {
      res.status(400).json({
        message: "User not verified",
      });
    }
  } catch (error) {}
});

// Updating personal Info of the user
app.post("/api/updateInfo", async (req, res) => {
  const [name, lastName, phone, token] = [
    req.body.name,
    req.body.lastName,
    req.body.phone,
    req.body.token,
  ];
  if (!name || !lastName) {
    res.status(400).json({
      message: "Please fill Mandate Fields",
    });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded._id });
      if (user) {
        user.name = name;
        user.lastName = lastName;
        user.phone = phone;
        user.save();
        res.status(200).json({
          message: "User updated successfully",
        });
      } else {
        res.status(400).json({
          message: "User does not exist",
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
});

// Updating About section os user profile
app.post("/api/updateAbout", async (req, res) => {
  const [token, about] = [req.body.token, req.body.about];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const update = await User.findOneAndUpdate(
      { _id: decoded._id },
      { about: about }
    );
    res.status(200).json({
      message: "About updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "About not updated",
    });
  }
});

// Updating Web Links section of user profile
app.post("/api/updateWebLinks", async (req, res) => {
  const [token, linkedin, github, twitter, instagram, facebook, website] = [
    req.body.token,
    req.body.linkedin,
    req.body.github,
    req.body.twitter,
    req.body.instagram,
    req.body.facebook,
    req.body.website,
  ];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const update = await User.findOneAndUpdate(
      { _id: decoded._id },
      { linkedin, github, twitter, instagram, facebook, website }
    );
    res.status(200).json({
      message: "About updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "About not updated",
    });
  }
});

// Updating Professional Info section of user profile
app.post("/api/updateProfessionalInfo", async (req, res) => {
  const [token, highestEducation, job] = [
    req.body.token,
    req.body.highestEducation,
    req.body.job,
  ];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const update = await User.findOneAndUpdate(
      { _id: decoded._id },
      { highestEducation, job }
    );
    res.status(200).json({
      message: "Professional Info updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Professional Info not updated",
    });
  }
});

// Updating Password section of user profile
app.post("/api/updatePassword", async (req, res) => {
  const [token, password] = [req.body.token, req.body.password];
  if (password === "") {
    return res.status(400).json({
      message: "Password cannot be empty",
    });
  }
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    bcrypt.hash(password, 13, async function (err, hash) {
      // Store hash in your password DB.
      const update = await User.findOneAndUpdate(
        { _id: decoded._id },
        { password: hash }
      );
      res.status(200).json({
        message: "Password updated successfully",
      });
    });
  } catch (error) {
    res.status(400).json({
      message: "Password not updated",
    });
  }
});

// Updating Interest section of user profile
app.post("/api/updateInterest", async (req, res) => {
  const [token, interest] = [req.body.token, req.body.interest];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const update = await User.findOneAndUpdate(
      { _id: decoded._id },
      { interests: interest }
    );
    res.status(200).json({
      message: "Interest updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Interest not updated",
    });
  }
});

// Followers (Hardcoded)
const followers = [
  {
    Name: "Arpit",
    Job: "Software Engineer",
    Followers: 1,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Kanav",
    Job: "Student",
    Followers: 100,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Harpreet",
    Job: "Student",
    Followers: 10,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "HarNeet",
    Job: "Teacher",
    Followers: 300,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Preet",
    Job: "Student",
    Followers: 103,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Manpreet",
    Job: "Engineer",
    Followers: 103,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Manik",
    Job: "Student",
    Followers: 23,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Kalash",
    Job: "Student",
    Followers: 40,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Pal",
    Job: "Enthusiast",
    Followers: 13,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Kamla",
    Job: "Mechanic",
    Followers: 156,
    Image: "https://i.pravatar.cc/300",
  },
  {
    Name: "Ajay",
    Job: "Engineer",
    Followers: 110,
    Image: "https://i.pravatar.cc/300",
  },
];

// Getting all followers
app.post("/api/getAllFollowers", async (req, res) => {
  const token = req.body.token;

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
      followers: followers,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Profile Pic not updated",
    });
  }
});

// Updating Profile Pic section of user profile
app.post("/api/updateProfilePic", async (req, res) => {
  const [token, profilePic] = [req.body.token, req.body.profilePic];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const result = await cloudinary.uploader.upload(profilePic, {
      folder: "profilePic",
    });

    const update = await User.findOneAndUpdate(
      { _id: decoded._id },
      { image: { public_id: result.public_id, url: result.secure_url } }
    );
    res.status(200).json({
      message: "Profile Pic updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Profile Pic not updated",
    });
  }
});

// Listen to port
app.listen(port, () => {
  console.log(`App listening at Port: ${port}`);
});

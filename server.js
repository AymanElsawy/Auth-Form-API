import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoute from "./routes/auth.js";

const app = express();

// enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enable CORS
app.use(cors());

// load environment variables from .env
dotenv.config();

//static files
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/public/images",
  express.static(path.join(__dirname, "public/images"))
); //static files

//facebook

import passport from "passport";
import session from "express-session";
import { Strategy as FacebookStrategy } from "passport-facebook";
import FbUser from "./models/facebookUser.model.js";
import Jwt from "jsonwebtoken";
app.use(
  session({
    secret: "aymanmoka",
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:5000/auth/facebook/callback",
      profileFields: [
        "id",
        "displayName",
        "photos",
        "email",
        "gender",
        "birthday",
      ],
    },
    //here fn that login in and save to db
    async function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      const user = await FbUser.findOne({ email: profile._json.email });
      if (user) {
        return done(null, user);
      }
      const newUser = new FbUser({
        name: profile._json.name,
        email: profile._json.email,
        photo: `https://graph.facebook.com/${profile.id}/picture?type=large`,
      });
      const savedUser = await newUser.save();
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/auth/facebook", passport.authenticate("facebook"));
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "http://localhost:4200",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    const token = Jwt.sign(
      // generate token
      {
        // payload
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d", // token expires in 1 day
      }
    );
    res.redirect(`http://localhost:4200/home?token=${token}`);
  }
);

// connect to MongoDB

await mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api", authRoute);

// create express app and listen on port 3000

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

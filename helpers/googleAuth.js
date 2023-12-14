// googleAuth.js

import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import SocialUser from "../models/socialUser.model.js";
import Jwt from "jsonwebtoken";

export const googleAuth = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      async function (token, tokenSecret, profile, done) {
        // console.log(profile);
        const user = await SocialUser.findOne({ email: profile._json.email });
        if (user) {
          return done(null, user);
        }
        const newUser = new SocialUser({
          name: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
        });
        const savedUser = await SocialUser.create(newUser);
        return done(null, savedUser);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
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
};

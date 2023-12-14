import passport from "passport";
import session from "express-session";
import { Strategy as FacebookStrategy } from "passport-facebook";
import SocialUser from "../models/socialUser.model.js";
import Jwt from "jsonwebtoken";


export const facebookAuth = (app) => {
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
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
        },
        async function (accessToken, refreshToken, profile, done) {
          const user = await SocialUser.findOne({ email: profile._json.email });
          if (user) {
            return done(null, user);
          }
          const newUser = new SocialUser({
            name: profile._json.name,
            email: profile._json.email,
            photo: `https://graph.facebook.com/${profile.id}/picture?type=large`,
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
}

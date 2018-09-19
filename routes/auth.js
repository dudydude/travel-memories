const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 14;
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "demo",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 2000, height: 900, crop: "limit" }]
});
const parser = multer({ storage: storage });

router.get("/signup", ensureLoggedOut(), (req, res, next) => {
  console.log("hello");
  res.render("auth/signup");
});

router.post(
  "/signup",
  parser.single("image"),
  ensureLoggedOut(),
  (req, res, next) => {
    const mail = req.body.mail;
    const username = req.body.username;
    const password = req.body.password;
    const image = {};
    image.url = req.file.url;
    image.id = req.file.public_id;
    console.log(image);
    if (!password) {
      req.flash("error", "Password is required");
      return res.redirect("/signup");
    }
    if (!mail) {
      req.flash("error", "Email is required");
      return res.redirect("/signup");
    }

    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return next(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return next(err);
        const user = new User({
          mail,
          username,
          image,
          password: hash
        });
        console.log(user);
        user.save(err => {
          if (err) {
            if (err.code === 11000) {
              req.flash(
                "error",
                `A user with username ${username} already exists`
              );
              console.log("ici");
              return res.redirect("/signup");
            } else if (user.errors) {
              Object.values(user.errors).forEach(error => {
                req.flash("error", error.message);
                console.log("oupsy");
              });
              return res.redirect("/signup");
            }
          }
          if (err) return next(err);
          res.redirect("/login");
        });
      });
    });
  }
);

router.get("/login", ensureLoggedOut(), (req, res, next) => {
  res.render("auth/login");
});

router.post(
  "/login",
  ensureLoggedOut(),
  passport.authenticate("local-login", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/logout", (req, res, next) => {
  var name = req.user.username;
  console.log("LOGGIN OUT " + req.user.username);
  req.logout();
  res.redirect("/");
  req.session.notice = "You have successfully been logged out " + name + "!";
});

module.exports = router;

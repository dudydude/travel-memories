const express = require("express");
const router = express.Router();
const Trip = require("../models/trip");
const User = require("../models/user");
const Day = require("../models/day");

/* GET home page */
router.get("/", (req, res, next) => {
  if (req.user) {
    res.redirect("/dashboard");
  }
  res.render("index");
});

router.get("/dashboard", (req, res, next) => {
  let user = req.user;
  User.findById(req.user._id)
    .populate("tripCreated")
    .populate("tripFollowed")
    .exec(function(err, user) {
      if (err) return next(err);
    })
    .then(resultArray => {
      res.render("dashboard", { resultArray });
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;

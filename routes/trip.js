const express = require("express");
const router = express.Router();
const Trip = require("../models/trip");
const User = require("../models/user");
const Day = require("../models/day");
const ensureLogin = require("connect-ensure-login");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

// Storage pour cover : trip
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "demo",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 2000, height: 900, crop: "limit" }]
});
const parser = multer({ storage: storage });

//Storage pour album day
const storageAlbum = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "demo",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 1000, height: 1000, crop: "limit" }]
});
const parserAlbum = multer({ storage: storageAlbum });

/* GET home page */
router.get("/create-trip", (req, res, next) => {
  console.log("here");
  res.render("trip/tripCreate", { user: req.user });
});

router.post("/create-trip", parserAlbum.single("image"), (req, res, next) => {
  console.log(req.file); // to see what is returned to you
  const image = {};
  image.url = req.file.url;
  image.id = req.file.public_id;

  const tripForm = {
    name: req.body.name,
    description: req.body.description,
    creator: req.user._id,
    image: {
      url: req.file.url,
      img: req.file.public_id
    }
  };
  const newTrip = new Trip(tripForm);
  console.log(newTrip);

  let user = req.user._id;

  newTrip
    .save(err => {
      if (err) {
        return next(err);
      }
      console.log(newTrip);
    })
    .then(
      User.findByIdAndUpdate(
        newTrip.creator,
        {
          $push: { tripCreated: newTrip._id }
        },
        function(err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("success");
          }
        }
      )
    )
    .catch(err => {
      console.log(err);
    });
  res.redirect(`/trip/${newTrip._id}`);
});

// redirect to the event page if it saves

router.get("/:tripId", (req, res, next) => {
  let creator;
  let follower;
  let currentUser = req.user;

  function isFollower(followers, currentUser) {
    for (var i = 0; i < followers.length; i++) {
      if (followers[i]._id.toString() === currentUser.toString()) {
        follower = true;
      } else follower = false;
    }
  }
  Trip.findById(req.params.tripId)
    .populate("days")
    .populate("followers")
    .exec((err, tripCreated) => {
      if (err) {
        return next(err);
      }

      if (!req.user) {
        creator = false;
      } else if (req.user._id.equals(tripCreated.creator)) {
        creator = true;
      } else creator = false;

      let followers = tripCreated.followers;
      isFollower(followers, currentUser._id);
    })
    .then(tripCreated => {
      res.render("trip/user-trip", {
        tripCreated,
        creator,
        currentUser,
        follower
      });
    })
    .catch(err => {
      console.log(err);
    });
});

router.get(
  "/:tripId/delete",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const user = req.user;
    const tripId = req.params.tripId;
    Trip.findById(tripId, (err, trip) => {
      if (req.user._id.equals(trip.creator)) {
        Trip.findByIdAndRemove(tripId, (err, trip) => {
          if (err) {
            throw err;
          }
          res.redirect("/dashboard");
        });
      } else res.redirect(`/trip/${req.params.tripId}`);
    });
  }
  //ensureLogin.ensureLoggedIn()
);

router.get(
  "/:tripId/edit",

  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    Trip.findById(req.params.tripId, (err, trip) => {
      if (req.user._id.equals(trip.creator)) {
        res.render("trip/edit-trip", { trip });
      } else res.redirect(`/trip/${req.params.tripId}`);
    });
  }
);

router.post(
  "/:tripId/edit",
  parser.single("image"),
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    console.log(req.file);
    const image = {};
    image.url = req.file.url;
    image.id = req.file.public_id;

    Trip.findByIdAndUpdate(
      req.params.tripId,
      {
        name: req.body.name,
        description: req.body.description,
        image: {
          url: req.file.url,
          id: req.file.public_id
        }
      },
      (err, event) => {
        if (err) return next(err);
        res.redirect(`/trip/${req.params.tripId}`);
      }
    );
  }
);

//Add trip to my bookmark

router.post("/:tripId/follow", (req, res, next) => {
  const userId = req.body.user;
  const tripId = req.body.trip;

  User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { tripFollowed: tripId }
    },
    function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("success user");
      }
    }
  );

  Trip.findByIdAndUpdate(tripId, { $addToSet: { followers: userId } }, function(
    err,
    doc
  ) {
    if (err) {
      console.log(err);
    }
    console.log("success trip");
  });
  res.redirect(`/trip/${tripId}`);
});

// delete from user bookmark + trip follower

//delete from user's bookmarked events

router.get("/:tripId/unfollow", (req, res, next) => {
  const userId = req.user._id;
  const tripId = req.params.tripId;

  User.findById(userId, (err, user) => {
    user.tripFollowed.splice(user.tripFollowed.indexOf(tripId), 1);
    user.save(err => {
      if (err) {
        throw err;
      }
      console.log("success unfollow");
    });
  });

  Trip.findById(tripId, (err, trip) => {
    trip.followers.splice(trip.followers.indexOf(userId), 1);
    trip.save(err => {
      if (err) {
        throw err;
      }
      console.log("success unfollower");
    });
  });
  res.redirect(`/trip/${tripId}`);
});

// DAY routes

// Create a new day : GET / POST
router.get("/:tripId/day/new", (req, res, next) => {
  Trip.findById(req.params.tripId, (err, trip) => {
    if (req.user._id.equals(trip.creator)) {
      res.render("day/create-day", { trip });
    } else res.redirect(`/trip/${req.params.tripId}`);
  });
});

router.post("/:tripId/day/new", parser.single("image"), (req, res, next) => {
  const image = {};
  image.url = req.file.url;
  image.id = req.file.public_id;

  const dayForm = {
    name: req.body.name,
    description: req.body.description,
    date: req.body.date,
    trip: req.params.tripId,
    photo: [image]
  };
  let tripId = req.params.tripId;
  const newDay = new Day(dayForm);
  console.log("this is new day =====================" + newDay);
  newDay
    .save(err => {
      if (err) {
        return next(err);
      }
      console.log(newDay);
    })
    .then(
      Trip.findByIdAndUpdate(
        tripId,
        {
          $push: { days: newDay._id }
        },
        function(err, doc) {
          if (err) {
            console.log(err);
          }
        }
      )
    )
    .catch(err => {
      console.log(err);
    });
  res.redirect(`/trip/${req.params.tripId}`);
});

// Visit the day page (check if user is creator to display edit/delete button)
router.get("/:tripId/:dayId", (req, res, next) => {
  let creator;
  Trip.findById(req.params.tripId)
    .exec((err, tripCreated) => {
      if (err) {
        return next(err);
      }

      if (!req.user) {
        creator = false;
      } else if (req.user._id.equals(tripCreated.creator)) {
        creator = true;
      } else creator = false;
    })
    .then(
      Day.findById(req.params.dayId, (err, day) => {
        if (err) {
          return next(err);
        }
        res.render("day/day", { creator, day });
      })
    )
    .catch(err => {
      console.log(err);
    });
});

// Edit day : GET / POST edit form

router.get("/:tripId/:dayId/edit", (req, res, next) => {
  Trip.findById(req.params.tripId, (err, trip) => {
    if (req.user._id.equals(trip.creator)) {
      Day.findById(req.params.dayId, (err, day) => {
        if (err) {
          return next(err);
        }
        res.render("day/edit-day", { day });
      });
    } else res.redirect(`/trip/${req.params.dayId}`);
  });
});

router.post("/:tripId/:dayId/edit", (req, res, next) => {
  const image = {};
  image.url = req.file.url;
  image.id = req.file.public_id;
  let tripId = req.params.tripId;

  Day.findByIdAndUpdate(
    req.params.dayId,
    {
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      photo: [image]
    },
    (err, event) => {
      if (err) {
        return next(err);
      }
      console.log("estoy aqui");
      res.redirect(`/trip/${tripId}/${event._id}`);
    }
  );
});

// Delete a day

router.get(
  "/:tripId/:dayId/delete",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    Trip.findById(req.params.tripId, (err, trip) => {
      if (req.user._id.equals(trip.creator)) {
        Day.findByIdAndRemove(req.params.dayId, (err, day) => {
          if (err) {
            throw err;
          }
        });
        res.redirect(`/trip/${req.params.tripId}`);
      } else res.redirect(`/trip/${req.params.tripId}/${req.params.dayId}`);
    });
  }
);

module.exports = router;

// let methodApi = require("api-methods");

$(document).ready(function() {
  //click pawprint
  let userId = $(".target-user").val();
  let tripId = $(".target-trip").val();
  let follow = $(".target-follower").val();

  $(".follow").click(function() {
    apiMethods.bookmark(tripId, userId).then(bookmarkedEvent => {
      console.log(bookmarkedEvent);
    });
  });

  $(".unfollow").click(function() {
    apiMethods.unfollow(tripId, userId).then(bookmarkedEvent => {
      console.log(bookmarkedEvent);
    });
  });
});

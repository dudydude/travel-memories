document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("IronGenerator JS imported successfully!");
  },
  false
);

// document.addEventListener("DOMContentLoaded", function() {
//   var elems = document.querySelectorAll(".datepicker");
//   var instances = M.Datepicker.init(elems, options);
// });

// // Or with jQuery

// $(document).ready(function() {
//   console.log("hello");
//   $(".datepicker").datepicker();
//   initMap();
// });

function initMap() {
  // The location of Uluru
  var uluru = { lat: -25.344, lng: 131.036 };
  // The map, centered at Uluru
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: uluru
  });
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({ position: uluru, map: map });
}

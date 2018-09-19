let apiMethods = {
  bookmark: function(tripId, userId) {
    return axios
      .post(`/trip/${tripId}/follow`, {
        trip: tripId,
        user: userId
      })
      .then(res => {
        console.log("this is ress + it works" + res);
        location.reload();
      })
      .catch(err => {
        console.log(err);
      });
  },
  unfollow: function(tripId, userId) {
    console.log(tripId, userId);
    return axios
      .get(`/trip/${tripId}/unfollow/`, {
        trip: tripId,
        user: userId
      })
      .then(res => {
        console.log("this is ress + it works" + res.data);
        location.reload();
      })
      .catch(err => {
        console.log(err);
      });
  },
  deleteAll: function(userId) {
    return axios
      .delete(`/events/${userId}/`)
      .then(res => res.data)
      .catch(err => {
        console.log(err);
      });
  }
};

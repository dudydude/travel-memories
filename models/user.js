const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  mail: {
    type: String,
    unique: true,
    required: true
  },
  image: {
    url: { type: String },
    img: { type: String }
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  tripCreated: [{ type: Schema.Types.ObjectId, ref: "Trip" }],
  tripFollowed: [{ type: Schema.Types.ObjectId, ref: "Trip" }]
});

module.exports = mongoose.model("User", userSchema);

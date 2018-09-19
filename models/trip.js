const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tripSchema = new Schema({
  name: {
    type: String,
    require: true
    // unique: false
  },
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  description: { type: String },
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  created: { type: Date, default: Date.now },
  image: {
    url: { type: String },
    img: { type: String }
  },
  days: [{ type: Schema.Types.ObjectId, ref: "Day" }],
  start: { type: Date, default: Date.now },
  end: { type: Date }
  //  //photo à venir : photo: { type: String, required: true },
});

module.exports = mongoose.model("Trip", tripSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  date: { type: Date, default: date.now },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  day: { type: Schema.Types.ObjectId, ref: "Day" }
});

module.exports = mongoose.model("Comment", commentSchema);

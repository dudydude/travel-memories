const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const daySchema = new Schema({
  name: { type: String, required: true },
  created: { type: Date, default: Date.now },
  trip: { type: Schema.Types.ObjectId, ref: "Trip" },
  description: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  photo: [
    {
      url: { type: String },
      img: { type: String }
    }
  ]
  // place 1 + place arrivée puis => tracé entre les deux
});

module.exports = mongoose.model("Day", daySchema);

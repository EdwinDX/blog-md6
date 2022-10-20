const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "posts",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("likes", LikeSchema);

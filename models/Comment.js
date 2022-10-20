const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
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
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("comments", CommentSchema);

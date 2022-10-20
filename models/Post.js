const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  content: {
    type: String,
  },
  avatar: {
    type: String,
    default:
      "https://firebasestorage.googleapis.com/v0/b/image-blog-dbb1d.appspot.com/o/files%2FMinimalist.png?alt=media&token=2eaaa696-d4cd-4775-85af-a1aa016ace58",
  },
  accessModified: {
    type: String,
    default: "Public",
  },
  like: {
    type: Number,
    default: 0,
  },
  comment: {
    type: Number,
    default: 0,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  tagArray: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("posts", PostSchema);

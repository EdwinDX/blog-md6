const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    default: "User",
  },
  email: {
    type: String,
  },
  avatar: {
    type: String,
    default:
      "https://firebasestorage.googleapis.com/v0/b/image-blog-dbb1d.appspot.com/o/files%2Fcropped-512-512-682156.jpg?alt=media&token=b2b7a3af-75ce-4d13-b940-6096db39d0d4",
  },
  address: {
    type: String,
  },
  phoneNumber: {
    type: Number
  },
  totalPosts: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: "Active",
    enum: ["Active", "Inactive"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", UserSchema);

const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

const adminController = {
  getAllPosts: async (req, res) => {
    try {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate("author", ["username"]);
      return res.status(200).json({
        success: true,
        posts: posts,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error. " + error.message,
      });
    }
  },

  getPostById: async (req, res) => {
    try {
      let id = req.params.id;
      let post = await Post.find({ _id: id }).populate("author", ["username"]);
      if (post) {
        res.status(200).json({
          post: post,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Post not found.",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  deletePostById: async (req, res) => {
    try {
      const postDeleteCondition = { _id: req.params.id };
      const deletedPost = await Post.findOneAndDelete(postDeleteCondition);

      if (!deletedPost) {
        return res.status(401).json({
          success: false,
          message: "Post not found or user not authorised.",
        });
      }

      const user = await User.findOne({ _id: deletedPost.author._id });
      const userId = user._id;
      user.totalPosts = (await Post.find({ author: userId })).length;
      await user.save();
      const notification = new Notification({
        message: `The post with title *${deletedPost.title}* was deleted by Admin`,
        user: userId,
      });
      await notification.save();

      res.json({
        success: true,
        message: "Post deleted successfully.",
        post: deletedPost,
        notification: notification,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().sort({ createdAt: -1 }).lean();
      // for (let i= 0;i<users.length;i++) {
      //   users[i].totalPosts = (await Post.find({author:users[i]._id})).length
      //   await User.findByIdAndUpdate({_id:users[i]._id},users[i],{new: true})
      // }
      return res.status(200).json({
        success: true,
        users: users,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error." + error.message,
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      let id = req.params.id;
      let user = await User.findOne({ _id: id });
      if (user) {
        console.log(user.id);
        res.status(200).json({
          user: user,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "User not found.",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(gi500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  setUserInactiveById: async (req, res) => {
    try {
      const oldUser = await User.findOne({ _id: req.params.id });
      const { currentStatus } = req.body;
      console.log(req.params.id, currentStatus);
      if (!oldUser) {
        return res.status(401).json({
          success: false,
          message: "User not found or admin not authorised.",
        });
      }

      if (currentStatus === "Active") {
        await User.updateOne(
          { _id: req.params.id },
          { $set: { status: "Inactive" } }
        );
      }

      if (currentStatus === "Inactive") {
        await User.updateOne(
          { _id: req.params.id },
          { $set: { status: "Active" } }
        );
      }

      const newUser = await User.findOne({ _id: req.params.id });

      res.json({
        success: true,
        message: "User status switched successfully.",
        previousStatus: currentStatus,
        newStatus: newUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  searchUsersByUsername: async (req, res) => {
    const { searchQuery } = req.query;
    console.log(searchQuery);
    try {
      const username = new RegExp(searchQuery, "i");
      let users = await User.find({ username }).sort({ createdAt: -1 });
      res.json({
        users: users,
      });
    } catch (error) {
      res.status(404).json({ message: "Something went wrong" });
    }
  },
  searchPostsByTitle: async (req,res) => {
    const {searchQuery} = req.query;
    console.log(searchQuery);
    try {
      const title = new RegExp(searchQuery, "i");
      let posts = await Post.find({title}).sort({ createdAt: -1 })
      res.json({
        posts: posts
      });
    } catch (error) {
      res.status(404).json({ message: "Something went wrong" });
    }
  }
};


module.exports = adminController;

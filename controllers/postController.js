const Like = require("../models/Like");
const Post = require("../models/Post");
const Tag = require("../models/Tag");
const User = require("../models/User");

const STATUS_PUBLIC = "Public";
const STATUS_PRIVATE = "Private";
const postController = {
  setLiked: async (posts, userId) => {
    let searchCondition = {};
    if (userId) searchCondition = { userId };
    const userPostLikes = await Like.find(searchCondition);
    posts.forEach((post) => {
      userPostLikes.forEach((userPostLike) => {
        if (userPostLike.postId.equals(post._id)) {
          post.isLiked = true;
          return;
        }
      });
    });
  },

  // LẤY POST GÁN PUBLIC MÀ KHÔNG CÓ TOKEN
  getAllPublicPosts: async (req, res) => {
    try {
      const userId = req.userId;
      let posts = await Post.find({ accessModified: STATUS_PUBLIC })
        .populate("author")
        .sort({ createdAt: -1 })
        .lean();

      if (userId) {
        await postController.setLiked(posts, userId);
      }
      return res.status(200).json({
        posts: posts,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  },

  getRelatedPosts: async(req,res) => {
    try {
      const userId = req.userId;
      let posts = await Post.find({ accessModified: STATUS_PUBLIC })
        .populate("author")
        .sort({ like: -1 })
        .limit(3)
        .lean();

      if (userId) {
        await postController.setLiked(posts, userId);
      }
      return res.status(200).json({
        posts: posts,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  },

  getUserLikedPosts: async (req, res) => {
    try {
      const likedId = req.params.id;
      const userId = req.userId;
      let posts = await Like.find({ userId: likedId });
      let responsePosts = [];
      posts.forEach((post) => {
        responsePosts.push(post.postId);
      });

      if (userId) {
        await postController.setLiked(responsePosts, userId);
      }

      return res.status(200).json({ posts: responsePosts });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  },

  likePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.userId;

      const post = await Post.findById(postId);
      if (!post) {
        throw new Error("Post does not exist");
      }

      const existingPostLike = await Like.findOne({ postId, userId });

      if (existingPostLike) {
        throw new Error("Post is already liked");
      }

      await Like.create({ postId, userId });
      post.like = (await Like.find({ postId })).length;
      await post.save();
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
  unlikePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.userId;
      const post = await Post.findById(postId);

      if (!post) {
        throw new Error("Post does not exist");
      }

      const existingPostLike = await Like.findOne({ postId, userId });

      if (!existingPostLike) {
        throw new Error("Post is already not liked");
      }
      await existingPostLike.remove();
      post.like = (await Like.find({ postId })).length;
      await post.save();
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  getPublicPostsByUserId: async (req, res) => {
    try {
      const authorId = req.params.id;
      let posts = await Post.find({
        accessModified: STATUS_PUBLIC,
        author: authorId,
      }).sort({ createdAt: -1 });
      return res.status(200).json({
        posts: posts,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  },
  // LẤY POST CỦA 1 USER CÓ ID
  getAllPostsByUserId: async (req, res) => {
    try {
      const userId = req.userId;
      let posts = await Post.find({ author: userId })
        .populate("author")
        .sort({ createdAt: -1 })
        .lean();
      if (userId) {
        await postController.setLiked(posts, userId);
      }
      res.status(200).json({
        posts: posts,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  // CREATE A POST
  createMyPost: async (req, res) => {
    //Check missing required input
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({
        sucess: false,
        message: "Title is required.",
      });
    }
    try {
      let post = req.body;
      let userId = req.userId;
      post.author = userId;
      const user = await User.findById(userId)

      await (await Post.create(post)).populate("author");
      user.totalPosts = (await Post.find({ author: req.userId })).length;
      await user.save();
      res.status(200).json({
        success: true,
        message: "Post created successfully.",
        post: post,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  // EDIT A POST
  editMyPost: async (req, res) => {
    //Check missing required input
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({
        sucess: false,
        message: "Title is required.",
      });
    }
    try {
      let updatedPost = req.body;

      // Check for permission to update
      const postUpdateCondition = { _id: req.params.id, author: req.userId };

      updatedPost = await Post.findByIdAndUpdate(
        postUpdateCondition,
        updatedPost,
        { new: true }
      );

      // User not authorised to update post or post not found
      if (!updatedPost) {
        return res.status(401).json({
          success: false,
          message: "Post not found or user not authorised.",
        });
      }
      res.json({
        success: true,
        message: "Post updated successfully.",
        post: updatedPost,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  // DELETE A POST
  deleteMyPost: async (req, res) => {
    try {
      const postDeleteCondition = { _id: req.params.id, author: req.userId };
      const deletedPost = await Post.findOneAndDelete(postDeleteCondition);

      // User not authorised to update post or post not found

      const user = await User.findById(req.userId)
      if (!deletedPost) {
        return res.status(401).json({
          success: false,
          message: "Post not found or user not authorised.",
        });
      }

      const tagArray = await Tag.find({
        postArray: { $in: deletedPost._id.toString() },
      });

      await Tag.deleteMany({
        postArray: { $in: deletedPost._id.toString() },
      });

      const newTagArray = tagArray;
      for (i = 0; i < newTagArray.length; i++) {
        const newPostArray = newTagArray[i].postArray;
        for (j = 0; j < newPostArray.length; j++) {
          if (newPostArray[j].toString() == deletedPost._id.toString()) {
            newPostArray.splice(j, 1);
          }
        }
      }

      await Tag.insertMany(newTagArray);
      user.totalPosts = (await Post.find({ author: req.userId })).length;
      await user.save();
      res.json({
        success: true,
        message: "Post deleted successfully.",
        post: deletedPost,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },
  getMyPostsById: async (req, res) => {
    try {
      const userId = req.userId;
      let id = req.params.id;
      let posts = await Post.find({ _id: id }).populate("author");
      if (!userId && posts[0].accessModified === "Private") {
        return res.status(401).json({
          message: "You do not have permission to read this post"
        })
      }
      if (userId && posts[0].accessModified === "Private" && userId !== posts[0].author._id.toHexString()) {
        return res.status(401).json({
          message: "You do not have permission to read this post"
        })
      }
      res.status(200).json({
        posts,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },
  getPostsBySearch: async (req, res) => {
    const userId = req.userId;
    const { searchQuery } = req.query;
    console.log(searchQuery);
    try {
      const title = new RegExp(searchQuery, "i");
      let posts = await Post.find({ title, author: userId })
        .sort({ createdAt: -1 })
        .populate("author")
        .lean();
      if (userId) {
        await postController.setLiked(posts, userId);
      }
      res.json({
        posts: posts,
      });
    } catch (error) {
      res.status(404).json({ message: "Something went wrong" });
    }
  },
};

module.exports = postController;

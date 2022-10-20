const Tag = require("../models/Tag");
const Post = require("../models/Post");

const tagController = {
  getAllTags: async (req, res) => {
    try {
      await Tag.deleteMany({ postArray: [] || [""] });

      const tags = await Tag.find();

      return res.json({
        success: true,
        tags,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  getAllPostsByTagId: async (req, res) => {
    try {
      const { id } = req.params;
      const tag = await Tag.findOne({ _id: id });
      return res.json({
        success: true,
        postArray: tag.postArray,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  addNewTagToPost: async (req, res) => {
    const { postId } = req.params;
    const { newTagName } = req.body;
    try {
      let currentTag = await Tag.findOne({ title: newTagName });
      const currentPost = await Post.findOne({ _id: postId });

      if (currentTag) {
        const TagExistedCondition = currentPost.tagArray.find(
          (tag) => tag.toString() == currentTag._id.toString()
        );

        if (TagExistedCondition) {
          return res.json({
            success: true,
            message: "This tag already exists in this post.",
            TagExistedCondition,
          });
        } else {
          const newPostArray = currentTag.postArray;
          const checkExistedPost = newPostArray.find((id) => id == postId);
          if (!checkExistedPost) {
            newPostArray.push(postId);
          }
          await Tag.updateOne(
            { title: newTagName },
            { postArray: newPostArray }
          );

          const newTagArray = currentPost.tagArray;
          newTagArray.push(currentTag._id);
          await Post.updateOne({ _id: postId }, { tagArray: newTagArray });
        }
      } else {
        const newTag = new Tag({
          title: newTagName,
        });
        await newTag.save();

        const newPostArray = newTag.postArray;
        newPostArray.push(postId);
        await Tag.updateOne({ title: newTagName }, { postArray: newPostArray });

        const newTagArray = currentPost.tagArray;
        newTagArray.push(newTag._id);
        await Post.updateOne({ _id: postId }, { tagArray: newTagArray });
      }

      return res.json({
        success: true,
        message: "Tag added successfully.",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  removeTagFromPost: async (req, res) => {
    const { postId, tagId } = req.params;

    try {
      const post = await Post.findOne({ _id: postId });
      let newTagArray = post.tagArray;

      const checkExistedTag = newTagArray.find((id) => id == tagId);
      if (checkExistedTag) {
        newTagArray = newTagArray.filter((tag) => tag != tagId);
      }
      await Post.updateOne(
        { _id: postId },
        { tagArray: newTagArray },
        { new: true }
      );

      const tag = await Tag.findOne({ _id: tagId });
      let newPostArray = tag.postArray;
      const checkExistedPost = newPostArray.find((id) => id == postId);
      if (checkExistedPost) {
        newPostArray = newPostArray.filter((tag) => tag != postId);
      }
      await Tag.updateOne(
        { _id: tagId },
        { postArray: newPostArray },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Tag removed successfully.",
        post,
        tag,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },
};

module.exports = tagController;

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

const commentController = {
    getCommentsOfPost: async(req, res) => {
        try {
            const postId = req.params.postId
            const post = await Post.findOne({_id:postId})
            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }
            const comments = await Comment.find({postId:postId}).populate("userId").sort({ createdAt: -1 }).exec();
            res.status(200).json({
                message: "Get comments successfully",
                comments: comments
            })
        } catch (error) {
            res.status(500).json({
                message: "Something went wrong",
                error: error.message
            })
        }
    },
    addComment: async(req,res) => {
        try {
            const postId = req.params.postId;
            const userId = req.userId;
            const text = req.body.text;
            const post = await Post.findOne({_id:postId})
            const user = await User.findOne({_id:userId})
            if (!text) {
                return res.status(404).json({
                    message: "Text required"
                })
            }
            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                })
            }
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                })
            }
            const comment = await new Comment(
                {
                    postId: postId,
                    userId: userId,
                    text: text
                }
            )
            await comment.save();
            post.comment = (await Comment.find({postId})).length
            await post.save();
            res.status(201).json({
                message: "Comment created successfully",
                comment: comment
            })
        } catch (error) {
            res.status(500).json({
                message: "Something went wrong",
                error: error.message
            })
        }
    },
    deleteComment: async(req,res) => {
        try {
            const commentId = req.params.commentId
            const userId = req.userId
            const comment = await Comment.findOne({_id:commentId})
            const user = await User.findOne({_id: userId})
            if (!comment) {
                return res.status(404).json({
                    message: "Comment not found"
                })
            }
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                })
            }
            const deleteComment = await Comment.findByIdAndDelete(commentId);
            const post = await Post.findOne({_id: comment.postId})
            post.comment = (await Comment.find({postId:comment.postId})).length
            await post.save();
            res.status(201).json({
                message: "Delete comment successfully",
                comment: deleteComment
            })

        } catch (error) {
            res.status(500).json({
                message: "Something went wrong",
                error: error.message
            })
        }
    },
    updateComment: async(req,res) => {
        try {
            const commentId = req.params.commentId;
            const userId = req.userId;
            const text = req.body.text;
            const comment = await Comment.findOne({_id:commentId})
            const user = await User.findOne({_id:userId})
            if (!text) {
                return res.status(404).json({
                    message: "Text required"
                })
            }
            if (!comment) {
                return res.status(404).json({
                    message: "Post not found"
                })
            }
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                })
            }
            const updateComment = await Comment.findOneAndUpdate({_id:commentId},
                 {
                    $set: {postId: req.body.postId,
                    userId: userId,
                    text: text
                }})
            res.status(201).json({
                comment: updateComment
            })

        } catch (error) {
            res.status(500).json({
                message: "Something went wrong",
                error: error.message
            })
        }
    }
}

module.exports = commentController
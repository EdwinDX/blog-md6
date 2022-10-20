const express = require("express");
const commentController = require("../controllers/commentController");
const {verifyToken} = require("../middlewares/auth");
const router = express.Router();

router.get("/:postId",commentController.getCommentsOfPost);
router.post("/:postId",verifyToken,commentController.addComment);
router.put("/:commentId",verifyToken,commentController.updateComment);
router.delete("/:commentId",verifyToken,commentController.deleteComment);

module.exports = router;
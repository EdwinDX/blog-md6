const express = require("express");
const postController = require("../controllers/postController");
const tagController = require("../controllers/tagController");
const router = express.Router();
const { verifyToken, optionallyVerifyToken } = require("../middlewares/auth");

router.get("/search", verifyToken, postController.getPostsBySearch);

router.get("/guest", optionallyVerifyToken, postController.getAllPublicPosts);
router.get("/guest/relatedPosts", optionallyVerifyToken, postController.getRelatedPosts);
router.get("/guest/author/:id", postController.getPublicPostsByUserId);
router.get("/", verifyToken, postController.getAllPostsByUserId);
router.get("/:id",optionallyVerifyToken, postController.getMyPostsById);
router.post("/", verifyToken, postController.createMyPost);
router.put("/:id", verifyToken, postController.editMyPost);
router.delete("/:id", verifyToken, postController.deleteMyPost);

router.post("/like/:id", verifyToken, postController.likePost);
router.delete("/like/:id", verifyToken, postController.unlikePost);
router.get(
  "/liked/:id",
  optionallyVerifyToken,
  postController.getUserLikedPosts
);

module.exports = router;

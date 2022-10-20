const express = require("express");
const router = express.Router();
const {verifyTokenAdmin} = require("../middlewares/auth");

const adminController = require("../controllers/adminController");

router.get("/posts/search",verifyTokenAdmin, adminController.searchPostsByTitle);
router.get("/posts",verifyTokenAdmin, adminController.getAllPosts);
router.delete("/posts/:id",verifyTokenAdmin, adminController.deletePostById);
router.get("/users",verifyTokenAdmin, adminController.getAllUsers);
router.put("/users/status/:id",verifyTokenAdmin, adminController.setUserInactiveById);
router.get("/users/search",verifyTokenAdmin, adminController.searchUsersByUsername);
router.get("/posts/:id",verifyTokenAdmin, adminController.getPostById);
router.get("/users/:id",verifyTokenAdmin, adminController.getUserById);


module.exports = router;

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/loginGoogle", authController.loginGoogle)
router.get('/profile/:id',authController.profileUser)
router.put('/profile/:id',authController.updateUser)
router.put('/profile/resetPassword/:id',authController.resetPassword)

module.exports = router;

const express = require("express");
const notificationController = require("../controllers/notificationController");
const router = express.Router();
const {verifyToken, optionallyVerifyToken} = require("../middlewares/auth");

router.get("/",verifyToken,notificationController.getMyNotifications)

module.exports = router;
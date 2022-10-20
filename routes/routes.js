const express = require("express");
const router = express();

const authRouter = require("./authRouter");
const postRouter = require("./postRouter");
const adminRouter = require("./adminRouter");
const tagRouter = require("./tagRouter");
const notificationRouter = require("./notificationRoute");
const commentRouter = require("./commentRouter");

router.use("/auth", authRouter);
router.use("/posts", postRouter);
router.use("/admin", adminRouter);
router.use("/tags", tagRouter);
router.use("/notifications", notificationRouter);
router.use("/comments", commentRouter)

module.exports = router;

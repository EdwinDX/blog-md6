const Notification = require("../models/Notification");

const notificationController = {
    getMyNotifications: async(req,res) => {
        try {
            const userId = req.userId;
            const notifications = await Notification.find({user: userId})
            res.status(201).json({
                success: true,
                notifications: notifications
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error.",
              });
        }
        
    }
}

module.exports = notificationController

const User = require("../models/User");

const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const HTTP_STATUS_CODE_OK = 200;
const HTTP_STATUS_CODE_CREATED = 201;
const HTTP_STATUS_CODE_BAD_REQUEST = 400;
const HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR = 500;

const authController = {
  checkAdmin: async (req, res) => {
    const admin = await User.findOne({ username: "admin" });
    if (!admin) {
      const newAdmin = new User({
        username: "admin",
        password: "admin",
        _id: "adminc0422i1",
      });
      await newAdmin.save();
    }
  },

  register: async (req, res) => {
    const { username, password, email } = req.body;

    // Check for missing fields
    if (!username || !password || !email) {
      return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
        success: false,
        message: "Missing required parameter(s)",
      });
    }

    if (username === "admin") {
      return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
        success: false,
        message: "You are not allow to use 'admin' as username.",
      });
    }
    try {
      //Check if username taken
      const userByUsername = await User.findOne({ username });
      if (userByUsername) {
        return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
          success: false,
          message: "Username already taken.",
        });
      }

      //Check if email taken
      const userByEmail = await User.findOne({ email });
      if (userByEmail) {
        return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
          success: false,
          message: "Email already taken.",
        });
      }

      // If all good, hash password
      const hashedPassword = await argon2.hash(password);
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();

      // Done created
      return res.status(HTTP_STATUS_CODE_CREATED).json({
        success: true,
        message: "User created successfully.",
        data: newUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error." + error.message,
      });
    }
  },

  login: async (req, res) => {
    await authController.checkAdmin();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
        success: false,
        message: "Missing required parameter(s)",
      });
    }

    if (username === "admin" && password === "admin") {
      const admin = await User.findOne({ username: "admin" });
      const accessToken = jwt.sign(
        { userId: admin._id, isAdmin: true },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      return res.status(HTTP_STATUS_CODE_OK).json({
        success: true,
        message: "Logged in successfully with Admin.",
        accessToken,
        username: admin.username,
      });
    } else {
      try {
        //Check if username exists
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
            success: false,
            message: "Incorrect username.",
          });
        }

        //Check if password matches
        const verifiedPassword = await argon2.verify(user.password, password);

        if (!verifiedPassword) {
          return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
            success: false,
            message: "Incorrect password.",
          });
        }
        if (user.status === "Inactive") {
          return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
            success: false,
            message: "Inactive Account",
          });
        }

        //If all good, return token
        const accessToken = jwt.sign(
          { userId: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "24h" }
        );
        return res.status(HTTP_STATUS_CODE_OK).json({
          success: true,
          message: "User logged in successfully.",
          accessToken,
          idUser: user._id,
          username: user.username,
          avatar: user.avatar,
          fullname: user.fullname,
        });
      } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Internal server error.",
        });
      }
    }
  },
  loginGoogle: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.googleId });
      if (!user) {
        const newUser = {
          username: req.body.googleId,
          password: "123456A",
          fullname: req.body.name,
          email: req.body.email,
          avatar: req.body.imageUrl,
        };
        newUser.password = await argon2.hash(newUser.password);
        await User.create(newUser);
        const accessToken = jwt.sign(
          { userId: newUser._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
        );
        return res.status(HTTP_STATUS_CODE_OK).json({
          success: true,
          message: "User logged in successfully.",
          accessToken,
          idUser: user._id,
          username: user.username,
          avatar: user.avatar,
          fullname: user.fullname,
        });
      } else {
        try {
          if (user.status === "Inactive") {
            return res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({
              success: false,
              message: "Inactive Account",
            });
          }

          //If all good, return token
          const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
          );
          return res.status(HTTP_STATUS_CODE_OK).json({
            success: true,
            message: "User logged in successfully.",
            accessToken,
            idUser: user._id,
            username: user.username,
            avatar: user.avatar,
            fullname: user.fullname,
          });
        } catch (error) {
          console.log(error);
          return res.status(HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error.",
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  profileUser: async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    try {
      if (user) {
        res.json({
          success: true,
          data: user,
          message: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  updateUser: async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id);
    try {
      if (user) {
        user.fullname = req.body.fullname || user.fullname;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.address = req.body.address || user.address;
        user.avatar = req.body.avatar || user.avatar;

        const updateUser = await user.save();
        res.json(updateUser);
      } else {
        res.status(404).json({
          success: false,
          message: "User does not exist",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  resetPassword: async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id);
    try {
      const { password } = req.body;
      console.log(password);
        const hashedPassword = await argon2.hash(password);
        user.password = hashedPassword;
        console.log(user);
        currentUser = await user.save();
        return res.status(HTTP_STATUS_CODE_OK).json({
          currentUser,
          success: true,
          message: "Reset password successfully.",
        });
    } catch (err) {
      return res.status(HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },
};

module.exports = authController;

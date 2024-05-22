const bcrypt = require("bcrypt");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");
const BlogDetails = require("../model/BlogDetails");
const axios = require("axios");
const isJSON = require("../utils/isJSON");

exports.register = async (req, res) => {
  const UserDetail = req.body;
  const profilePicture = req.files[0].filename;
  try {
    if (UserDetail.password !== UserDetail.password_repeat)
      return res.render("signUpPage", {
        message: "Password Mismatch",
      });
    if (!UserDetail.username || !UserDetail.password)
      return res.render("signUpPage", {
        message: "Username and password are required.",
      });
    const duplicate = await User.findOne({
      username: UserDetail.username,
    }).exec();
    if (duplicate)
      return res.render("signUpPage", {
        message: "username already Exist",
      });
    const hashedPassword = await bcrypt.hash(UserDetail.password, 10);
    const user = new User({
      username: UserDetail.username,
      fullname: UserDetail.fullname,
      email: UserDetail.email,
      roles: UserDetail.roles,
      bio: UserDetail.bio,
      security_question: UserDetail.security_question,
      security_answer: UserDetail.security_answer,
      phone_number: UserDetail.phone_number,
      interested_in: UserDetail.interested_in,
      media_location: profilePicture,
      user_location: UserDetail.user_location,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "user registered successfully" });
  } catch (error) {
    console.log(error);
    res.render("signUpPage", {
      message: "Internal server error",
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const roles = Object.values(user.roles);

    const accessToken = jwt.sign(
      {
        userInfo: {
          username: username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      {
        username: username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const otherUsers = await User.find({ username: { $ne: user.username } });
    const currentUser = { ...user.toObject(), refreshToken };
    const updatedUsers = [...otherUsers, currentUser];
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(updatedUsers)
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    try {
      const response = await axios.get(
        "http://localhost:3500/post/getAllPost/login"
      );
      const data = response.data;
      if (isJSON(response)) {
        res.render("home", {
          pageType: "home",
          items: data,
          datafound: data.length > 0,
        });
      } else {
        res.render("home", {
          pageType: "home",
          items: [],
          datafound: false,
        });
      }
    } catch (err) {
      res.render("home", {
        pageType: "home",
        items: [],
        datafound: false,
      });
    }
  } catch (error) {
    console.log(error);
    if (!res.headersSent)
      res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUsers = async (req, res) => {
  const users = await User.find({});
  if (users.length === 0) {
    return res.status(404).json({ message: "No users found." });
  }
  res.render("allUsersDetails", { users: users, currentUser: "yadavmoh91" });
};
exports.UpdateUsers = async (req, res) => {
  const body = req.body;

  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ message: "Please provide the value" });
  }
  const { username } = body;

  try {
    const userDetail = await User.findOne({ username }).exec();
    if (!userDetail) {
      return res.status(404).json({ message: "User not found." });
    }
    const operation = req.params.operation;

    if (body.followers !== undefined) {
      if (operation === "add") {
        userDetail.followers += body.followers;
        userDetail.followersList.push(body.followerId);
      } else {
        userDetail.followers -= body.followers;
        userDetail.followersList = userDetail.followersList.filter(
          (item) => item !== body.followerId
        );
      }

      await userDetail.save();
      return res.status(200).json({ message: "follower added" });
    }
    if (body.likes !== undefined) {
      userDetail.likes += body.likes;
      await userDetail.save();
      return res.status(200).json({ message: "Likes added" });
    }

    if (body.email) userDetail.email = body.email;
    if (body.password) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      userDetail.password = hashedPassword;
    }
    if (body.phone_number) userDetail.phone_number = body.phone_number;
    if (body.user_location) userDetail.user_location = body.user_location;

    userDetail.updateDate = Date.now();

    await userDetail.save();
    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

exports.DeleteUser = async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user details
    const userDetail = await User.findOne({ username }).exec();

    // If user not found, return appropriate response
    if (!userDetail) {
      return res.status(404).json({ error: "User not found." });
    }

    // Find all posts related to the user
    const postDetails = await BlogDetails.Post.find({ username }).exec();

    // If posts are found, delete each post
    if (postDetails.length > 0) {
      await Promise.all(
        postDetails.map(async (post) => {
          const commentDetails = await BlogDetails.Comment.find({
            post_id: post.post_id,
          }).exec();

          await Promise.all(
            commentDetails.map(async (comment) => {
              await comment.deleteOne();
            })
          );
          await post.deleteOne();
        })
      );
    }

    // Delete the user
    await userDetail.deleteOne();

    // Respond with success message
    res.json({ message: "User and related posts deleted successfully." });
  } catch (error) {
    // Handle errors
    console.error("Error deleting user and related posts:", error);
    res.status(500).json({
      error: "An error occurred while deleting user and related posts.",
    });
  }
};

exports.getUser = async (req, res) => {
  const { username } = req.body;
  const userDetail = await User.findOne({ username });
  if (!userDetail) return res.status(204).json({ message: "user not found" });
  res.json(userDetail);
};

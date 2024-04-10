const bcrypt = require("bcrypt");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");

exports.register = async (req, res) => {
  const UserDetail = req.body;
  try {
    if (!UserDetail.username || !UserDetail.password)
      return res
        .status(400)
        .json({ message: "Username and password are required." });

    const duplicate = await User.findOne({
      username: UserDetail.username,
    }).exec();
    if (duplicate)
      return res.status(409).json({ message: "username already defined" });

    const hashedPassword = await bcrypt.hash(UserDetail.password, 10);

    const user = new User({
      username: UserDetail.username,
      email: UserDetail.email,
      roles: UserDetail.roles,
      security_question: UserDetail.security_question,
      security_answer: UserDetail.security_answer,
      phone_number: UserDetail.phone_number,
      interested_in: UserDetail.interested_in,
      user_location: UserDetail.user_location,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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

    res.status(200).json({ message: "login success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  console.log(users);
  if (users.length === 0) {
    return res.status(404).json({ message: "No users found." });
  }
  res.status(200).json(users);
};

exports.UpdateUsers = async (req, res) => {
  const { username } = req.body;
  const userDetail = await User.findOne({ username }).exec();
  if (!userDetail) return res.status(204).json({ message: " not found.." });
  if (req.body?.email) userDetail.email = req.body.email;
  if (req.body?.password) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    userDetail.password = hashedPassword;
  }
  if (req.body?.phone_number) userDetail.phone_number = req.body.phone_number;
  if (req.body?.user_location)
    userDetail.user_location = req.body.user_location;
  userDetail.updateDate = Date.now();
  res.json({ message: "user updated successfully" });
  userDetail.save();
};

exports.DeleteUser = async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user details
    const userDetail = await User.findOne({ username }).exec();

    // If user not found, return appropriate response
    if (!userDetail) {
      return res.status(204).json({ message: "User not found." });
    }

    // Find all posts related to the user
    const blogDetailSchema = require("../model/BlogDetails");
    const postDetails = await blogDetailSchema.Post.find({ username }).exec();

    // If posts are found, delete each post
    if (postDetails.length > 0) {
      await Promise.all(
        postDetails.map(async (post) => {
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
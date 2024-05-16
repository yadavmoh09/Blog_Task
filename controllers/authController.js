const bcrypt = require("bcrypt");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");
const BlogDetails = require("../model/BlogDetails");

exports.register = async (req, res) => {
  const UserDetail = req.body;
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
    res.redirect("/");
  } catch (error) {
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
    res.render("home", {
      accessToken: accessToken,
    });
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
  res.json(userDetail);
  userDetail.save();
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

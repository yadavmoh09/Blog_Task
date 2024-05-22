const mongoose = require("mongoose");
const express = require("express");
const User = require("../model/User");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const axios = require("axios");
const isJSON = require("../utils/isJSON");

// const router = express.Router();

// Load the schema definition
const blogDetailSchema = require("../model/BlogDetails");
// const { post } = require("../routes/postAuth");

// Route to create users, posts, and categories
const createPost = async (req, res) => {
  try {
    const body = req.body;
    const files = req.files;
    if (body) {
      const cookies = req.cookies;
      if (!cookies?.jwt) return res.sendStatus(401);
      const refreshToken = cookies.jwt;
      const userLogin = await User.findOne({ refreshToken });
      const currentUser = userLogin.username;
      const separetedTags = body.tags.split("#").map((tag) => tag.trim());
      const mediaLocations = files.map((file) => file.filename);

      await blogDetailSchema.Post.create({
        username: currentUser,
        title: body.title,
        content: { media_location: mediaLocations, text: body.aritcal_text },
        post_id: uuidv4(),
        location: body.location,
        tags: separetedTags,
      });
    }
    res.status(201).send("Documents created successfully");
  } catch (error) {
    console.error("Error creating documents:", error);
    res.status(400).send("Error creating documents");
  }
};
const getAllPost = async (req, res) => {
  const Operation = req.params.Operation;
  try {
    const userPosts = await blogDetailSchema.Post.find({});
    if (!userPosts || userPosts.length === 0) {
      return res.render("home", {
        pageType: "home",
        items: userPosts,
        datafound: false,
      });
    }
    if (Operation === "home")
      return res.render("home", {
        pageType: "home",
        items: userPosts,
        datafound: true,
      });
    res.json(userPosts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const getPostByID = async (req, res) => {
  const post_id = req.query.post_id;
  if (!post_id) return res.status(400).json({ error: "post Id required" });
  const foundPost = await blogDetailSchema.Post.find({ post_id });
  if (!foundPost || foundPost.length === 0)
    return res.status(400).json({ error: `post not found for ${post_id}` });
  res.render("singlePost", { item: foundPost });
};
const getPostByUserName = async (req, res) => {
  const operation = req.params.operation;
  const userName = req.params.username;

  // const cookies = req.cookies;
  // if (!cookies?.jwt) return res.sendStatus(401);
  // const refreshToken = cookies.jwt;

  // const userLogin = await User.findOne({ refreshToken });
  // console.log(userLogin.username);

  const usrPost = await blogDetailSchema.Post.find({
    username: userName,
  });
  if (!usrPost || usrPost.length === 0) {
    return res.render("home", {
      pageType: "personal",
      items: usrPost,
      datafound: false,
    });
  }
  if (operation === "getData") {
    return res.json(usrPost);
  } else if (operation === "home") {
    return res.render("home", {
      pageType: "home",
      items: usrPost,
      datafound: true,
    });
  }
  res.render("home", { pageType: operation, items: usrPost, datafound: true });
};
const deletePostByID = async (req, res) => {
  try {
    const post_id = req.body.post_id;
    const usrPost = await blogDetailSchema.Post.findOneAndDelete({
      post_id: post_id,
    });

    const getData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3500/post/userPost/getData"
        );
        return response;
      } catch (error) {
        throw new Error(`Failed to fetch data: ${error.message}`);
      }
    };

    const response = await getData();

    if (isJSON(response)) {
      res.render("home", {
        pageType: "personal",
        items: response.data,
        datafound: true,
      });
    } else {
      res.render("home", {
        pageType: "personal",
        items: [],
        datafound: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
};
const updatePost = async (req, res) => {
  const { post_id } = req.body;
  if (!post_id) return res.status(400).json({ error: "post_id required" });

  try {
    const foundPost = await blogDetailSchema.Post.findOne({ post_id: post_id });
    if (!foundPost)
      return res
        .status(404)
        .json({ error: `Post not found for ID ${post_id}` });

    if (req.body.title) foundPost.title = req.body.title;
    if (req.body.text) foundPost.text = req.body.text;
    if (req.body.location) foundPost.location = req.body.location;
    if (req.body.tags) foundPost.tags = req.body.tags;
    if (req.body.likes) foundPost.likes = req.body.likes;
    if (req.body.shares) foundPost.shares = req.body.shares;
    foundPost.updateDate = Date.now();

    await foundPost.save();

    res.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const deleteAllPost = async (req, res) => {
  const { username } = req.body;
  try {
    if (!username)
      return res.status(400).json({ error: "Username is required." });

    const foundPosts = await blogDetailSchema.Post.find({ username });

    if (!foundPosts || foundPosts.length === 0)
      return res
        .status(404)
        .json({ error: `No posts found for user ${username}.` });

    const numberOfPostsFound = foundPosts.length;

    // If posts are found, delete each post and its related comments
    await Promise.all(
      foundPosts.map(async (post) => {
        const commentDetails = await blogDetailSchema.Comment.find({
          post_id: post.post_id,
        }).exec();

        // Delete each comment related to the post
        await Promise.all(
          commentDetails.map(async (comment) => {
            await comment.deleteOne();
          })
        );

        // Delete the post itself
        await post.deleteOne();
      })
    );

    res.status(200).json({
      message: `${numberOfPostsFound} posts and related comments deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while deleting posts and related comments.",
      details: error,
    });
  }
};

// Apply middleware to set updateDate before sav
module.exports = {
  createPost,
  getAllPost,
  getPostByID,
  updatePost,
  deleteAllPost,
  getPostByUserName,
  deletePostByID,
};

const mongoose = require("mongoose");
const express = require("express");
const User = require("../model/User");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
// Load the schema definition
const blogDetailSchema = require("../model/BlogDetails");

// Middleware to set updateDate before saving
const setUpdateDate = (req, res, next) => {
  req.body.updateDate = new Date();
  next();
};

const insertComment = async (req, res) => {
  try {
    const { comments } = req.body;
    if (comments && Array.isArray(comments)) {
      // Iterate over each post asynchronously
      const cookies = req.cookies;
      if (!cookies?.jwt) return res.sendStatus(401);

      const refreshToken = cookies.jwt;
      const user = await User.findOne({ refreshToken });
      await Promise.all(
        comments.map(async (comment) => {
          try {
            const post = await blogDetailSchema.Post.findOne({
              post_id: comment.post_id,
            });
            if (post === null) {
              throw new Error("Post is not available...");
            }
            await blogDetailSchema.Comment.create({
              post_id: comment.post_id,
              text: comment.text,
              username: user.username,
            });
          } catch (error) {
            throw error;
          }
        })
      );
    }

    res.status(201).send("comment inserted successfully");
  } catch (error) {
    res.status(400).send("error while inserting the comments");
  }
};

// const getAllPost = async (req, res) => {
//   const { username } = req.body;
//   if (!username) {
//     console.error("Username is required");
//     return res.status(400).json({ error: "Username is required" });
//   }
//   try {
//     const userPosts = await blogDetailSchema.Post.find({ username });
//     if (!userPosts || userPosts.length === 0) {
//       return res
//         .status(404)
//         .json({ error: `No posts found for the user ${username}` });
//     }
//     res.json(userPosts);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// const getPostByID = async (req, res) => {
//   const { post_id } = req.body;
//   if (!post_id) return res.status(400).json({ error: "post Id required" });
//   const foundPost = await blogDetailSchema.Post.find({ post_id });
//   if (!foundPost || foundPost.length === 0)
//     return res.status(400).json({ error: `post not found for ${post_id}` });
//   res.json(foundPost);
// };

// const updatePost = async (req, res) => {
//   const { post_id } = req.body;
//   if (!post_id) return res.status(400).json({ error: "post_id required" });

//   try {
//     const foundPost = await blogDetailSchema.Post.findOne({ post_id: post_id });
//     if (!foundPost)
//       return res
//         .status(404)
//         .json({ error: `Post not found for ID ${post_id}` });

//     if (req.body.title) foundPost.title = req.body.title;
//     if (req.body.text) foundPost.text = req.body.text;
//     if (req.body.location) foundPost.location = req.body.location;
//     if (req.body.tags) foundPost.tags = req.body.tags;
//     if (req.body.likes) foundPost.likes = req.body.likes;
//     if (req.body.shares) foundPost.shares = req.body.shares;
//     foundPost.updateDate = Date.now();

//     await foundPost.save();

//     res.json({ message: "Post updated successfully" });
//   } catch (error) {
//     console.error("Error updating post:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// const deleteAllPost = async (req, res) => {
//   const { username } = req.body;
//   try {
//     if (!username) return res.status(400).json({ error: "user name required" });
//     const foundPost = await blogDetailSchema.Post.find({ username });
//     if (!foundPost || foundPost.length === 0)
//       return res.status(400).json({ error: `post not found for ${username}` });
//     const numberOfPostFound = foundPost.length;
//     // If posts are found, delete each post
//     if (foundPost.length > 0) {
//       await Promise.all(
//         foundPost.map(async (post) => {
//           await post.deleteOne();
//         })
//       );
//     }
//     res
//       .status(200)
//       .json({ message: `${numberOfPostFound} post deleted successfully` });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// };

// Apply middleware to set updateDate before sav
module.exports = {
  setUpdateDate,
  insertComment,
};

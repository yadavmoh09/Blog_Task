const mongoose = require("mongoose");
const express = require("express");
const User = require("../model/User");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const axios = require("axios");
// const router = express.Router();

// Load the schema definition
const blogDetailSchema = require("../model/BlogDetails");
// const { post } = require("../routes/postAuth");

// Route to create users, posts, and categories
const createPost = async (req, res) => {
  try {
    const { posts } = req.body;
    // Create posts
    if (posts && Array.isArray(posts)) {
      // Iterate over each post asynchronously
      const cookies = req.cookies;
      if (!cookies?.jwt) return res.sendStatus(401);
      const refreshToken = cookies.jwt;
      const userLogin = await User.findOne({ refreshToken });
      await Promise.all(
        posts.map(async (post) => {
          // Create each post
          try {
            // Use findOne to find a user by username
            const user = await User.findOne({
              username: userLogin.username,
            });
            if (user === null) {
              throw new Error("User is not available...");
            }
            await blogDetailSchema.Post.create({
              username: userLogin.username,
              title: post.title,
              content: post.content,
              post_id: uuidv4(),
              location: post.location,
              tags: post.tags,
            });
          } catch (error) {
            console.error("Error finding user by username:", error);
            throw error; // Throw the error for handling elsewhere
          }
        })
      );
    }

    res.status(201).send("Documents created successfully");
  } catch (error) {
    console.error("Error creating documents:", error);
    res.status(400).send("Error creating documents");
  }
};

const getAllPost = async (req, res) => {
  // const { username } = req.body;
  // if (!username) {
  //   console.error("Username is required");
  //   return res.status(400).json({ error: "Username is required" });
  // }
  const Operation = req.params.Operation;
  try {
    const userPosts = await blogDetailSchema.Post.find({});
    if (!userPosts || userPosts.length === 0) {
      return res.status(404).json({ error: `No posts found` });
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

  console.log("getPostByUserName");
  console.log(operation);
  // const cookies = req.cookies;
  // if (!cookies?.jwt) return res.sendStatus(401);
  // const refreshToken = cookies.jwt;

  // const userLogin = await User.findOne({ refreshToken });
  // console.log(userLogin.username);

  const usrPost = await blogDetailSchema.Post.find({
    // username: userLogin.username,
    username: "yadavmoh91",
  });
  if (!usrPost || usrPost.length === 0)
    return res.render("home", {
      pageType: "personal",
      items: usrPost,
      datafound: false,
    });
  if (operation === "getData") {
    return res.json(usrPost);
  }
  res.render("home", { pageType: "personal", items: usrPost, datafound: true });
};
const deletePostByID = async (req, res) => {
  try {
    console.log("deletePostByID called");

    const post_id = req.body.post_id;
    console.log("post_id:", post_id);

    const usrPost = await blogDetailSchema.Post.findOneAndDelete({
      post_id: post_id,
    });
    console.log("Deleted Post:", usrPost);

    if (!usrPost) {
      console.log("Post not found");
      return res.status(404).send("Post not found");
    }

    const getData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3500/post/userPost/getData"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error.message);
        throw new Error(`Failed to fetch data: ${error.message}`);
      }
    };

    const userData = await getData();

    console.log("User Data:", userData);

    res.render("home", {
      pageType: "personal",
      items: userData,
      datafound: userData && userData.length > 0,
    });
  } catch (error) {
    console.error("Error in deletePostByID:", error);
    res.status(500).send("An error occurred");
  }
};

// const deletePostByID = async (req, res) => {
//   try {
//     console.log("deletePostByID called");

//     const post_id = req.body.post_id;
//     console.log("post_id:", post_id);

//     const usrPost = await blogDetailSchema.Post.findOneAndDelete({
//       post_id: post_id,
//     });
//     console.log("Deleted Post:", usrPost);

//     if (!usrPost) {
//       console.log("Post not found");
//       return res.status(404).send("Post not found");
//     }

//     const response = await nodeFetch(
//       "http://localhost:3500/post/getPostByUserName/getData"
//     );
//     const userData = await response.json();
//     console.log("User Data:", userData);

//     res.render("home", {
//       pageType: "personal",
//       items: userData,
//       datafound: userData && userData.length > 0,
//     });
//   } catch (error) {
//     console.error("Error in deletePostByID:", error);
//     res.status(500).send("An error occurred");
//   }
// };
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
//         postDetails.map(async (post) => {
//           const commentDetails = await blogDetailSchema.Comment.find({
//             post_id: post.post_id,
//           }).exec();

//           await Promise.all(
//             commentDetails.map(async (comment) => {
//               await comment.deleteOne();
//             })
//           );
//           await post.deleteOne();
//         })
//       );
//     }
//     res.status(200).json({
//       message: `${numberOfPostFound} post and related comments deleted successfully`,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// };

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

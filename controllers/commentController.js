const mongoose = require("mongoose");
const express = require("express");
const User = require("../model/User");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
// Load the schema definition
const blogDetailSchema = require("../model/BlogDetails");

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
    res.status(400).send("error while inserting the");
  }
};

const getAllComments = async (req, res) => {
  const { post_id } = req.body;
  if (!post_id) {
    return res.status(400).json({ error: "post ID is required" });
  }
  try {
    const foundComment = await blogDetailSchema.Comment.find({ post_id });
    if (!foundComment || foundComment.length === 0) {
      return res
        .status(404)
        .json({ error: `No Comment found on the Post ${post_id}` });
    }
    res.json(foundComment);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteComment = async (req, res) => {
  const { comment_id } = req.body;

  if (!comment_id)
    return res.status(400).json({ error: "comment ID requried" });

  const foundComment = await blogDetailSchema.Comment.findOne({ comment_id });
  if (!foundComment || foundComment.length)
    return res
      .status(400)
      .json({ error: `Comment not found for ${comment_id}` });
  await foundComment.delete();
  res.status(200).json({ message: "comment deleted successfully" });
};

const modifyComment = async (req, res) => {
  const { comment_id } = req.body;
  if (!comment_id)
    return res.status(400).json({ error: "Comment id required" });

  try {
    const foundComment = await blogDetailSchema.Comment.findOne({
      comment_id: comment_id,
    });
    if (!foundComment)
      return res
        .status(404)
        .json({ error: `Comment not found for ID ${comment_id}` });

    if (req.body.text) foundComment.text = req.body.text;
    foundComment.updateDate = Date.now();
    await foundComment.save();

    res.json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating comment:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const deleteAllPostComment = async (req, res) => {
  const { post_id } = req.body;
  try {
    if (!post_id) return res.status(400).json({ error: "Post ID required" });
    const foundComment = await blogDetailSchema.Comment.find({ post_id });
    if (!foundComment || foundComment.length === 0)
      return res
        .status(400)
        .json({ error: `comment not found for ${post_id}` });
    const numberOfCommentFound = foundComment.length;
    // If Comment are found, delete
    if (foundComment.length > 0) {
      await Promise.all(
        foundComment.map(async (comment) => {
          await comment.deleteOne();
        })
      );
    }
    res.status(200).json({
      message: `${numberOfCommentFound} comments deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// Apply middleware to set updateDate before sav
module.exports = {
  insertComment,
  deleteAllPostComment,
  deleteComment,
  getAllComments,
  modifyComment,
};

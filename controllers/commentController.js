const mongoose = require("mongoose");
const express = require("express");
const User = require("../model/User");
const router = express.Router();

const BlogDetails = require("../model/BlogDetails");

const insertComment = async (req, res) => {
  try {
    const { comments } = req.body;
    if (comments && Array.isArray(comments)) {
      const cookies = req.cookies;
      if (!cookies?.jwt) return res.sendStatus(401);

      const refreshToken = cookies.jwt;
      const user = await User.findOne({ refreshToken });
      await Promise.all(
        comments.map(async (comment) => {
          try {
            const post = await BlogDetails.Post.findOne({
              post_id: comment.post_id,
            });
            if (post === null) {
              throw new Error("Post is not available...");
            }
            await BlogDetails.Comment.create({
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

    res.status(201).send("Comment inserted successfully");
  } catch (error) {
    console.error("Error inserting comment:", error.message);
    res.status(400).send("Error while inserting the comment");
  }
};

const getAllComments = async (req, res) => {
  const { post_id } = req.body;
  if (!post_id) {
    return res.status(400).json({ error: "Post ID is required" });
  }
  try {
    const foundComments = await BlogDetails.Comment.find({ post_id });
    if (!foundComments || foundComments.length === 0) {
      return res
        .status(404)
        .json({ error: `No comments found for the post ${post_id}` });
    }
    res.json(foundComments);
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteComment = async (req, res) => {
  const { comment_id } = req.body;

  if (!comment_id)
    return res.status(400).json({ error: "Comment ID required" });

  const foundComment = await BlogDetails.Comment.findOne({ comment_id });
  if (!foundComment)
    return res
      .status(400)
      .json({ error: `Comment not found for ID ${comment_id}` });

  await foundComment.delete();
  res.status(200).json({ message: "Comment deleted successfully" });
};

const modifyComment = async (req, res) => {
  const { comment_id } = req.body;
  if (!comment_id)
    return res.status(400).json({ error: "Comment ID required" });

  try {
    const foundComment = await BlogDetails.Comment.findOne({
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

const deleteAllPostComments = async (req, res) => {
  const { post_id } = req.body;
  try {
    if (!post_id) return res.status(400).json({ error: "Post ID required" });
    const foundComments = await BlogDetails.Comment.find({ post_id });
    if (!foundComments || foundComments.length === 0)
      return res
        .status(400)
        .json({ error: `Comments not found for ${post_id}` });

    const numberOfCommentsFound = foundComments.length;
    // If Comments are found, delete
    if (foundComments.length > 0) {
      await Promise.all(
        foundComments.map(async (comment) => {
          await comment.deleteOne();
        })
      );
    }
    res.status(200).json({
      message: `${numberOfCommentsFound} comments deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting comments:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  insertComment,
  deleteAllPostComments,
  deleteComment,
  getAllComments,
  modifyComment,
};

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  followersList: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    User: {
      type: Number,
      required: false,
    },
    Editor: {
      type: Number,
      required: false,
    },
    Admin: {
      type: Number,
      required: false,
    },
  },
  media_location: { type: String, required: false },
  followers: {
    type: Number,
    required: false,
    default: 0,
  },
  likes: {
    type: Number,
    required: false,
    default: 0,
  },
  security_question: {
    type: String,
    required: true,
  },
  security_answer: {
    type: String,
    required: true,
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  phone_number: {
    type: Number,
    required: true,
  },
  interested_in: {
    type: [String],
    required: false,
  },
  user_location: {
    type: String,
    required: false,
  },
  updateDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User_", userSchema);

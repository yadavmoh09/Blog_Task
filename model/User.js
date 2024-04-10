const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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

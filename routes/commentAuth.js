const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const verifyJWT = require("../middleware/verifyJWT");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");

router.post("/", commentController.insertComment);

module.exports = router;

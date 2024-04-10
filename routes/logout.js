const express = require("express");
const router = express.Router();
const logOutController = require("../controllers/logOutControaller");

router.get("/", logOutController.handleLogOut);

module.exports = router;

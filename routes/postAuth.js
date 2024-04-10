const express = require("express");
const router = express.Router();
const registerController = require("../controllers/createPost");

router.post("/", registerController.createDocuments);

module.exports = router;

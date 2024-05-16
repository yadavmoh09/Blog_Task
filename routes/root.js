const express = require("express");
const router = express.Router();

router.get("^/$|/index(.html)?", (req, res) => {
  res.render("login");
});

module.exports = router;

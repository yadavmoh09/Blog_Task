const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users", authController.getUsers);
router.put("/UpdateUsers", authController.UpdateUsers);
router.delete("/deleteUser", authController.DeleteUser);
router.get("/getUser", authController.getUser);

module.exports = router;

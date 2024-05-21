const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", upload, authController.register);
router.post("/login", authController.login);
router.get(
  "/users",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  authController.getUsers
);
router.put(
  "/UpdateUsers",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  authController.UpdateUsers
);
router.delete(
  "/deleteUser",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  authController.DeleteUser
);
router.get(
  "/getUser",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  authController.getUser
);

module.exports = router;

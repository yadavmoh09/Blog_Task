const express = require("express");
const router = express.Router();
const registerController = require("../controllers/createPost");
const verifyJWT = require("../middleware/verifyJWT");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");

router.post(
  "/",
  // verifyJWT,
  // verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
  registerController.createPost
);
router.get(
  "/getAllPost",
  // verifyJWT,
  // verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  registerController.getAllPost
);
router.get(
  "/getPost",
  // verifyJWT,
  // verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  registerController.getPostByID
);
router.put(
  "/updatePost",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
  registerController.updatePost
);
router.delete(
  "/deletePost",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
  registerController.deleteAllPost
);

module.exports = router;

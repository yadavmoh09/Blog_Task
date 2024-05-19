const express = require("express");
const router = express.Router();
const registerController = require("../controllers/createPost");
const verifyJWT = require("../middleware/verifyJWT");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/",
  upload.array("media_location", 10),
  // verifyJWT,
  // verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
  registerController.createPost
);
router.get(
  "/getAllPost/:Operation",
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
router.get("/userPost/:operation?", registerController.getPostByUserName);

router.post("/deleteUserPost", registerController.deletePostByID);
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

const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const verifyJWT = require("../middleware/verifyJWT");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");

router.post(
  "/",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  commentController.insertComment
);
router.delete(
  "/deletePostComments",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
  commentController.deleteAllPostComments
);
router.delete(
  "/deleteComment",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  commentController.deleteComment
);
router.get(
  "/getAllComments",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User),
  commentController.getAllComments
);
router.put(
  "/modifyComment",
  verifyJWT,
  verifyRoles(ROLES_LIST.User, ROLES_LIST.Admin),
  commentController.modifyComment
);

module.exports = router;

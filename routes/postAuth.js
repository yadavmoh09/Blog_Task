const express = require("express");
const router = express.Router();
const registerController = require("../controllers/createPost");
const verifyJWT = require("../middleware/verifyJWT");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");

router.post(
  "/",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
  registerController.createPost
);
router.get("/getAllPost", registerController.getAllPost);
router.get("/getPost", registerController.getPostByID);
router.put("/updatePost", registerController.updatePost);
router.delete("/deletePost", registerController.deleteAllPost);

module.exports = router;

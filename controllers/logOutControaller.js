const User = require("../model/User");
const fsPromises = require("fs").promises;
const path = require("path");

exports.handleLogOut = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;
  try {
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      return res.sendStatus(204); // No user found, just return 204 without clearing cookie
    }

    // Filter out the current user from the list of users and clear the refreshToken
    const otherUsers = await User.find({ _id: { $ne: foundUser._id } });
    const currentUser = { ...foundUser.toObject(), refreshToken: "" };
    const updatedUsers = [...otherUsers, currentUser];

    // Write updated user data to the file
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(updatedUsers)
    );

    // Clear the cookie
    res.clearCookie("jwt", { httpOnly: true });
    res.sendStatus(200); // Send success response
  } catch (err) {
    console.error(err);
    res.sendStatus(500); // Server error occurred
  }
};

const User = require("../model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.sendStatus(403);
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        console.log(decoded);
        if (err || user.username !== decoded.username) {
          return res.status(403).send("Forbidden");
        }
        const roles = Object.values(user.roles);

        const accessToken = jwt.sign(
          {
            UserInfo: {
              username: decoded.username,
              roles: roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        res.json({ accessToken });
      }
    );
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

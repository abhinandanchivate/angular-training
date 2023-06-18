// token has to be validated
// userid should be automatically added to the req.

const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/data.config");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");
  // if token  exists or not.

  if (!token) {
    res.status(401).json({ msg: "no Token, authorization denied" });
  }
  try {
    jwt.verify(token, jwtSecret, (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: "token not valid" });
      } else {
        req.user = decoded.user;
        next(); // req , res
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "server error: " + err.message });
  }
};

// register the user

const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwtSecret = require("../config/data.config");

// jwt Token
const jwtToken = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

//@Route : /users/register
//@Method : post
//@access : public

router.post(
  "/register",
  check("name", "name must be provided").notEmpty(),
  check("email", "email must be provided").isEmail(),
  check("password", "password min 6 chrs").isLength({ min: 6 }),
  async (req, res) => {
    console.log(jwtSecret);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // existing email id :
    try {
      let user2 = await User.findOne({ email });
      if (user2) {
        return res.status(400).json({ msg: "user already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);
      let user = new User({
        name,
        email,
        password: newPassword,
      });

      await user.save();

      const payload = { user: { id: user.id } };
      jwtToken.sign(
        payload,
        jwtSecret,
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) {
            throw err;
          } else res.json(token);
        }
      );
    } catch (err) {
      res.status(500).send("server error");
    }
    // name = req.body.name

    // payload, secretKey, expiration, handler
  }
);
//@route : /users
// @method : get
//@access : public
//@description : used for testing purpose. share the deatils of all.
router.get("", (req, res) => {
  res.json({ msg: "hello from user" });
});
module.exports = router;

// register the user

const express = require("express");
const router = express.Router();

//@route : /profile
// @method : get
//@access : public
//@description : used for testing purpose. share the deatils of all.
router.get("", (req, res) => {
  res.json({ msg: "hello from profile" });
});
module.exports = router;

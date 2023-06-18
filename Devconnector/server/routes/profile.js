// register the user

const express = require("express");
const auth = require("../middleware/auth");
const normailzeURL = require("normalize-url");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const userModel = require("../models/user");
const profileModel = require("../models/profile");
const normalizeUrl = require("normalize-url");
//@route : /profile
// @method : get
//@access : public
//@description : used for testing purpose. share the deatils of all.
// router.get("", (req, res) => {
//   res.json({ msg: "hello from profile" });
// });

//@endpoint : /profile
//@method : post
//description : create  profile
router.post(
  "/",
  check("status", "status is required").notEmpty(),
  check("skills", "skills are required").notEmpty(),
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructure the request
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    const profileFeilds = {
      //  user: "",
      website:
        website && website !== ""
          ? normalizeUrl(website, { forceHttps: true })
          : "",
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => "" + s.trim()),
      ...rest,
    };

    const socialFields = { linkedin, facebook, instagram, twitter, youtube };
    for (const [key, value] of Object.entries(socialFields)) {
      socialFields[key] = normailzeURL(value, { forceHttps: true });
    }

    profileFeilds.social = socialFields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await profileModel.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFeilds },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  } // actual userid should come from middleware

  //res.json({ msg: "hello from profile" });
);

//@endpoint : /profile
//@method : get
//description : get all  profile
router.get("/", async (req, res) => {
  try {
    const profiles = await profileModel.find();
    res.json(profiles);
  } catch (err) {}

  //res.json({ msg: "hello from profile" });
});
//@endpoint : /me
//@method : get
//description : get current user  profile
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await profileModel
      .findOne({
        user: req.user.id,
      })
      .populate("user", ["name"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: "server error" + err.message });
  }
});

//@endpoint : /profile/user/:userID
//@method : get
//description : get specific user's  profile
router.get("/user/:userID", ({ params: { userID } }, res) => {
  res.json({ userID });
});

//@endpoint : /profile
//@method : delete
//description : should delete user profile

router.delete("/", async (req, res) => {
  try {
    await Promise.all([
      profileModel.findOneAndRemove({ user: req.user.id }),
      userModel.findOneAndRemove({ _id: req.user.id }),
    ]);
    res.json({ msg: "profile deleted successfully" });
  } catch (err) {
    res.status(500).send("server error");
  }
});

//@endpoint : /profile/experience
//@method : put
//description : should update user profile for exp part.

router.put(
  "/experience",
  auth,
  check("title", "Title is required").notEmpty(),
  check("company", "Company is required").notEmpty(),
  check("from", "From date is required and needs to be from the past")
    .notEmpty()
    .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await profileModel.findOne({ user: req.user.id });

      profile.experience.unshift(req.body);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@endpoint : /profile/experience/:expId
//@method : delete
//description :delte on the basis of id
router.delete("/experience/:expId", auth, async (req, res) => {
  try {
    const foundProfile = await profileModel.findOne({ user: req.user.id });

    foundProfile.experience = foundProfile.experience.filter(
      (exp) => exp._id.toString() !== req.params.expId
    );

    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;

const router = require("express").Router();
const User = require("../models/userModal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;

    //validation
    if (!email || !password || !passwordVerify) {
      return res.status(400).json({
        error: "Missing fields",
      });
    }
    if (password.length >= 1 && password.length <= 8)
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });

    if (password !== passwordVerify)
      return res.status(400).json({
        error: "Please enter the same twice for verification",
      });

    //check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        error: "User already exists",
      });

    //hash password

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    //save user in DB
    const user = new User({
      email,
      passwordHash,
    });
    const savedUser = await user.save();

    //create a JWT token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
      })
      .send();
  } catch (e) {
    res.status(500).send();
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing fields",
      });
    }

    //get user account
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({
        error: "Wrong email or password",
      });
    const correctPassword = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!correctPassword)
      return res.status(400).json({
        error: "Wrong email or password",
      });

    //create a JWT token
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
      })
      .send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json(null);
    } else {
      const validateUser = jwt.verify(token, process.env.JWT_SECRET);
      res.json(validateUser.id);
    }
  } catch (e) {
    return res.json(null);
  }
});

router.get("/logOut", (req, res) => {
  try {
    res
      .cookie("token", "", {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
        expires: new Date(0),
      })
      .send();
  } catch (e) {
    return res.json(null);
  }
});

module.exports = router;

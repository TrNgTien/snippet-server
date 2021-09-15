const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const validateUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user.id = validateUser.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
module.exports = auth;

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const msg = err.name === "TokenExpiredError"
      ? "Session expired. Please log in again."
      : "Invalid token. Please log in again.";
    return res.status(401).json({ success: false, message: msg });
  }

  try {
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "Account no longer exists." });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated. Contact an admin." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware DB error:", err.message);
    return res.status(500).json({ success: false, message: "Authentication check failed." });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route requires: ${roles.join(" or ")} role.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };

const express = require("express");
const router = express.Router();
const {
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  googleCallback,
} = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Google OAuth routes
if (process.env.GOOGLE_CLIENT_ID) {
  const passport = require("../config/passport");
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  router.get("/google/callback", passport.authenticate("google", { session: false }), googleCallback);
}

// Protected routes (any authenticated user)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

// Admin-only routes
router.get("/admin/users", protect, authorizeRoles("admin"), getAllUsers);
router.post("/admin/users", protect, authorizeRoles("admin"), adminCreateUser);
router.put("/admin/users/:id", protect, authorizeRoles("admin"), adminUpdateUser);
router.delete("/admin/users/:id", protect, authorizeRoles("admin"), adminDeleteUser);

module.exports = router;

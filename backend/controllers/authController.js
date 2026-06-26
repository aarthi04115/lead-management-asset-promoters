const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const emailService = require("../services/emailService");
const otpUtils = require("../services/otpUtils");

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    if (!role || !["admin", "employee"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role selected." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    // Deliberate: same message for wrong email OR wrong password (prevents user enumeration)
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Incorrect email or password." });
    }

    // Validate that selected role matches user's actual role
    if (user.role !== role) {
      return res.status(403).json({ success: false, message: `Invalid role. Your account is registered as an ${user.role}.` });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated. Contact an admin." });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { user: buildUserPayload(user), token },
    });
  } catch (err) {
    console.error("loginUser:", err.message);
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    // req.user is already attached by protect middleware — no extra DB call needed
    return res.status(200).json({
      success: true,
      data: buildUserPayload(req.user),
    });
  } catch (err) {
    console.error("getProfile:", err.message);
    return res.status(500).json({ success: false, message: "Failed to load profile." });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: buildUserPayload(user),
    });
  } catch (err) {
    console.error("updateProfile:", err.message);
    return res.status(500).json({ success: false, message: "Profile update failed." });
  }
};

// GET /api/auth/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("getAllUsers:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

// POST /api/auth/admin/users
const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required." });
    }

    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken) {
      return res.status(409).json({ success: false, message: "That email is already registered." });
    }

    const user = await User.create({
      name: name.trim(),
      email,
      password,
      role: role === "admin" ? "admin" : "employee",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: buildUserPayload(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "That email is already registered." });
    }
    console.error("adminCreateUser:", err.message);
    return res.status(500).json({ success: false, message: "Failed to create user." });
  }
};

// PUT /api/auth/admin/users/:id
const adminUpdateUser = async (req, res) => {
  try {
    const { role, isActive, name } = req.body;

    // Prevent admin from deactivating or changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot modify your own account via this route." });
    }

    const patch = {};
    if (name && name.trim()) patch.name = name.trim();
    if (role && ["admin", "employee"].includes(role)) patch.role = role;
    if (typeof isActive === "boolean") patch.isActive = isActive;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided to update." });
    }

    const user = await User.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, message: "User updated.", data: buildUserPayload(user) });
  } catch (err) {
    console.error("adminUpdateUser:", err.message);
    return res.status(500).json({ success: false, message: "Failed to update user." });
  }
};

// DELETE /api/auth/admin/users/:id
const adminDeleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, message: "User deleted." });
  } catch (err) {
    console.error("adminDeleteUser:", err.message);
    return res.status(500).json({ success: false, message: "Failed to delete user." });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email." });
    }

    const otp = otpUtils.generate();
    const hashedOtp = otpUtils.hash(otp);

    await OTP.deleteMany({ email: email.toLowerCase(), purpose: "password_reset" });
    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOtp,
      purpose: "password_reset",
    });

    const result = await emailService.sendOTP(email, otp);
    if (!result.success) {
      return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
      data: { email: email.toLowerCase() },
    });
  } catch (err) {
    console.error("forgotPassword:", err.message);
    return res.status(500).json({ success: false, message: "Failed to process forgot password request." });
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: "password_reset",
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found or expired. Please request a new one." });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ success: false, message: "Too many attempts. Please request a new OTP." });
    }

    const hashedInputOtp = otpUtils.hash(otp);
    if (hashedInputOtp !== otpRecord.otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${otpRecord.maxAttempts - otpRecord.attempts} attempts remaining.`,
      });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const resetToken = jwt.sign(
      { email: email.toLowerCase(), purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified. You can now reset your password.",
      data: { resetToken, email: email.toLowerCase() },
    });
  } catch (err) {
    console.error("verifyOTP:", err.message);
    return res.status(500).json({ success: false, message: "Failed to verify OTP." });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Reset token and password are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ success: false, message: "Invalid reset token." });
    }

    const user = await User.findOne({ email: decoded.email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    await emailService.sendPasswordChangeNotification(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (err) {
    console.error("resetPassword:", err.message);
    return res.status(500).json({ success: false, message: "Failed to reset password." });
  }
};

// POST /api/auth/change-password (requires authentication)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All password fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: "New password must be different from current password." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    await emailService.sendPasswordChangeNotification(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err) {
    console.error("changePassword:", err.message);
    return res.status(500).json({ success: false, message: "Failed to change password." });
  }
};

// GET /api/auth/google/callback
const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ success: false, message: "Authentication failed." });
    }

    const token = signToken(req.user._id, req.user.role);
    req.user.lastLogin = new Date();
    await req.user.save({ validateBeforeSave: false });

    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/?token=${token}&user=${encodeURIComponent(JSON.stringify(buildUserPayload(req.user)))}`);
  } catch (err) {
    console.error("googleCallback:", err.message);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=auth_failed`);
  }
};

module.exports = {
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
};

const express = require("express");
const router = express.Router();
const { createFollowUp, getFollowUps } = require("../controllers/followUpController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, createFollowUp)
    .get(getFollowUps);

module.exports = router;

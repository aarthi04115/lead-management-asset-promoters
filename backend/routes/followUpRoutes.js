const express = require("express");
const router = express.Router();
const { createFollowUp, getFollowUps, updateFollowUp, deleteFollowUp } = require("../controllers/followUpController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, createFollowUp)
    .get(getFollowUps);

router.route("/:id")
    .put(protect, updateFollowUp)
    .delete(protect, deleteFollowUp);

module.exports = router;

const express = require("express");
const router = express.Router();
const { createLead, getLeads, updateLeadStatus } = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");

// All lead routes are protected
router.use(protect);

router.route("/")
    .post(createLead)
    .get(getLeads);

router.patch("/:id/status", updateLeadStatus);

module.exports = router;

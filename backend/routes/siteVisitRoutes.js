const express = require("express");
const router = express.Router();
const { createSiteVisit, getSiteVisits } = require("../controllers/siteVisitController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, createSiteVisit)
    .get(getSiteVisits);

module.exports = router;

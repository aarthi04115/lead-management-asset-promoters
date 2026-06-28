const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
    createSiteVisit,
    getAllVisits,
    approveVisit,
    rejectVisit,
    deleteVisit
} = require("../controllers/siteVisitController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, upload.single("selfieImage"), createSiteVisit)
    .get(protect, getAllVisits);

router.put("/:id/approve", protect, approveVisit);
router.put("/:id/reject", protect, rejectVisit);
router.delete("/:id", protect, deleteVisit);

module.exports = router;

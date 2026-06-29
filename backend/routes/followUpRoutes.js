const express = require("express");
const router = express.Router();
const {
    getFollowUps,
    getNextFollowUp,
    getLatestByCustomer,
    getReminders,
    getUpcomingReminders,
    getStats,
    filterFollowUps,
    createFollowUp,
    updateFollowUp,
    markAsCompleted,
    deleteFollowUp
} = require("../controllers/followUpController");
const { protect } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/rbacMiddleware");

router.use(protect);

router.get("/next", checkPermission("view_followups"), getNextFollowUp);
router.get("/latest", checkPermission("view_followups"), getLatestByCustomer);
router.get("/reminders", checkPermission("view_followups"), getReminders);
router.get("/upcoming", checkPermission("view_followups"), getUpcomingReminders);
router.get("/kpis", checkPermission("view_followups"), getStats);
router.get("/filter", checkPermission("view_followups"), filterFollowUps);

router.route("/")
    .get(checkPermission("view_followups"), getFollowUps)
    .post(checkPermission("create_followup"), createFollowUp);

router.route("/:id")
    .put(checkPermission("update_followup_status"), updateFollowUp)
    .delete(checkPermission("delete_followup"), deleteFollowUp);

router.patch("/:id/complete", checkPermission("complete_followup"), markAsCompleted);

module.exports = router;

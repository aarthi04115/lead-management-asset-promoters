const express = require("express");
const router = express.Router();
const {
    createLead,
    getLeads,
    getLeadById,
    updateLeadStatus,
    updateLead,
    deleteLead,
    addLeadNote
} = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/rbacMiddleware");

router.use(protect);

router.route("/")
    .post(checkPermission("create_lead"), createLead)
    .get(checkPermission("view_leads"), getLeads);

router.route("/:id")
    .get(checkPermission("view_leads"), getLeadById)
    .put(checkPermission("edit_lead"), updateLead)
    .delete(checkPermission("delete_lead"), deleteLead);

router.route("/:id/status")
    .put(checkPermission("update_lead_status"), updateLeadStatus)
    .patch(checkPermission("update_lead_status"), updateLeadStatus);

router.route("/:id/notes")
    .post(checkPermission("edit_lead"), addLeadNote);

module.exports = router;

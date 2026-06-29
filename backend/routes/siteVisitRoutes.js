const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
    createSiteVisit,
    getAllVisits,
    getVisitById,
    approveVisit,
    rejectVisit,
    updateVisit,
    deleteVisit
} = require("../controllers/siteVisitController");
const { protect } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/rbacMiddleware");

router.use(protect);

// Employee submits visit: requires create_sitevisit action permission
router.post("/", checkPermission("create_sitevisit"), upload.single("selfieImage"), createSiteVisit);

// Get visits: requires view_sitevisits permission
router.get("/", checkPermission("view_sitevisits"), getAllVisits);

// Get single visit: requires view_sitevisits permission
router.get("/:id", checkPermission("view_sitevisits"), getVisitById);

// Approve/Reject/Update status: requires verify_sitevisit permission
router.put("/:id/approve", checkPermission("verify_sitevisit"), approveVisit);
router.put("/:id/reject", checkPermission("verify_sitevisit"), rejectVisit);

// Update details/remarks: requires create_sitevisit permission
router.put("/:id", checkPermission("create_sitevisit"), updateVisit);

// Delete visit: requires delete_sitevisit permission
router.delete("/:id", checkPermission("delete_sitevisit"), deleteVisit);

module.exports = router;

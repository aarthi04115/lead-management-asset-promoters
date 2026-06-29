const express = require("express");
const router = express.Router();
const {
    createProperty,
    getProperties,
    getPropertyStats,
    getPropertyById,
    updateProperty,
    deleteProperty
} = require("../controllers/propertyController");
const { protect } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/rbacMiddleware");

router.use(protect);

router.get("/stats", checkPermission("view_properties"), getPropertyStats);

router.route("/")
    .post(checkPermission("create_property"), createProperty)
    .get(checkPermission("view_properties"), getProperties);

router.route("/:id")
    .get(checkPermission("view_properties"), getPropertyById)
    .put(checkPermission("edit_property"), updateProperty)
    .delete(checkPermission("delete_property"), deleteProperty);

module.exports = router;

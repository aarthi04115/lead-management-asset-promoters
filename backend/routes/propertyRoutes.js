const express = require("express");
const router = express.Router();
const {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} = require("../controllers/propertyController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, createProperty)
    .get(protect, getProperties); // Protect GET to align with existing LuxeCRM pattern

router.route("/:id")
    .get(protect, getPropertyById)
    .put(protect, updateProperty)
    .delete(protect, deleteProperty);

module.exports = router;

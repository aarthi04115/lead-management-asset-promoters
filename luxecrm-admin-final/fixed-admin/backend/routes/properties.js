const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

// GET all properties (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { status, category, location, search } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;
    if (category && category !== "All") filter.category = category;
    if (location && location !== "All Locations") filter.location = new RegExp(location, "i");
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
      ];
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats (for admin dashboard)
router.get("/stats", async (req, res) => {
  try {
    const total = await Property.countDocuments();
    const available = await Property.countDocuments({ status: "Available" });
    const booked = await Property.countDocuments({ status: "Booked" });
    const negotiation = await Property.countDocuments({ status: "Negotiation" });

    res.json({
      success: true,
      data: { total, available, booked, negotiation },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single property by ID
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    res.json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create new property
router.post("/", async (req, res) => {
  try {
    const property = new Property(req.body);
    const saved = await property.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update property by ID
router.put("/:id", async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Property not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE property by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Property not found" });
    res.json({ success: true, message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

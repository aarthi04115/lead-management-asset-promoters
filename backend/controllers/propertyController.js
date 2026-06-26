const Property = require("../models/Property");

// Create a new property
exports.createProperty = async (req, res) => {
    try {
        const property = await Property.create({
            ...req.body,
            assignedTo: req.user ? req.user._id : null
        });
        res.status(201).json({ success: true, data: property });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Retrieve all properties
exports.getProperties = async (req, res) => {
    try {
        const properties = await Property.find().populate('assignedTo', 'name email').sort("-createdAt");
        res.status(200).json({ success: true, data: properties });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Retrieve a single property by ID
exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('assignedTo', 'name email');
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }
        res.status(200).json({ success: true, data: property });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update an existing property
exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }
        res.status(200).json({ success: true, data: property });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete a property
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

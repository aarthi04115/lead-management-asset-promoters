const Property = require("../models/Property");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Admin Only)
exports.createProperty = asyncHandler(async (req, res) => {
    // If beds/baths/sqft aliases are passed, populate the canonical fields
    if (req.body.beds && !req.body.bedrooms) req.body.bedrooms = req.body.beds;
    if (req.body.baths && !req.body.bathrooms) req.body.bathrooms = req.body.baths;
    if (req.body.sqft && !req.body.area) req.body.area = req.body.sqft;

    const property = await Property.create({
        ...req.body,
        assignedTo: req.user ? req.user._id : null
    });
    res.status(201).json({ success: true, data: property });
});

// @desc    Retrieve all properties (with filtering)
// @route   GET /api/properties
// @access  Private (Admin/Employee)
exports.getProperties = asyncHandler(async (req, res) => {
    const { status, type, category, location, search } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;

    // Support category as an alias of type
    const targetType = type || category;
    if (targetType && targetType !== "All") filter.type = targetType;

    if (location && location !== "All Locations") {
        filter.location = { $regex: location, $options: "i" };
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
        ];
    }

    const properties = await Property.find(filter)
        .populate('assignedTo', 'name email')
        .sort("-createdAt");

    res.status(200).json({ success: true, count: properties.length, data: properties });
});

// @desc    Retrieve property statistics
// @route   GET /api/properties/stats
// @access  Private (Admin/Employee)
exports.getPropertyStats = asyncHandler(async (req, res) => {
    const total = await Property.countDocuments();
    const available = await Property.countDocuments({ status: "Available" });
    const booked = await Property.countDocuments({ status: "Booked" });
    const negotiation = await Property.countDocuments({ status: "Negotiation" });

    res.status(200).json({
        success: true,
        data: { total, available, booked, negotiation }
    });
});

// @desc    Retrieve a single property by ID
// @route   GET /api/properties/:id
// @access  Private (Admin/Employee)
exports.getPropertyById = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id).populate('assignedTo', 'name email');
    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }
    res.status(200).json({ success: true, data: property });
});

// @desc    Update an existing property
// @route   PUT /api/properties/:id
// @access  Private (Admin Only)
exports.updateProperty = asyncHandler(async (req, res) => {
    // If beds/baths/sqft aliases are passed, populate canonical fields
    if (req.body.beds && !req.body.bedrooms) req.body.bedrooms = req.body.beds;
    if (req.body.baths && !req.body.bathrooms) req.body.bathrooms = req.body.baths;
    if (req.body.sqft && !req.body.area) req.body.area = req.body.sqft;

    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }
    res.status(200).json({ success: true, data: property });
});

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Admin Only)
exports.deleteProperty = asyncHandler(async (req, res) => {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }
    res.status(200).json({ success: true, data: {} });
});

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Lead = require("../models/Lead");
const Property = require("../models/Property");
const FollowUp = require("../models/FollowUp");
const SiteVisit = require("../models/SiteVisit");

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await User.deleteMany();
        await Lead.deleteMany();
        await Property.deleteMany();
        await FollowUp.deleteMany();
        await SiteVisit.deleteMany();
        console.log("Cleared existing data.");

        // 1. Create Admin & Employee
        const admin = await User.create({
            name: "Admin User",
            email: "admin@crm.com",
            password: "password123",
            role: "admin",
            isActive: true
        });

        const employee = await User.create({
            name: "Emily Watson",
            email: "emily@crm.com",
            password: "password123",
            role: "employee",
            isActive: true
        });
        console.log("Users created.");

        // 2. Create Properties
        const properties = await Property.insertMany([
            {
                title: "Skyline Penthouse 4B",
                location: "Manhattan, NY",
                price: "$8,200,000",
                type: "Residential",
                status: "Available",
                assignedTo: admin._id
            },
            {
                title: "Sunset Waterfront Villa",
                location: "Miami, FL",
                price: "$4,500,000",
                type: "Resort",
                status: "Available",
                assignedTo: employee._id
            },
            {
                title: "Historic Downtown Loft",
                location: "Chicago, IL",
                price: "$1,200,000",
                type: "Historic",
                status: "Negotiation",
                assignedTo: admin._id
            }
        ]);
        console.log("Properties seeded.");

        // 3. Create Leads
        const leads = await Lead.insertMany([
            {
                name: "Michael Aris",
                email: "m.aris@email.com",
                phone: "+1 (555) 123-4567",
                property: "Skyline Penthouse 4B",
                source: "Website",
                status: "Interested",
                assignedTo: admin._id,
                notes: "High intent customer looking for Manhattan properties."
            },
            {
                name: "Sarah Jenkins",
                email: "sarah.j@email.com",
                phone: "+1 (555) 987-6543",
                property: "Sunset Waterfront Villa",
                source: "Zillow",
                status: "New",
                assignedTo: employee._id
            }
        ]);
        console.log("Leads seeded.");

        // 4. Create Follow-ups
        await FollowUp.insertMany([
            {
                customerName: "Michael Aris",
                schedule: new Date(Date.now() + 86400000), // Tomorrow
                type: "Call",
                notes: "Discuss mortgage options",
                status: "Planned",
                assignedTo: admin._id
            }
        ]);
        console.log("Follow-ups seeded.");

        console.log("Seeding complete! 🌱");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seedDB();

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
        const leads = await Lead.create([
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
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        await FollowUp.insertMany([
            {
                customerName: "Karthik Menon",
                property: "Skyline Heights 3BHK",
                phone: "+91 9800 0000",
                whatsapp: "+91 9700 0000",
                schedule: new Date(today.setHours(9, 0, 0, 0)),
                type: "Call",
                notes: "Discussed pricing flexibility and requested callback.",
                status: "Upcoming",
                priority: "High",
                assignedTo: admin._id
            },
            {
                customerName: "Ananya Sharma",
                property: "Palm Grove Villas",
                phone: "+91 9837 0000",
                whatsapp: "+91 9729 4313",
                schedule: new Date(today.setHours(10, 30, 0, 0)),
                type: "Meeting",
                notes: "Client wants brochure and floor plan shared on WhatsApp before visit.",
                status: "Pending",
                priority: "Medium",
                assignedTo: employee._id
            },
            {
                customerName: "Lavanya Rao",
                property: "Skyline Heights 3BHK",
                phone: "+91 9800 1234",
                whatsapp: "+91 9700 5678",
                schedule: new Date(yesterday.setHours(12, 30, 0, 0)),
                type: "Call",
                notes: "Requested callback after reviewing legal documents with family.",
                status: "Pending",
                priority: "High",
                assignedTo: employee._id
            },
            {
                customerName: "Tanvi Shah",
                property: "Metro Square Office",
                phone: "+91 9822 5555",
                whatsapp: "+91 9774 4444",
                schedule: new Date(yesterday.setHours(13, 30, 0, 0)),
                type: "Call",
                notes: "Interested in ready-to-move unit, asked about possession documents.",
                status: "Pending",
                priority: "Medium",
                assignedTo: employee._id
            },
            {
                customerName: "Aditya Kulkarni",
                property: "Orchid County Duplex",
                phone: "+91 9822 1814",
                whatsapp: "+91 9774 5878",
                schedule: new Date(tomorrow.setHours(15, 0, 0, 0)),
                type: "Meeting",
                notes: "Follow up after virtual tour, client asked for corner unit availability.",
                status: "Upcoming",
                priority: "Low",
                assignedTo: admin._id
            },
            {
                customerName: "Nisha Reddy",
                property: "Green Acres Plot",
                phone: "+91 9885 6595",
                whatsapp: "+91 9197 1565",
                schedule: new Date(yesterday.setHours(18, 15, 0, 0)),
                type: "Call",
                notes: "Asked for loan assistance details and preferred weekend callback.",
                status: "Pending",
                priority: "Low",
                assignedTo: employee._id
            },
            {
                customerName: "Amit Desai",
                property: "Sunset Waterfront Villa",
                phone: "+91 9896 2452",
                whatsapp: "+91 9197 4404",
                schedule: new Date(tomorrow.setHours(17, 0, 0, 0)),
                type: "Call",
                notes: "Wants to negotiate parking charges and maintenance deposit.",
                status: "Upcoming",
                priority: "High",
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

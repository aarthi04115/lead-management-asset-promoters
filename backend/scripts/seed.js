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
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/leed-management-asset-promoters");
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await User.deleteMany();
        await Lead.deleteMany();
        await Property.deleteMany();
        await FollowUp.deleteMany();
        await SiteVisit.deleteMany();
        console.log("Cleared existing data.");

        // 1. Create Admin & Employees
        const admin = await User.create({
            name: "Sarah Executive",
            email: "admin@maestrominds.com",
            password: "adminpassword123",
            role: "admin",
            isActive: true,
            employeeId: "EMP-001"
        });

        const employee = await User.create({
            name: "Emily Watson",
            email: "emily@maestrominds.com",
            password: "password123",
            role: "employee",
            isActive: true,
            employeeId: "EMP-002"
        });

        const employee2 = await User.create({
            name: "John Agent",
            email: "john@maestrominds.com",
            password: "password123",
            role: "employee",
            isActive: true,
            employeeId: "EMP-003"
        });
        console.log("Users created.");

        // 2. Create Properties
        const properties = await Property.insertMany([
            {
                title: "Skyline Penthouse 4B",
                location: "Manhattan, NY",
                city: "New York",
                price: "$8,200,000",
                type: "Residential",
                status: "Available",
                assignedTo: employee._id
            },
            {
                title: "Sunset Waterfront Villa",
                location: "Miami, FL",
                city: "Miami",
                price: "$4,500,000",
                type: "Resort",
                status: "Available",
                assignedTo: employee2._id
            },
            {
                title: "Historic Downtown Loft",
                location: "Chicago, IL",
                city: "Chicago",
                price: "$1,200,000",
                type: "Historic",
                status: "Negotiation",
                assignedTo: employee._id
            },
            {
                title: "Emerald Garden Apts",
                location: "Coimbatore, TN",
                city: "Coimbatore",
                price: "60,00,000",
                type: "Residential",
                status: "Available",
                assignedTo: employee2._id
            },
            {
                title: "Riverside Cottage",
                location: "Ooty, TN",
                city: "Ooty",
                price: "1,20,00,000",
                type: "Resort",
                status: "Available",
                assignedTo: employee._id
            },
            {
                title: "hema home",
                location: "Kanchipuram, TN",
                city: "Kanchipuram",
                price: "78,00,000",
                type: "Residential",
                status: "Available",
                assignedTo: employee2._id
            }
        ]);
        console.log("Properties seeded.");

        // 3. Create Leads
        const leadList = [];
        // Seeding 34 leads to match total count in dashboard
        for (let i = 1; i <= 34; i++) {
            let status = "New";
            if (i === 23) status = "Site Visit Completed";
            else if (i === 11 || i === 22 || i === 10) status = "Site Visit Scheduled";
            else if (i === 21) status = "Converted";
            else if (i % 5 === 0) status = "Interested";
            else if (i % 3 === 0) status = "Follow-Up";

            const propertyTitle = properties[i % properties.length].title;
            const assignedEmp = i % 2 === 0 ? employee : employee2;

            leadList.push({
                leadId: `LD-86${i.toString().padStart(2, "0")}`,
                name: `Client ${i}`,
                email: `client${i}@example.com`,
                phone: `98765432${(10 + i).toString().substring(0, 2)}`,
                whatsapp: `98765432${(10 + i).toString().substring(0, 2)}`,
                property: propertyTitle,
                source: i % 2 === 0 ? "Online" : "Zillow",
                status: status,
                assignedTo: assignedEmp._id,
                notes: [{
                    text: `Initial discussion notes for Client ${i}. Interested in ${propertyTitle}.`,
                    addedBy: { id: assignedEmp._id.toString(), name: assignedEmp.name },
                    createdAt: new Date(Date.now() - 3600000 * 24)
                }]
            });
        }

        const leads = await Lead.create(leadList);
        console.log("34 Leads seeded successfully.");

        // 4. Create Follow-ups (including overdue ones and today's schedule)
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const client23Lead = leads.find(l => l.name === "Client 23");
        const sarahLead = leads.find(l => l.name === "Client 11");

        const followups = await FollowUp.insertMany([
            {
                customerName: "Client 23",
                property: "hema home",
                phone: "9876543212",
                whatsapp: "9876543212",
                schedule: new Date(yesterday.setHours(22, 32, 0, 0)),
                followUpDate: yesterday.toISOString().split("T")[0],
                followUpTime: "22:32",
                type: "Call",
                notes: "Auto-generated follow-up for Client 23",
                status: "Pending",
                priority: "Urgent",
                assignedTo: employee2._id,
                leadId: client23Lead?._id
            },
            {
                customerName: "Sarah Jenkins",
                property: "Sunset Waterfront Villa",
                phone: "9876543210",
                whatsapp: "9876543210",
                schedule: new Date(today.setHours(14, 30, 0, 0)),
                followUpDate: today.toISOString().split("T")[0],
                followUpTime: "14:30",
                type: "Call",
                notes: "Luxe Manor - Priority Callback",
                status: "Pending",
                priority: "Urgent",
                assignedTo: employee2._id,
                leadId: sarahLead?._id
            },
            {
                customerName: "Client 22",
                property: "Sunset Waterfront Villa",
                phone: "9876543211",
                whatsapp: "9876543211",
                schedule: new Date(today.setHours(16, 0, 0, 0)),
                followUpDate: today.toISOString().split("T")[0],
                followUpTime: "16:00",
                type: "Call",
                notes: "Verify: Site Visit #249 - Skyline Penthouse",
                status: "Pending",
                priority: "Medium",
                assignedTo: employee._id
            },
            {
                customerName: "Client 10",
                property: "The Grand Atrium Commercial",
                phone: "9876543219",
                whatsapp: "9876543219",
                schedule: new Date(today.setHours(17, 15, 0, 0)),
                followUpDate: today.toISOString().split("T")[0],
                followUpTime: "17:15",
                type: "Call",
                notes: "Review Contract: Block A - Internal Legal Check",
                status: "Pending",
                priority: "Medium",
                assignedTo: employee2._id
            }
        ]);
        console.log("Follow-ups seeded.");

        // 5. Create Site Visits to match Site Visit Verification cards precisely
        await SiteVisit.insertMany([
            {
                employeeName: "Emily Watson",
                customerName: "Sophia Martinez",
                propertyName: "Azure Bay Estates - Villa 7",
                propertyLocation: "Lat: 41.03, Lng: -73.63",
                latitude: 41.03,
                longitude: -73.63,
                distance: 120,
                selfieImage: "default.jpg",
                visitTime: new Date(today.setHours(13, 15, 0, 0)),
                status: "Pending",
                agent: employee._id
            },
            {
                employeeName: "John Agent",
                customerName: "Goldman & Sons Rep",
                propertyName: "The Grand Atrium Commercial",
                propertyLocation: "Lat: 40.75, Lng: -73.98",
                latitude: 40.75,
                longitude: -73.98,
                distance: 85,
                selfieImage: "default.jpg",
                visitTime: new Date(today.setHours(16, 45, 0, 0)),
                status: "Pending",
                agent: employee2._id
            },
            {
                employeeName: "Emily Watson",
                customerName: "Mr. Julian Vane",
                propertyName: "The Obsidian Penthouse",
                propertyLocation: "Manhattan, NY",
                latitude: 40.7128,
                longitude: -74.0060,
                distance: 10,
                selfieImage: "default.jpg",
                visitTime: new Date(Date.now() - 3600000 * 24),
                status: "Approved",
                remarks: "Approved",
                agent: employee._id
            },
            {
                employeeName: "John Agent",
                customerName: "Officer R. Thompson",
                propertyName: "Skyline Lofts #402",
                propertyLocation: "Chennai, TN",
                latitude: 13.0827,
                longitude: 80.2707,
                distance: 50,
                selfieImage: "default.jpg",
                visitTime: new Date(Date.now() - 3600000 * 24),
                status: "Approved",
                remarks: "Approved",
                agent: employee2._id
            },
            {
                employeeName: "Emily Watson",
                customerName: "Officer K. Leigh",
                propertyName: "Emerald Garden Apts",
                propertyLocation: "Coimbatore, TN",
                latitude: 11.0168,
                longitude: 76.9558,
                distance: 72,
                selfieImage: "default.jpg",
                visitTime: new Date(Date.now() - 3600000 * 48),
                status: "Approved",
                remarks: "Approved",
                agent: employee._id
            },
            {
                employeeName: "John Agent",
                customerName: "Insufficient Image Clarity",
                propertyName: "Riverside Cottage",
                propertyLocation: "Ooty, TN",
                latitude: 11.4102,
                longitude: 76.6950,
                distance: 500,
                selfieImage: "default.jpg",
                visitTime: new Date(Date.now() - 3600000 * 48),
                status: "Rejected",
                remarks: "Rejected",
                agent: employee2._id
            }
        ]);
        console.log("Site Visits seeded.");

        console.log("Seeding complete! 🌱");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seedDB();

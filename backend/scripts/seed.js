const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const users = [
    {
        name: "Admin",
        email: "admin@maestrominds.com",
        password: "Admin@123",
        role: "admin",
        isActive: true,
        status: "Active",
    },
    {
        name: "Aarthi",
        email: "employee1@maestrominds.com",
        password: "Employee@123",
        role: "employee",
        isActive: true,
        status: "Active",
    },
    {
        name: "John",
        email: "employee2@maestrominds.com",
        password: "Employee@123",
        role: "employee",
        isActive: true,
        status: "Active",
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB Atlas");

        let created = 0;
        let skipped = 0;

        for (const userData of users) {
            const existing = await User.findOne({ email: userData.email });
            if (existing) {
                console.log(`⚠️  Skipped (already exists): ${userData.email}`);
                skipped++;
            } else {
                await User.create(userData); // password hashed via pre-save hook
                console.log(`✅ Created: ${userData.email} [${userData.role}]`);
                created++;
            }
        }

        console.log(`\n🌱 Seeding complete — ${created} created, ${skipped} skipped.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
        process.exit(1);
    }
};

seed();

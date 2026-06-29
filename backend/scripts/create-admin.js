const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const email = "admin@maestrominds.com";
        const password = "adminpassword123";

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`User ${email} already exists.`);
            process.exit(0);
        }

        await User.create({
            name: "System Admin",
            email: email,
            password: password,
            role: "admin",
            isActive: true
        });

        console.log("Admin user created successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error("Error creating admin user:", err.message);
        process.exit(1);
    }
};

createAdmin();

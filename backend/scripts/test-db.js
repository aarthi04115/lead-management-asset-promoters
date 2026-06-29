const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smart_real_estate")
    .then(async () => {
        const User = require("../models/User");
        const users = await User.find({});
        console.log(JSON.stringify(users.map(u => ({ email: u.email, role: u.role, isActive: u.isActive, name: u.name })), null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error("DB connection error:", err);
        process.exit(1);
    });

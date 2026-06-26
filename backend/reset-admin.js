const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const email = "admin@maestrominds.com";
        const newPassword = "adminpassword123";

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User ${email} not found.`);
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();

        console.log("Admin password updated successfully!");
        console.log(`Email: ${email}`);
        console.log(`New Password: ${newPassword}`);
        process.exit(0);
    } catch (err) {
        console.error("Error updating admin password:", err.message);
        process.exit(1);
    }
};

resetAdminPassword();

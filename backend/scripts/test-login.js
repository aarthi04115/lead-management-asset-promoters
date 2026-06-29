const axios = require("axios");

axios.post("http://127.0.0.1:5000/api/auth/login", {
    email: "admin@maestrominds.com",
    password: "adminpassword123",
    role: "admin"
})
    .then(res => {
        console.log("LOGIN SUCCESSFUL!");
        console.log("User:", res.data.data.user);
        console.log("Token:", res.data.data.token ? "PRESENT" : "MISSING");
        process.exit(0);
    })
    .catch(err => {
        console.error("LOGIN FAILED!");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else {
            console.error("Error:", err.message);
        }
        process.exit(1);
    });

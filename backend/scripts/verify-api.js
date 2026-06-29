const mongoose = require("mongoose");
const axios = require("axios");

const BASE_URL = "http://localhost:5005/api";

const runVerify = async () => {
    console.log("=== STARTING MONOREPO API MODULES VERIFICATION ===");
    let adminToken = "";
    let employeeToken = "";

    // 1. Authenticate Admin
    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: "admin@maestrominds.com",
            password: "adminpassword123",
            role: "admin"
        });
        adminToken = res.data.data.token;
        console.log("✅ 1. Admin Login Authentication: PASS");
    } catch (err) {
        console.error("❌ 1. Admin Login Authentication: FAIL", err.response?.data?.message || err.message);
        return;
    }

    // 2. Authenticate Employee
    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: "emily@maestrominds.com",
            password: "password123",
            role: "employee"
        });
        employeeToken = res.data.data.token;
        console.log("✅ 2. Employee Login Authentication: PASS");
    } catch (err) {
        console.error("❌ 2. Employee Login Authentication: FAIL", err.response?.data?.message || err.message);
        return;
    }

    // 3. Test Property Retrieval
    let sampleProperty = null;
    try {
        const res = await axios.get(`${BASE_URL}/properties`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        sampleProperty = res.data.data?.[0] || res.data?.[0];
        console.log("✅ 3. Property Management (Retrieval): PASS (Count: " + (res.data.data?.length || 0) + ")");
    } catch (err) {
        console.error("❌ 3. Property Management: FAIL", err.response?.data?.message || err.message);
    }

    // 4. Test Lead Creation (Assigns via Round-Robin)
    let createdLead = null;
    try {
        const res = await axios.post(
            `${BASE_URL}/leads`,
            {
                name: "API Verification Client",
                phone: "9988776655",
                email: "apiverification@example.com",
                property: sampleProperty ? sampleProperty.title : "Skyline Penthouse 4B",
                source: "Online",
                notes: "Verification Test Lead Created via Automation Script."
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        createdLead = res.data.data;
        console.log("✅ 4. Lead Management (Creation & Assignment): PASS (Lead ID: " + (createdLead?.leadId || createdLead?._id) + ")");
    } catch (err) {
        console.error("❌ 4. Lead Management (Creation): FAIL", err.response?.data?.message || err.message);
    }

    // 5. Test Follow-Up Creation
    let createdFollowup = null;
    try {
        const todayStr = new Date().toISOString().split("T")[0];
        const res = await axios.post(
            `${BASE_URL}/followups`,
            {
                customerName: createdLead ? createdLead.name : "Sample Client",
                property: createdLead ? createdLead.property : "Skyline Penthouse 4B",
                phone: createdLead ? createdLead.phone : "9988776655",
                whatsapp: createdLead ? createdLead.phone : "9988776655",
                followUpDate: todayStr,
                followUpTime: "12:00",
                type: "Call",
                notes: "Test Follow-up",
                priority: "Normal",
                leadId: createdLead ? createdLead._id : undefined
            },
            { headers: { Authorization: `Bearer ${employeeToken}` } }
        );
        createdFollowup = res.data.data;
        console.log("✅ 5. Follow-Up Management (Scheduling): PASS");
    } catch (err) {
        console.error("❌ 5. Follow-Up Management (Scheduling): FAIL", err.response?.data?.message || err.message);
    }

    // 6. Test Site Visit Submission
    let createdSitevisit = null;
    try {
        // If the check-in is done, we submit geolocation and agent info
        const res = await axios.post(
            `${BASE_URL}/sitevisits`,
            {
                customerName: createdLead ? createdLead.name : "Sample Client",
                propertyName: sampleProperty ? sampleProperty.title : "Skyline Penthouse 4B",
                propertyLocation: "Lat: 13.08, Lng: 80.27",
                latitude: 13.0827,
                longitude: 80.2707,
                distance: 12,
                selfieImage: "default.jpg"
            },
            { headers: { Authorization: `Bearer ${employeeToken}` } }
        );
        createdSitevisit = res.data.data;
        console.log("✅ 6. Site Visit Verification (Submission): PASS");
    } catch (err) {
        console.error("❌ 6. Site Visit Verification (Submission): FAIL", err.response?.data?.message || err.message);
    }

    // 7. Verify Dashboard sync endpoints
    try {
        const res = await axios.get(`${BASE_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${employeeToken}` }
        });
        console.log("✅ 7. Dashboard Synchronization (Stats retrieval): PASS");
    } catch (err) {
        console.error("❌ 7. Dashboard Synchronization: FAIL", err.response?.data?.message || err.message);
    }

    console.log("=== VERIFICATION COMPLETE ===");
    process.exit(0);
};

runVerify();

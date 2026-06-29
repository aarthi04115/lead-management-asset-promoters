const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const SiteVisit = require('../models/SiteVisit');
const Property = require('../models/Property');

const getDashboardStats = async (req, res) => {
    try {
        const { role, _id, name } = req.user;
        let stats = [];

        // Helper to get start and end of today for queries
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // Helper to get today's date string for followups YYYY-MM-DD
        const todayStr = startOfToday.toISOString().slice(0, 10);

        if (role === 'lead_management') {
            const assignedLeadsCount = await Lead.countDocuments({ assignedTo: _id });
            const newLeadsCount = await Lead.countDocuments({ assignedTo: _id, status: 'New' });
            const contactedLeadsCount = await Lead.countDocuments({ assignedTo: _id, status: 'Contacted' });
            const closedLeadsCount = await Lead.countDocuments({ assignedTo: _id, status: { $in: ['Closed', 'Won'] } });

            stats = [
                { label: "Assigned Leads", value: assignedLeadsCount, icon: "groups", trend: "+12%", color: "green", trendIcon: "arrow_upward" },
                { label: "New Leads", value: newLeadsCount, icon: "event_repeat", trend: "New This Week", color: "secondary", trendIcon: "" },
                { label: "Contacted Leads", value: contactedLeadsCount, icon: "fact_check", trend: "+8%", color: "blue", trendIcon: "arrow_upward" },
                { label: "Closed Leads", value: closedLeadsCount, icon: "domain", trend: "+2 New", color: "secondary", trendIcon: "" }
            ];
        }
        else if (role === 'followup_management') {
            const assignedFollowUpsCount = await FollowUp.countDocuments({ assignedTo: _id });
            const pendingFollowUpsCount = await FollowUp.countDocuments({ assignedTo: _id, status: 'Pending' });
            const completedFollowUpsCount = await FollowUp.countDocuments({ assignedTo: _id, status: 'Completed' });
            const overdueFollowUpsCount = await FollowUp.countDocuments({ assignedTo: _id, status: 'Overdue' });

            stats = [
                { label: "Assigned Follow-Ups", value: assignedFollowUpsCount, icon: "groups", trend: "+5%", color: "green", trendIcon: "arrow_upward" },
                { label: "Pending Follow-Ups", value: pendingFollowUpsCount, icon: "event_repeat", trend: "Action Needed", color: "secondary", trendIcon: "" },
                { label: "Completed Follow-Ups", value: completedFollowUpsCount, icon: "fact_check", trend: "+15%", color: "blue", trendIcon: "arrow_upward" },
                { label: "Overdue Follow-Ups", value: overdueFollowUpsCount, icon: "domain", trend: "Urgent", color: "secondary", trendIcon: "" }
            ];
        }
        else if (role === 'sitevisit_verification') {
            const assignedSiteVisitsCount = await SiteVisit.countDocuments({ employeeName: name });
            const pendingVisitsCount = await SiteVisit.countDocuments({ employeeName: name, status: 'Pending' });
            const verifiedVisitsCount = await SiteVisit.countDocuments({ employeeName: name, status: 'Approved' });
            const todaysVisitsCount = await SiteVisit.countDocuments({
                employeeName: name,
                visitTime: { $gte: startOfToday, $lte: endOfToday }
            });

            stats = [
                { label: "Assigned Site Visits", value: assignedSiteVisitsCount, icon: "groups", trend: "+12%", color: "green", trendIcon: "arrow_upward" },
                { label: "Pending Verification", value: pendingVisitsCount, icon: "event_repeat", trend: "To Verify", color: "secondary", trendIcon: "" },
                { label: "Verified Visits", value: verifiedVisitsCount, icon: "fact_check", trend: "+8%", color: "blue", trendIcon: "arrow_upward" },
                { label: "Today's Visits", value: todaysVisitsCount, icon: "domain", trend: "Today", color: "secondary", trendIcon: "" }
            ];
        }
        else if (role === 'sales_executive' || role === 'employee') {
            const assignedLeadsCount = await Lead.countDocuments({ assignedTo: _id });
            const activeLeadsCount = await Lead.countDocuments({ assignedTo: _id, status: { $nin: ['Closed', 'Lost'] } });
            const todaysFollowUpsCount = await FollowUp.countDocuments({
                assignedTo: _id,
                followUpDate: todayStr
            });
            const upcomingSiteVisitsCount = await SiteVisit.countDocuments({
                agent: _id,
                status: 'Pending',
                visitTime: { $gte: startOfToday }
            });

            stats = [
                { label: "Assigned Leads", value: assignedLeadsCount, icon: "groups", trend: "+12%", color: "green", trendIcon: "arrow_upward" },
                { label: "Active Leads", value: activeLeadsCount, icon: "event_repeat", trend: "In Progress", color: "secondary", trendIcon: "" },
                { label: "Today's Follow-Ups", value: todaysFollowUpsCount, icon: "fact_check", trend: "+8%", color: "blue", trendIcon: "arrow_upward" },
                { label: "Upcoming Site Visits", value: upcomingSiteVisitsCount, icon: "domain", trend: "Soon", color: "secondary", trendIcon: "" }
            ];
        }
        else {
            // Admin or fallback
            const totalLeads = await Lead.countDocuments();
            const totalFollowUps = await FollowUp.countDocuments();
            const totalSiteVisits = await SiteVisit.countDocuments();
            const totalProperties = await Property.countDocuments();

            stats = [
                { label: "Total Leads", value: totalLeads, icon: "groups", trend: "+12%", color: "green", trendIcon: "arrow_upward" },
                { label: "Total Follow-Ups", value: totalFollowUps, icon: "event_repeat", trend: "All Time", color: "secondary", trendIcon: "" },
                { label: "Total Site Visits", value: totalSiteVisits, icon: "fact_check", trend: "+8%", color: "blue", trendIcon: "arrow_upward" },
                { label: "Total Properties", value: totalProperties, icon: "domain", trend: "Active", color: "secondary", trendIcon: "" }
            ];
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Failed to get dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Unable to load dashboard stats.' });
    }
};

module.exports = {
    getDashboardStats
};

const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const SiteVisit = require('../models/SiteVisit');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

const getDateRange = (range) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (range) {
    case 'today':
      break;
    case 'week':
      start.setDate(now.getDate() - 6);
      break;
    case 'month':
      start.setDate(1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 2);
      start.setDate(1);
      break;
    default:
      start.setTime(0);
      break;
  }

  return { start, end };
};

const getRangeFilter = (field, range) => {
  if (range === 'all') return {};
  const { start, end } = getDateRange(range);
  return { [field]: { $gte: start, $lte: end } };
};

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.role === 'employee' ? req.user.id : null;
    const range = req.query.range || 'month';

    const leadFilter = userId ? { assignedTo: userId } : {};
    const followFilter = userId ? { assignedTo: userId } : {};
    const visitFilter = userId ? { assignedTo: userId } : {};

    const rangeLeadFilter = { ...leadFilter, ...getRangeFilter('createdAt', range) };
    const rangeFollowFilter = { ...followFilter, ...getRangeFilter('scheduledAt', range) };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalLeads,
      newLeads,
      pendingFollowups,
      overdueFollowups,
      dueTodayFollowups,
      siteVisits,
      closedDeals,
      properties,
      sourceDistribution,
      statusBreakdown,
      topAgents,
      recentLeads
    ] = await Promise.all([
      Lead.countDocuments(leadFilter),
      Lead.countDocuments({ ...rangeLeadFilter, status: 'New' }),
      FollowUp.countDocuments({ ...rangeFollowFilter, status: 'Pending' }),
      FollowUp.countDocuments({ ...followFilter, status: 'Overdue' }),
      FollowUp.countDocuments({ ...followFilter, scheduledAt: { $gte: todayStart, $lte: todayEnd }, status: 'Pending' }),
      SiteVisit.countDocuments(visitFilter),
      Lead.countDocuments({ ...leadFilter, status: 'Closed' }),
      Property.countDocuments(),
      Lead.aggregate([
        { $match: leadFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $project: { name: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $match: leadFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $match: leadFilter },
        { $group: { _id: '$assignedTo', totalAssigned: { $sum: 1 }, closedDeals: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'employee' } },
        { $unwind: '$employee' },
        { $project: { name: '$employee.name', employeeId: '$employee.employeeId', totalAssigned: 1, closedDeals: 1 } },
        { $sort: { closedDeals: -1, totalAssigned: -1 } },
        { $limit: 5 }
      ]),
      Lead.find(leadFilter).sort({ createdAt: -1 }).limit(5).populate('assignedTo', 'name').select('customerName source status createdAt').lean(),
    ]);

    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        start: monthStart,
        end: monthEnd
      });
    }

    const monthlyGrowth = await Promise.all(months.map(async (m) => ({
      month: m.month,
      leads: await Lead.countDocuments({ ...leadFilter, createdAt: { $gte: m.start, $lte: m.end } })
    })));

    const funnel = [
      { name: 'New Leads', value: await Lead.countDocuments({ ...leadFilter, status: 'New' }) },
      { name: 'Connected', value: await Lead.countDocuments({ ...leadFilter, status: 'Connected' }) },
      { name: 'Visits', value: await Lead.countDocuments({ ...leadFilter, status: 'Site Visit Scheduled' }) },
      { name: 'Closed', value: closedDeals }
    ];

    const convRate = totalLeads > 0 ? ((closedDeals / totalLeads) * 100).toFixed(1) : 0;
    const goalTargets = { leads: 120, closedDeals: 30, conversion: 28 };
    const goalProgress = {
      leads: Math.min(100, Math.round((totalLeads / goalTargets.leads) * 100)),
      closedDeals: Math.min(100, Math.round((closedDeals / goalTargets.closedDeals) * 100)),
      conversion: Math.min(100, Math.round((convRate / goalTargets.conversion) * 100))
    };

    res.json({
      totalLeads,
      newLeads,
      pendingFollowups,
      overdueFollowups,
      dueTodayFollowups,
      siteVisits,
      closedDeals,
      properties,
      convRate,
      monthlyGrowth,
      sourceDistribution,
      statusBreakdown,
      funnel,
      topAgents,
      recentLeads,
      goalTargets,
      goalProgress,
      performanceScore: Math.min(95, 60 + closedDeals * 2)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

# Round Robin Backend - Implementation Guide

Complete guide for integrating and using the round robin lead assignment system in your backend.

## 📦 What's Included

```
backend/
├── models/
│   └── RoundRobin.js                   (Updated with enhanced schema)
├── routes/
│   └── roundrobin.js                   (Complete API endpoints)
├── utils/
│   ├── roundRobinService.js            (Core logic & utilities)
│   └── roundRobinAnalytics.js          (Advanced analytics)
├── server.js                           (Updated with route)
├── ROUNDROBIN_README.md                (API Documentation)
├── ROUNDROBIN_API_TESTING.js           (Testing functions)
├── .env.example                        (Configuration template)
└── IMPLEMENTATION_GUIDE.md             (This file)
```

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd crm/backend
npm install
```

All required dependencies are already in `package.json`:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv

### Step 2: Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings
# Update MONGO_URI, JWT_SECRET, etc.
```

### Step 3: Start the Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Step 4: Test the API
Use the provided testing functions in `ROUNDROBIN_API_TESTING.js`

## 📝 Integration Examples

### Example 1: Auto-assign Lead on Creation

In your lead creation endpoint:

```javascript
// routes/leads.js
const RoundRobinService = require('../utils/roundRobinService');

router.post('/', admin, async (req, res) => {
  try {
    const { customerName, mobile, email, source, intent, priority, notes } = req.body;

    // Create lead
    const lead = new Lead({
      customerName,
      mobile,
      email,
      source,
      intent,
      priority,
      notes,
      score: 50
    });

    // Auto-assign using round robin
    try {
      const result = await RoundRobinService.assignLeadAuto(lead._id);
      lead.assignedTo = result.employeeId;
    } catch (error) {
      console.warn('Auto-assignment failed:', error.message);
      // Continue without assignment if no employees available
    }

    await lead.save();
    await lead.populate('assignedTo', 'name employeeId');

    res.json({
      success: true,
      message: 'Lead created with auto-assignment',
      lead
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

### Example 2: Bulk Import with Round Robin

```javascript
// utils/leadImporter.js
const RoundRobinService = require('./roundRobinService');
const Lead = require('../models/Lead');

async function importLeadsBulk(leadsData) {
  const results = {
    success: [],
    failed: []
  };

  for (const leadData of leadsData) {
    try {
      // Create lead
      const lead = new Lead({
        customerName: leadData.customerName,
        mobile: leadData.mobile,
        email: leadData.email,
        source: leadData.source || 'Imported',
        priority: leadData.priority || 'Mid',
        score: 50
      });

      // Auto-assign
      const assignment = await RoundRobinService.assignLeadAuto(lead._id);
      lead.assignedTo = assignment.employeeId;

      await lead.save();
      results.success.push({
        leadId: lead._id,
        customerName: lead.customerName,
        assignedTo: assignment.employee.name
      });
    } catch (error) {
      results.failed.push({
        customerName: leadData.customerName,
        error: error.message
      });
    }
  }

  return results;
}

module.exports = { importLeadsBulk };
```

### Example 3: Conditional Assignment

```javascript
// routes/leads.js
const RoundRobinService = require('../utils/roundRobinService');

router.post('/smart-assign', admin, async (req, res) => {
  try {
    const { leadId, priority } = req.body;

    let assignmentMethod = 'round_robin'; // default

    // Use different methods based on priority
    if (priority === 'High') {
      assignmentMethod = 'score_based'; // Assign to top performers
    } else if (priority === 'Mid') {
      assignmentMethod = 'load_balanced'; // Balance workload
    }

    const assignment = await RoundRobinService.assignLeadAuto(leadId);

    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { assignedTo: assignment.employeeId },
      { new: true }
    ).populate('assignedTo', 'name employeeId email');

    res.json({
      success: true,
      message: `Lead assigned using ${assignmentMethod}`,
      lead
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

### Example 4: Schedule-based Reassignment

```javascript
// utils/roundRobinScheduler.js
const cron = require('node-cron');
const RoundRobinService = require('./roundRobinService');
const Lead = require('../models/Lead');

// Run every morning at 8 AM to reset round robin
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('Resetting round robin for new day...');
    await RoundRobinService.reset();
    console.log('✅ Round robin reset complete');
  } catch (error) {
    console.error('❌ Error resetting round robin:', error);
  }
});

// Run every hour to balance workload
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Checking workload balance...');
    const stats = await RoundRobinService.getStatistics();
    const leads = stats.stats;

    // Find overloaded employees
    const avg = leads.reduce((sum, emp) => sum + emp.activeLeads, 0) / leads.length;
    const overloaded = leads.filter(emp => emp.activeLeads > avg * 1.5);

    if (overloaded.length > 0) {
      console.log(`Found ${overloaded.length} overloaded employees`);
      // Could trigger reassignment logic here
    }
  } catch (error) {
    console.error('❌ Error checking workload:', error);
  }
});

module.exports = {};
```

### Example 5: Advanced Analytics

```javascript
// routes/analytics.js
const RoundRobinAnalytics = require('../utils/roundRobinAnalytics');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/roundrobin/detailed', auth, admin, async (req, res) => {
  try {
    const analytics = await RoundRobinAnalytics.getAllAnalytics();
    
    res.json({
      success: true,
      timestamp: new Date(),
      analytics
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/roundrobin/performance', auth, admin, async (req, res) => {
  try {
    const performance = await RoundRobinAnalytics.employeeComparison();
    
    res.json({
      success: true,
      performance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

### Example 6: Dashboard Statistics Endpoint

```javascript
// routes/dashboard.js (updated)
const RoundRobinService = require('../utils/roundRobinService');

router.get('/roundrobin-stats', auth, admin, async (req, res) => {
  try {
    const stats = await RoundRobinService.getStatistics();
    
    const summary = {
      totalEmployees: stats.employeeCount,
      totalLeads: stats.totalLeads,
      employees: stats.stats.map(emp => ({
        name: emp.name,
        totalLeads: emp.totalLeads,
        activeLeads: emp.activeLeads,
        closureRate: emp.closureRate,
        score: emp.score
      }))
    };

    res.json({
      success: true,
      summary
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

## 🔄 Assignment Methods Comparison

| Method | Best For | Algorithm | Performance |
|--------|----------|-----------|-------------|
| **Round Robin** | Equal distribution | Cyclic rotation | Fast ⚡ |
| **Load Balanced** | Varying capacity | Count active leads | Medium ⏱️ |
| **Score Based** | Performance-driven | Top 3 performers | Medium ⏱️ |
| **Weighted** | Custom capacity | Weighted load | Slower 🐢 |

## 📊 Using Analytics

```javascript
const Analytics = require('./utils/roundRobinAnalytics');

// Get employee performance
const performance = await Analytics.employeePerformanceSummary();
// Shows: total leads, closed leads, conversion rate, avg score

// Get lead distribution
const distribution = await Analytics.leadDistributionAnalysis();
// Shows: how leads are spread among employees

// Get source performance
const sources = await Analytics.leadSourcePerformance();
// Shows: which lead sources convert best

// Get workload balance
const balance = await Analytics.assignmentWorkloadBalance();
// Shows: if workload is balanced and standard deviation
```

## 🛠️ Configuration Options

Edit `.env` to customize behavior:

```env
# Assignment method
ROUND_ROBIN_METHOD=load_balanced

# Leads per employee target
LEADS_PER_EMPLOYEE=10

# Enable features
ENABLE_NOTIFICATIONS=true
ENABLE_ASSIGNMENT_HISTORY=true
ENABLE_ANALYTICS=true
```

## 📈 Monitoring & Logging

Add logging to track assignments:

```javascript
// middleware/roundRobinLogger.js
function logRoundRobinAction(action, details) {
  const log = {
    timestamp: new Date(),
    action,
    details,
    level: 'info'
  };
  console.log('[ROUND ROBIN]', JSON.stringify(log, null, 2));
  // Could also save to database or external logging service
}

module.exports = logRoundRobinAction;
```

## 🚨 Error Handling

Common errors and solutions:

```javascript
try {
  const result = await RoundRobinService.simpleRoundRobinAssign();
} catch (error) {
  if (error.message === 'No active employees available') {
    // Handle: No employees available
    // Solution: Create test employees or reactivate existing ones
  } else if (error.name === 'ValidationError') {
    // Handle: Schema validation failed
  } else {
    // Handle: Other errors
  }
}
```

## 🔐 Security Considerations

1. **Authentication**: All endpoints require JWT token
2. **Authorization**: Admin-only endpoints verify role
3. **Input Validation**: Validate all request parameters
4. **Rate Limiting**: Consider adding rate limiting for bulk operations

```javascript
// Example: Rate limiting
const rateLimit = require('express-rate-limit');

const assignmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many assignment requests, please try again later.'
});

router.post('/assign', assignmentLimiter, admin, async (req, res) => {
  // Assignment logic
});
```

## 📚 Database Indexes

Add these indexes to improve query performance:

```javascript
// models/Lead.js
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });

// models/User.js
userSchema.index({ role: 1, status: 1 });
userSchema.index({ email: 1 });
```

## 🧪 Testing

Use the provided testing script:

```bash
# In browser console or Node.js
# Load ROUNDROBIN_API_TESTING.js and run:

getRoundRobinStatus();
assignSingleLead('leadId', 'round_robin');
getStatistics();
demoWorkflow();
```

## 🎯 Best Practices

1. ✅ **Monitor regularly**: Check statistics daily
2. ✅ **Test thoroughly**: Use testing script before production
3. ✅ **Backup data**: Regular MongoDB backups
4. ✅ **Document changes**: Log any method changes
5. ✅ **Train team**: Ensure team understands the system
6. ✅ **Feedback loop**: Adjust methods based on performance

## 📞 Support & Troubleshooting

### Issue: "No active employees available"
**Solution**: Ensure at least one employee exists with `role: 'employee'` and `status: 'Active'`

### Issue: Leads not being assigned
**Solution**: Check if `/api/roundrobin/status` endpoint works and verify JWT token validity

### Issue: High memory usage
**Solution**: Archive old assignment history and implement pagination

### Issue: Slow performance
**Solution**: Add database indexes and implement caching

## 🎓 Learning Resources

- MongoDB Aggregation: https://docs.mongodb.com/manual/reference/operator/aggregation/
- Express.js: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/

## ✅ Verification Checklist

Before going to production:

- [ ] MongoDB connection working
- [ ] JWT secret configured in .env
- [ ] At least 2 active employees created
- [ ] API endpoints tested with Postman/similar
- [ ] Round robin status endpoint returns data
- [ ] Single lead assignment works
- [ ] Bulk assignment works
- [ ] Statistics endpoint returns valid data
- [ ] Assignment history is tracked
- [ ] Notifications are created (if enabled)

## 🚀 Next Steps

1. Test the API with the provided testing script
2. Create sample employees in MongoDB
3. Create sample leads
4. Try assigning leads using different methods
5. Monitor statistics and adjust as needed
6. Integrate into your frontend dashboard

---

**Ready to use!** Start your server and begin assigning leads with intelligent round robin! 🎉


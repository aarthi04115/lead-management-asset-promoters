/**
 * Round Robin Database Setup & Migration Script
 * Run this once to initialize the round robin system
 * 
 * Usage: node scripts/setupRoundRobin.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const RoundRobin = require('../models/RoundRobin');
const User = require('../models/User');
const Lead = require('../models/Lead');
const AssignmentHistory = require('../models/AssignmentHistory');
const Notification = require('../models/Notification');

async function setupRoundRobin() {
  try {
    console.log('🔄 Starting Round Robin Database Setup...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/realestatecrm');
    console.log('✅ Connected to MongoDB\n');

    // 1. Create indexes
    console.log('📝 Creating database indexes...');
    
    // Lead indexes
    await Lead.collection.createIndex({ assignedTo: 1, status: 1 });
    await Lead.collection.createIndex({ createdAt: -1 });
    await Lead.collection.createIndex({ status: 1 });
    await Lead.collection.createIndex({ priority: 1 });
    await Lead.collection.createIndex({ source: 1 });
    console.log('  ✓ Lead indexes created');

    // User indexes
    await User.collection.createIndex({ role: 1, status: 1 });
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ score: -1 });
    console.log('  ✓ User indexes created');

    // RoundRobin indexes
    await RoundRobin.collection.createIndex({ lastUpdated: -1 });
    console.log('  ✓ RoundRobin indexes created');

    // AssignmentHistory indexes (if model exists)
    try {
      await AssignmentHistory.collection.createIndex({ leadId: 1 });
      await AssignmentHistory.collection.createIndex({ assignedTo: 1, createdAt: -1 });
      await AssignmentHistory.collection.createIndex({ createdAt: -1 });
      console.log('  ✓ AssignmentHistory indexes created');
    } catch (e) {
      console.log('  ⚠ AssignmentHistory model not available');
    }

    // Notification indexes (if model exists)
    try {
      await Notification.collection.createIndex({ recipientId: 1, read: 1 });
      await Notification.collection.createIndex({ createdAt: -1 });
      console.log('  ✓ Notification indexes created');
    } catch (e) {
      console.log('  ⚠ Notification model not available');
    }

    console.log('✅ All indexes created\n');

    // 2. Initialize Round Robin State
    console.log('🎲 Initializing Round Robin state...');
    
    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin({
        currentIndex: 0,
        assignmentMethod: 'round_robin',
        isActive: true,
        leadsPerEmployee: 10
      });
      await rrState.save();
      console.log('  ✓ New Round Robin state initialized');
    } else {
      console.log('  ℹ Round Robin state already exists');
    }
    console.log(`  - Method: ${rrState.assignmentMethod}`);
    console.log(`  - Current Index: ${rrState.currentIndex}`);
    console.log(`  - Active: ${rrState.isActive}\n`);

    // 3. Check employees
    console.log('👥 Checking employees...');
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const activeEmployees = await User.countDocuments({ role: 'employee', status: 'Active' });
    console.log(`  - Total Employees: ${totalEmployees}`);
    console.log(`  - Active Employees: ${activeEmployees}`);
    
    if (activeEmployees === 0) {
      console.log('\n⚠️  WARNING: No active employees found!');
      console.log('   You need to create at least one active employee to use round robin.');
      console.log('   Please create employees with:');
      console.log('   - role: "employee"');
      console.log('   - status: "Active"\n');
    } else {
      const employees = await User.find({ role: 'employee', status: 'Active' });
      console.log('  Active Employees:');
      employees.forEach((emp, idx) => {
        console.log(`    ${idx + 1}. ${emp.name} (${emp.employeeId}) - Score: ${emp.score}`);
      });
    }
    console.log();

    // 4. Check leads
    console.log('📋 Checking leads...');
    const totalLeads = await Lead.countDocuments();
    const assignedLeads = await Lead.countDocuments({ assignedTo: { $ne: null } });
    const unassignedLeads = await Lead.countDocuments({ assignedTo: null });
    console.log(`  - Total Leads: ${totalLeads}`);
    console.log(`  - Assigned: ${assignedLeads}`);
    console.log(`  - Unassigned: ${unassignedLeads}\n`);

    // 5. Distribution summary
    if (assignedLeads > 0) {
      console.log('📊 Lead Distribution:');
      const distribution = await Lead.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' }
      ]);

      distribution.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.employee.name}: ${item.count} leads`);
      });
      console.log();
    }

    // 6. Status summary
    if (totalLeads > 0) {
      console.log('📈 Lead Status Summary:');
      const statusSummary = await Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      statusSummary.forEach((item) => {
        const percentage = ((item.count / totalLeads) * 100).toFixed(1);
        console.log(`  - ${item._id}: ${item.count} (${percentage}%)`);
      });
      console.log();
    }

    // 7. Generate setup report
    console.log('📋 Setup Report:');
    console.log('═'.repeat(50));
    console.log(`✅ Round Robin System Ready!`);
    console.log(`   - Server: http://localhost:5000`);
    console.log(`   - API Base: /api/roundrobin`);
    console.log(`   - Current Method: ${rrState.assignmentMethod}`);
    console.log(`   - Active Employees: ${activeEmployees}`);
    console.log(`   - Total Leads: ${totalLeads}`);
    console.log('═'.repeat(50));
    console.log('\n📚 Next Steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test API: GET /api/roundrobin/status');
    console.log('3. Assign leads: POST /api/roundrobin/assign');
    console.log('4. Monitor: GET /api/roundrobin/statistics');
    console.log('\n📖 Documentation:');
    console.log('- API Guide: ROUNDROBIN_README.md');
    console.log('- Implementation: IMPLEMENTATION_GUIDE.md');
    console.log('- Testing: ROUNDROBIN_API_TESTING.js');
    console.log();

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Database setup complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('\n🔴 MongoDB Connection Error:');
      console.error('   Make sure MongoDB is running at:', process.env.MONGO_URI || 'mongodb://localhost:27017');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run setup
setupRoundRobin();

module.exports = setupRoundRobin;

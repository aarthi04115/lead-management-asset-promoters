const RoundRobin = require('../models/RoundRobin');
const User = require('../models/User');
const Lead = require('../models/Lead');

/**
 * Round Robin Utility Functions
 * Provides various round robin assignment algorithms and utilities
 */

class RoundRobinService {
  /**
   * Simple Round Robin - Sequential assignment
   * Assigns leads to employees in a cyclic manner
   */
  static async simpleRoundRobinAssign() {
    const activeEmployees = await User.find({ role: 'employee', status: 'Active' })
      .sort({ employeeId: 1 });
    
    if (activeEmployees.length === 0) {
      throw new Error('No active employees available');
    }

    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin({
        currentIndex: 0,
        activeEmployees: activeEmployees.map(e => e._id)
      });
    }

    const assignedEmployee = activeEmployees[rrState.currentIndex % activeEmployees.length];

    rrState.currentIndex = (rrState.currentIndex + 1) % activeEmployees.length;
    rrState.totalAssignments += 1;
    rrState.lastUpdated = new Date();
    await rrState.save();

    return {
      employeeId: assignedEmployee._id,
      employee: assignedEmployee,
      method: 'simple_round_robin'
    };
  }

  /**
   * Load Balanced Round Robin
   * Assigns lead to employee with least active leads
   */
  static async loadBalancedRoundRobin() {
    const activeEmployees = await User.find({ role: 'employee', status: 'Active' });
    
    if (activeEmployees.length === 0) {
      throw new Error('No active employees available');
    }

    const employeesWithLeadCount = await Promise.all(
      activeEmployees.map(async (emp) => ({
        employeeId: emp._id,
        employee: emp,
        leadCount: await Lead.countDocuments({ 
          assignedTo: emp._id, 
          status: { $nin: ['Closed', 'Lost'] } 
        })
      }))
    );

    const assignedEmployee = employeesWithLeadCount.reduce((min, curr) => 
      curr.leadCount < min.leadCount ? curr : min
    );

    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin({ assignmentMethod: 'load_balanced' });
    }

    rrState.totalAssignments += 1;
    rrState.lastUpdated = new Date();
    await rrState.save();

    return {
      employeeId: assignedEmployee.employeeId,
      employee: assignedEmployee.employee,
      method: 'load_balanced',
      leadCount: assignedEmployee.leadCount
    };
  }

  /**
   * Score-based Round Robin
   * Assigns to highest performing employees within rotation
   */
  static async scoreBasedRoundRobin() {
    const activeEmployees = await User.find({ role: 'employee', status: 'Active' })
      .sort({ score: -1, name: 1 });
    
    if (activeEmployees.length === 0) {
      throw new Error('No active employees available');
    }

    // Top performers rotation (top 3 or all if less than 3)
    const topEmployees = activeEmployees.slice(0, Math.min(3, activeEmployees.length));

    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin({ 
        assignmentMethod: 'score_based',
        currentIndex: 0 
      });
    }

    const assignedEmployee = topEmployees[rrState.currentIndex % topEmployees.length];

    rrState.currentIndex = (rrState.currentIndex + 1) % topEmployees.length;
    rrState.totalAssignments += 1;
    rrState.lastUpdated = new Date();
    await rrState.save();

    return {
      employeeId: assignedEmployee._id,
      employee: assignedEmployee,
      method: 'score_based',
      score: assignedEmployee.score
    };
  }

  /**
   * Weighted Round Robin
   * Assigns based on employee capacity weight
   */
  static async weightedRoundRobin(weights = {}) {
    const activeEmployees = await User.find({ role: 'employee', status: 'Active' });
    
    if (activeEmployees.length === 0) {
      throw new Error('No active employees available');
    }

    // Get current lead counts
    const employeesWithMetrics = await Promise.all(
      activeEmployees.map(async (emp) => ({
        employeeId: emp._id,
        employee: emp,
        leadCount: await Lead.countDocuments({ assignedTo: emp._id }),
        score: emp.score,
        weight: weights[emp._id.toString()] || 1
      }))
    );

    // Calculate weighted load
    const weightedLoad = employeesWithMetrics.map(emp => ({
      ...emp,
      weightedLoad: emp.leadCount / emp.weight
    }));

    // Assign to employee with lowest weighted load
    const assignedEmployee = weightedLoad.reduce((min, curr) => 
      curr.weightedLoad < min.weightedLoad ? curr : min
    );

    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin({ assignmentMethod: 'weighted' });
    }

    rrState.totalAssignments += 1;
    rrState.lastUpdated = new Date();
    await rrState.save();

    return {
      employeeId: assignedEmployee.employeeId,
      employee: assignedEmployee.employee,
      method: 'weighted',
      weightedLoad: assignedEmployee.weightedLoad
    };
  }

  /**
   * Get current assignment method
   */
  static async getAssignmentMethod() {
    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin();
      await rrState.save();
    }
    return rrState.assignmentMethod || 'round_robin';
  }

  /**
   * Set assignment method
   */
  static async setAssignmentMethod(method) {
    const validMethods = ['round_robin', 'load_balanced', 'score_based', 'weighted'];
    
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid method. Use: ${validMethods.join(', ')}`);
    }

    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin({ assignmentMethod: method });
    } else {
      rrState.assignmentMethod = method;
    }

    await rrState.save();
    return rrState;
  }

  /**
   * Assign lead based on configured method
   */
  static async assignLeadAuto(leadId) {
    const method = await this.getAssignmentMethod();
    let result;

    switch (method) {
      case 'load_balanced':
        result = await this.loadBalancedRoundRobin();
        break;
      case 'score_based':
        result = await this.scoreBasedRoundRobin();
        break;
      case 'round_robin':
      default:
        result = await this.simpleRoundRobinAssign();
    }

    // Update lead
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { assignedTo: result.employeeId },
      { new: true }
    ).populate('assignedTo', 'name employeeId email');

    return { ...result, lead };
  }

  /**
   * Get statistics for round robin state
   */
  static async getStatistics() {
    const rrState = await RoundRobin.findOne();
    const activeEmployees = await User.find({ role: 'employee', status: 'Active' });
    
    const stats = await Promise.all(
      activeEmployees.map(async (emp) => ({
        employeeId: emp._id,
        name: emp.name,
        totalLeads: await Lead.countDocuments({ assignedTo: emp._id }),
        activeLeads: await Lead.countDocuments({ 
          assignedTo: emp._id, 
          status: { $nin: ['Closed', 'Lost'] } 
        }),
        closedLeads: await Lead.countDocuments({ assignedTo: emp._id, status: 'Closed' }),
        score: emp.score
      }))
    );

    return {
      rrState,
      employeeCount: activeEmployees.length,
      stats,
      totalLeads: stats.reduce((sum, emp) => sum + emp.totalLeads, 0)
    };
  }

  /**
   * Reset round robin state
   */
  static async reset() {
    let rrState = await RoundRobin.findOne();
    
    if (rrState) {
      rrState.currentIndex = 0;
      rrState.lastReset = new Date();
    } else {
      rrState = new RoundRobin({ 
        currentIndex: 0,
        lastReset: new Date()
      });
    }

    await rrState.save();
    return rrState;
  }

  /**
   * Get next employee in rotation (preview)
   */
  static async getNextEmployee() {
    const activeEmployees = await User.find({ role: 'employee', status: 'Active' })
      .sort({ employeeId: 1 });
    
    if (activeEmployees.length === 0) {
      return null;
    }

    let rrState = await RoundRobin.findOne();
    if (!rrState) {
      rrState = new RoundRobin({ currentIndex: 0 });
    }

    const nextEmployee = activeEmployees[rrState.currentIndex % activeEmployees.length];
    
    return {
      employee: nextEmployee,
      position: rrState.currentIndex,
      totalEmployees: activeEmployees.length
    };
  }
}

module.exports = RoundRobinService;

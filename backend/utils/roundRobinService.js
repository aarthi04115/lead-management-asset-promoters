const RoundRobin = require('../models/RoundRobin');
const User = require('../models/User');
const Lead = require('../models/Lead');

/**
 * Round Robin Utility Functions
 * Refactored for Smart Real Estate CRM schema compatibility
 */

class RoundRobinService {
    /**
     * Simple Round Robin - Sequential assignment
     * Assigns leads to employees in a cyclic manner
     */
    static async simpleRoundRobinAssign() {
        // Note: status 'Active' maps to isActive: true in our system
        const activeEmployees = await User.find({ role: 'employee', status: 'Active', isActive: true })
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
        const activeEmployees = await User.find({ role: 'employee', status: 'Active', isActive: true });

        if (activeEmployees.length === 0) {
            throw new Error('No active employees available');
        }

        const employeesWithLeadCount = await Promise.all(
            activeEmployees.map(async (emp) => ({
                employeeId: emp._id,
                employee: emp,
                // Match existing statuses: Site Visit, Negotiation, New, Attempted Call, etc.
                // We exclude 'Booked' and 'Sold' as they are terminal
                leadCount: await Lead.countDocuments({
                    assignedTo: emp._id,
                    status: { $nin: ['Booked', 'Sold'] }
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
        const activeEmployees = await User.find({ role: 'employee', status: 'Active', isActive: true })
            .sort({ score: -1, name: 1 });

        if (activeEmployees.length === 0) {
            throw new Error('No active employees available');
        }

        // Top performers rotation (top 3)
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
        const validMethods = ['round_robin', 'load_balanced', 'score_based'];

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
     * Internal helper to assign lead based on current method
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

        // Update lead using existing schema field 'assignedTo'
        // Note: No change to 'name' or 'phone' fields
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
        const activeEmployees = await User.find({ role: 'employee', status: 'Active', isActive: true });

        const stats = await Promise.all(
            activeEmployees.map(async (emp) => ({
                employeeId: emp._id,
                name: emp.name,
                totalLeads: await Lead.countDocuments({ assignedTo: emp._id }),
                activeLeads: await Lead.countDocuments({
                    assignedTo: emp._id,
                    status: { $nin: ['Booked', 'Sold'] }
                }),
                closedLeads: await Lead.countDocuments({ assignedTo: emp._id, status: 'Sold' }),
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
            rrState.totalAssignments = 0;
        } else {
            rrState = new RoundRobin({
                currentIndex: 0,
                lastReset: new Date()
            });
        }

        await rrState.save();
        return rrState;
    }
}

module.exports = RoundRobinService;

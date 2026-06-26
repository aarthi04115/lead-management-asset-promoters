/**
 * MongoDB Aggregation Pipelines for Round Robin Analytics
 * Use these pipelines for advanced reporting and analytics
 */

const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const User = require('../models/User');

class RoundRobinAnalytics {
  /**
   * Pipeline 1: Employee Performance Summary
   * Shows total leads, conversion rate, and average score per employee
   */
  static async employeePerformanceSummary() {
    return await Lead.aggregate([
      {
        $match: { assignedTo: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$assignedTo',
          totalLeads: { $sum: 1 },
          closedLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0]
            }
          },
          lostLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0]
            }
          },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $multiply: [
              { $divide: ['$closedLeads', '$totalLeads'] },
              100
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $project: {
          _id: 1,
          employeeName: '$employee.name',
          employeeEmail: '$employee.email',
          employeeScore: '$employee.score',
          totalLeads: 1,
          closedLeads: 1,
          lostLeads: 1,
          conversionRate: { $round: ['$conversionRate', 2] },
          avgLeadScore: { $round: ['$avgScore', 2] },
          maxScore: 1,
          minScore: 1
        }
      },
      {
        $sort: { conversionRate: -1 }
      }
    ]);
  }

  /**
   * Pipeline 2: Daily Assignment Trends
   * Shows number of assignments per day over time
   */
  static async dailyAssignmentTrends() {
    return await Lead.aggregate([
      {
        $match: { assignedTo: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          assignmentCount: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);
  }

  /**
   * Pipeline 3: Lead Distribution Analysis
   * Shows how leads are distributed among employees
   */
  static async leadDistributionAnalysis() {
    return await Lead.aggregate([
      {
        $match: { assignedTo: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$assignedTo',
          totalLeads: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $addFields: {
          percentageOfTotal: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$totalLeads', 100] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          employeeName: '$employee.name',
          totalLeads: 1,
          percentageOfTotal: 1
        }
      },
      {
        $sort: { totalLeads: -1 }
      }
    ]);
  }

  /**
   * Pipeline 4: Lead Status Breakdown
   * Shows leads by status across all employees
   */
  static async leadStatusBreakdown() {
    return await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      {
        $addFields: {
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$count', 100] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  /**
   * Pipeline 5: Lead Source Performance
   * Analyze which lead sources convert best
   */
  static async leadSourcePerformance() {
    return await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          totalLeads: { $sum: 1 },
          closedLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0]
            }
          },
          avgScore: { $avg: '$score' }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$closedLeads', '$totalLeads'] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: { totalLeads: -1 }
      }
    ]);
  }

  /**
   * Pipeline 6: Employee Comparison
   * Compare metrics across all employees
   */
  static async employeeComparison() {
    return await Lead.aggregate([
      {
        $match: { assignedTo: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$assignedTo',
          totalLeads: { $sum: 1 },
          closedLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0]
            }
          },
          lostLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0]
            }
          },
          attemptedCalls: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Attempted Call'] },
                1,
                0
              ]
            }
          },
          siteVisitsScheduled: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Site Visit Scheduled'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $eq: ['$totalLeads', 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$closedLeads', '$totalLeads'] },
                      100
                    ]
                  },
                  2
                ]
              }
            ]
          },
          engagementRate: {
            $cond: [
              { $eq: ['$totalLeads', 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $add: ['$attemptedCalls', '$siteVisitsScheduled']
                          },
                          '$totalLeads'
                        ]
                      },
                      100
                    ]
                  },
                  2
                ]
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $project: {
          _id: 1,
          employeeName: '$employee.name',
          employeeEmail: '$employee.email',
          employeeScore: '$employee.score',
          totalLeads: 1,
          closedLeads: 1,
          lostLeads: 1,
          attemptedCalls: 1,
          siteVisitsScheduled: 1,
          conversionRate: 1,
          engagementRate: 1
        }
      },
      {
        $sort: { conversionRate: -1 }
      }
    ]);
  }

  /**
   * Pipeline 7: High Priority Leads Analysis
   * Analyze high priority leads assignment and closure
   */
  static async highPriorityLeadsAnalysis() {
    return await Lead.aggregate([
      {
        $match: { priority: 'High' }
      },
      {
        $group: {
          _id: {
            assignedTo: '$assignedTo',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.assignedTo',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          employeeName: {
            $ifNull: ['$employee.name', 'Unassigned']
          },
          status: '$_id.status',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  /**
   * Pipeline 8: Assignment Workload Balance
   * Check if workload is balanced across employees
   */
  static async assignmentWorkloadBalance() {
    return await Lead.aggregate([
      {
        $match: {
          assignedTo: { $exists: true, $ne: null },
          status: { $nin: ['Closed', 'Lost'] }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          activeLeads: { $sum: 1 }
        }
      },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                avgLeads: { $avg: '$activeLeads' },
                maxLeads: { $max: '$activeLeads' },
                minLeads: { $min: '$activeLeads' },
                stdDevLeads: { $stdDevPop: '$activeLeads' }
              }
            }
          ],
          details: [
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'employee'
              }
            },
            {
              $unwind: '$employee'
            },
            {
              $project: {
                _id: 1,
                employeeName: '$employee.name',
                activeLeads: 1
              }
            },
            {
              $sort: { activeLeads: -1 }
            }
          ]
        }
      }
    ]);
  }

  /**
   * Execute all analytics
   */
  static async getAllAnalytics() {
    try {
      const results = {
        employeePerformance: await this.employeePerformanceSummary(),
        dailyTrends: await this.dailyAssignmentTrends(),
        leadDistribution: await this.leadDistributionAnalysis(),
        statusBreakdown: await this.leadStatusBreakdown(),
        sourcePerformance: await this.leadSourcePerformance(),
        employeeComparison: await this.employeeComparison(),
        highPriorityLeads: await this.highPriorityLeadsAnalysis(),
        workloadBalance: await this.assignmentWorkloadBalance()
      };

      return results;
    } catch (error) {
      console.error('Error executing analytics:', error);
      throw error;
    }
  }
}

module.exports = RoundRobinAnalytics;

/**
 * Usage Example:
 * 
 * const analytics = require('./utils/roundRobinAnalytics');
 * 
 * // Get single analytics
 * const performance = await analytics.employeePerformanceSummary();
 * 
 * // Get all analytics
 * const allAnalytics = await analytics.getAllAnalytics();
 */

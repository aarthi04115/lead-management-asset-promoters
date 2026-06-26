const followUpService = require('../services/followUpService');
const { users } = require('../models/User');
const { followUps } = require('../models/FollowUp');

// Get dashboard statistics
const getDashboardStats = (req, res) => {
  try {
    const stats = followUpService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// Get all follow-ups
const getAllFollowUps = (req, res) => {
  try {
    const allFollowUps = followUpService.getAllFollowUps();
    res.json(allFollowUps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching follow-ups', error: error.message });
  }
};

// Get follow-up by ID
const getFollowUpById = (req, res) => {
  try {
    const followUp = followUps.find(f => f.id === parseInt(req.params.id));
    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }
    res.json(followUp);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching follow-up', error: error.message });
  }
};

// Get overdue follow-ups
const getOverdueFollowUps = (req, res) => {
  try {
    const overdueFollowUps = followUpService.getOverdueFollowUps();
    res.json(overdueFollowUps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overdue follow-ups', error: error.message });
  }
};

// Get today's follow-ups
const getTodayFollowUps = (req, res) => {
  try {
    const todayFollowUps = followUpService.getTodayFollowUps();
    res.json(todayFollowUps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s follow-ups', error: error.message });
  }
};

// Get tomorrow's follow-ups
const getTomorrowFollowUps = (req, res) => {
  try {
    const tomorrowFollowUps = followUpService.getTomorrowFollowUps();
    res.json(tomorrowFollowUps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tomorrow\'s follow-ups', error: error.message });
  }
};

// Get all employees
const getAllEmployees = (req, res) => {
  try {
    const employees = users.filter(u => u.role === 'employee');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

// Get employee performance by ID
const getEmployeePerformanceById = (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const employee = users.find(u => u.id === employeeId && u.role === 'employee');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employeeFollowUps = followUps.filter(f => f.assignedEmployeeId === employeeId);
    const total = employeeFollowUps.length;
    const completed = employeeFollowUps.filter(f => f.status === 'completed').length;
    const pending = employeeFollowUps.filter(f => f.status === 'pending').length;
    const overdue = employeeFollowUps.filter(f => f.status === 'overdue').length;
    const upcoming = employeeFollowUps.filter(f => f.status === 'upcoming').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const lastFollowUp = employeeFollowUps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const performance = {
      employeeId: employee.id,
      employeeName: employee.name,
      employeeInitials: employee.avatar,
      totalAssigned: total,
      completed,
      pending,
      overdue,
      upcoming,
      completionPercentage,
      lastActivity: lastFollowUp ? lastFollowUp.createdAt : null
    };

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee performance', error: error.message });
  }
};

// Get employee performance (all)
const getEmployeePerformance = (req, res) => {
  try {
    const performance = followUpService.getEmployeePerformance();
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee performance', error: error.message });
  }
};

// Filter follow-ups
const filterFollowUps = (req, res) => {
  try {
    const filters = {
      search: req.query.search || '',
      employee: req.query.employee || '',
      status: req.query.status || '',
      dateFrom: req.query.dateFrom || '',
      dateTo: req.query.dateTo || ''
    };
    
    const filteredFollowUps = followUpService.filterFollowUps(filters);
    res.json(filteredFollowUps);
  } catch (error) {
    res.status(500).json({ message: 'Error filtering follow-ups', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllFollowUps,
  getFollowUpById,
  getOverdueFollowUps,
  getTodayFollowUps,
  getTomorrowFollowUps,
  getAllEmployees,
  getEmployeePerformanceById,
  getEmployeePerformance,
  filterFollowUps
};

const { followUps } = require('../models/FollowUp');
const { users } = require('../models/User');

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Helper function to format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// Helper function to check if date is today
const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Helper function to check if date is tomorrow
const isTomorrow = (dateString) => {
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

// Helper function to check if date is overdue
const isOverdue = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date < now && !isToday(dateString);
};

// Get dashboard statistics
const getDashboardStats = () => {
  const total = followUps.length;
  const pending = followUps.filter(f => f.status === 'pending').length;
  const completed = followUps.filter(f => f.status === 'completed').length;
  const overdue = followUps.filter(f => f.status === 'overdue').length;
  const upcoming = followUps.filter(f => f.status === 'upcoming').length;
  
  const today = new Date();
  const todayFollowUps = followUps.filter(f => {
    const scheduleDate = new Date(f.schedule);
    return scheduleDate.toDateString() === today.toDateString();
  }).length;

  return {
    totalFollowUps: total,
    pending,
    completed,
    overdue,
    upcoming,
    today: todayFollowUps
  };
};

// Get all follow-ups
const getAllFollowUps = () => {
  return followUps;
};

// Get overdue follow-ups
const getOverdueFollowUps = () => {
  return followUps.filter(f => f.status === 'overdue');
};

// Get today's follow-ups
const getTodayFollowUps = () => {
  return followUps.filter(f => isToday(f.schedule));
};

// Get tomorrow's follow-ups
const getTomorrowFollowUps = () => {
  return followUps.filter(f => isTomorrow(f.schedule));
};

// Get employee performance
const getEmployeePerformance = () => {
  const employees = users.filter(u => u.role === 'employee');
  
  return employees.map(employee => {
    const employeeFollowUps = followUps.filter(f => f.assignedEmployeeId === employee.id);
    const total = employeeFollowUps.length;
    const completed = employeeFollowUps.filter(f => f.status === 'completed').length;
    const pending = employeeFollowUps.filter(f => f.status === 'pending').length;
    const overdue = employeeFollowUps.filter(f => f.status === 'overdue').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      employeeInitials: employee.avatar,
      totalAssigned: total,
      completed,
      pending,
      overdue,
      completionPercentage
    };
  });
};

// Filter follow-ups
const filterFollowUps = (filters) => {
  let filtered = [...followUps];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(f => 
      f.customerName.toLowerCase().includes(searchLower) ||
      f.customerProperty.toLowerCase().includes(searchLower) ||
      f.assignedEmployee.toLowerCase().includes(searchLower) ||
      f.notes.toLowerCase().includes(searchLower)
    );
  }

  if (filters.employee) {
    filtered = filtered.filter(f => f.assignedEmployeeId === parseInt(filters.employee));
  }

  if (filters.status) {
    filtered = filtered.filter(f => f.status === filters.status);
  }

  if (filters.dateFrom) {
    const selectedDate = new Date(filters.dateFrom);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    filtered = filtered.filter(f => {
      const scheduleDate = new Date(f.schedule);
      return scheduleDate >= selectedDate && scheduleDate < nextDay;
    });
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(f => new Date(f.schedule) <= toDate);
  }

  return filtered;
};

module.exports = {
  getDashboardStats,
  getAllFollowUps,
  getOverdueFollowUps,
  getTodayFollowUps,
  getTomorrowFollowUps,
  getEmployeePerformance,
  filterFollowUps,
  formatDate,
  formatTime
};
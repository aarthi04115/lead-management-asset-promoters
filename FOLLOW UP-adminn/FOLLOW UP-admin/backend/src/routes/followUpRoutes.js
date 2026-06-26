const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');

// Dashboard stats
router.get('/dashboard', followUpController.getDashboardStats);

// Get all follow-ups
router.get('/', followUpController.getAllFollowUps);

// Filter follow-ups
router.get('/filter', followUpController.filterFollowUps);

// Get overdue follow-ups
router.get('/overdue', followUpController.getOverdueFollowUps);

// Get today's follow-ups
router.get('/today', followUpController.getTodayFollowUps);

// Get tomorrow's follow-ups
router.get('/tomorrow', followUpController.getTomorrowFollowUps);

// Get all employees
router.get('/employees', followUpController.getAllEmployees);

// Get employee performance by ID
router.get('/employees/:id/performance', followUpController.getEmployeePerformanceById);

// Get all employee performance
router.get('/employees/performance', followUpController.getEmployeePerformance);

// Get follow-up by ID (must come after specific routes)
router.get('/:id', followUpController.getFollowUpById);

module.exports = router;

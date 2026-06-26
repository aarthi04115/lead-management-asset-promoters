/**
 * Round Robin Backend - Quick Start API Testing
 * 
 * This script demonstrates how to test all round robin endpoints
 * Replace YOUR_TOKEN with actual JWT token and IDs with real data
 */

// Sample API calls using fetch or axios

const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

// ============================================
// 1. GET ROUND ROBIN STATUS
// ============================================
async function getRoundRobinStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/roundrobin/status`, {
      method: 'GET',
      headers
    });
    const data = await response.json();
    console.log('Round Robin Status:', data);
    return data;
  } catch (error) {
    console.error('Error getting status:', error);
  }
}

// ============================================
// 2. ASSIGN SINGLE LEAD
// ============================================
async function assignSingleLead(leadId, method = 'round_robin') {
  try {
    const response = await fetch(`${API_BASE_URL}/roundrobin/assign`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        leadId: leadId,
        method: method  // 'round_robin', 'load_balanced', 'score_based'
      })
    });
    const data = await response.json();
    console.log('Lead Assigned:', data);
    return data;
  } catch (error) {
    console.error('Error assigning lead:', error);
  }
}

// ============================================
// 3. ASSIGN BULK LEADS
// ============================================
async function assignBulkLeads(leadIds, method = 'round_robin') {
  try {
    const response = await fetch(`${API_BASE_URL}/roundrobin/assign-bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        leadIds: leadIds,
        method: method
      })
    });
    const data = await response.json();
    console.log('Bulk Assignment Result:', data);
    return data;
  } catch (error) {
    console.error('Error in bulk assignment:', error);
  }
}

// ============================================
// 4. CHANGE ASSIGNMENT METHOD
// ============================================
async function changeAssignmentMethod(method) {
  try {
    const response = await fetch(`${API_BASE_URL}/roundrobin/update-method`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ method: method })
    });
    const data = await response.json();
    console.log('Method Updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating method:', error);
  }
}

// ============================================
// 5. RESET ROUND ROBIN
// ============================================
async function resetRoundRobin() {
  try {
    const response = await fetch(`${API_BASE_URL}/roundrobin/reset`, {
      method: 'PUT',
      headers
    });
    const data = await response.json();
    console.log('Round Robin Reset:', data);
    return data;
  } catch (error) {
    console.error('Error resetting:', error);
  }
}

// ============================================
// 6. GET ASSIGNMENT HISTORY
// ============================================
async function getAssignmentHistory(employeeId = null, limit = 20) {
  try {
    const query = new URLSearchParams();
    if (employeeId) query.append('employeeId', employeeId);
    query.append('limit', limit);

    const response = await fetch(`${API_BASE_URL}/roundrobin/assignment-history?${query}`, {
      method: 'GET',
      headers
    });
    const data = await response.json();
    console.log('Assignment History:', data);
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
  }
}

// ============================================
// 7. GET STATISTICS
// ============================================
async function getStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/roundrobin/statistics`, {
      method: 'GET',
      headers
    });
    const data = await response.json();
    console.log('Statistics:', data);
    return data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
}

// ============================================
// 8. EXPORT ASSIGNMENTS
// ============================================
async function exportAssignments(format = 'json') {
  try {
    const response = await fetch(`${API_BASE_URL}/roundrobin/export-assignments?format=${format}`, {
      method: 'GET',
      headers
    });

    if (format === 'csv') {
      const csv = await response.text();
      console.log('CSV Export:', csv);
      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roundrobin_assignments.csv';
      a.click();
    } else {
      const data = await response.json();
      console.log('JSON Export:', data);
    }
  } catch (error) {
    console.error('Error exporting:', error);
  }
}

// ============================================
// 9. MANUAL ASSIGN LEAD
// ============================================
async function manualAssignLead(leadId, employeeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/roundrobin/manual-assign`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        leadId: leadId,
        employeeId: employeeId
      })
    });
    const data = await response.json();
    console.log('Manual Assignment:', data);
    return data;
  } catch (error) {
    console.error('Error in manual assignment:', error);
  }
}

// ============================================
// DEMO: Run a complete workflow
// ============================================
async function demoWorkflow() {
  console.log('\n========== ROUND ROBIN DEMO WORKFLOW ==========\n');

  // 1. Get current status
  console.log('1. Getting current status...');
  await getRoundRobinStatus();

  // 2. Change to load balanced
  console.log('\n2. Changing to load balanced method...');
  await changeAssignmentMethod('load_balanced');

  // 3. Get updated status
  console.log('\n3. Getting updated status...');
  await getRoundRobinStatus();

  // 4. Assign a lead (replace with real lead ID)
  console.log('\n4. Assigning single lead...');
  // await assignSingleLead('REAL_LEAD_ID_HERE', 'load_balanced');

  // 5. Get statistics
  console.log('\n5. Getting statistics...');
  await getStatistics();

  // 6. Get assignment history
  console.log('\n6. Getting assignment history...');
  await getAssignmentHistory(null, 10);

  console.log('\n========== DEMO COMPLETE ==========\n');
}

// ============================================
// USING WITH NODE.JS (using axios)
// ============================================

/**
// If using Node.js with axios, install first:
// npm install axios

const axios = require('axios');

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Example usage:
async function nodeExample() {
  try {
    // Get status
    const statusRes = await client.get('/roundrobin/status');
    console.log('Status:', statusRes.data);

    // Assign lead
    const assignRes = await client.post('/roundrobin/assign', {
      leadId: 'LEAD_ID_HERE',
      method: 'load_balanced'
    });
    console.log('Assigned:', assignRes.data);

    // Get statistics
    const statsRes = await client.get('/roundrobin/statistics');
    console.log('Stats:', statsRes.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Run it
// nodeExample();
*/

// ============================================
// EXPORT FUNCTIONS FOR TESTING
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getRoundRobinStatus,
    assignSingleLead,
    assignBulkLeads,
    changeAssignmentMethod,
    resetRoundRobin,
    getAssignmentHistory,
    getStatistics,
    exportAssignments,
    manualAssignLead,
    demoWorkflow
  };
}

// ============================================
// RUN DEMO (uncomment to test)
// ============================================
// demoWorkflow();

console.log('Round Robin API Testing Script Loaded!');
console.log('Available functions:');
console.log('- getRoundRobinStatus()');
console.log('- assignSingleLead(leadId, method)');
console.log('- assignBulkLeads(leadIds, method)');
console.log('- changeAssignmentMethod(method)');
console.log('- resetRoundRobin()');
console.log('- getAssignmentHistory(employeeId, limit)');
console.log('- getStatistics()');
console.log('- exportAssignments(format)');
console.log('- manualAssignLead(leadId, employeeId)');
console.log('- demoWorkflow()');

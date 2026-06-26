# Round Robin Lead Assignment Backend

A comprehensive round robin lead distribution system for a real estate CRM. Automatically assigns new leads to sales employees using multiple intelligent algorithms.

## 📋 Features

- **Simple Round Robin**: Sequential cyclic assignment
- **Load Balanced**: Assigns to employee with least active leads
- **Score Based**: Prioritizes high-performing employees
- **Weighted Round Robin**: Custom capacity-based assignment
- **Manual Assignment**: Override automatic assignment
- **Bulk Assignment**: Assign multiple leads at once
- **Statistics & Analytics**: Detailed assignment and performance metrics
- **Export Functionality**: Export assignments as CSV or JSON
- **Assignment History**: Track all lead assignments
- **Real-time Notifications**: Notify employees of new assignments

## 🏗️ Backend Structure

```
backend/
├── models/
│   ├── RoundRobin.js           # Round robin state & config
│   ├── User.js                 # Employee data
│   ├── Lead.js                 # Lead data
│   ├── AssignmentHistory.js    # Assignment tracking
│   └── Notification.js         # Employee notifications
├── routes/
│   ├── roundrobin.js           # Main round robin API endpoints
│   ├── leads.js                # Lead management (uses RR)
│   └── ...other routes
├── middleware/
│   ├── auth.js                 # JWT authentication
│   └── admin.js                # Admin authorization
├── utils/
│   └── roundRobinService.js    # RoundRobin utility functions
└── server.js                   # Main Express server
```

## 🚀 API Endpoints

### 1. Get Round Robin Status
```
GET /api/roundrobin/status
Headers: Authorization: Bearer <token>
Admin Only: ✅

Response:
{
  "status": "active",
  "assignmentMethod": "round_robin",
  "currentIndex": 3,
  "totalAssignments": 45,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "lastReset": "2024-01-01T00:00:00Z",
  "employeeCount": 5,
  "employeeStats": [
    {
      "employeeId": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "score": 85,
      "assignedLeads": 12,
      "closedLeads": 8,
      "totalAssignments": 25
    }
  ]
}
```

### 2. Assign Single Lead
```
POST /api/roundrobin/assign
Headers: Authorization: Bearer <token>
Admin Only: ✅

Request Body:
{
  "leadId": "60d5ec49c1234567890abcde",
  "method": "round_robin"  // optional: load_balanced, score_based
}

Response:
{
  "success": true,
  "message": "Lead assigned via round_robin",
  "lead": {
    "_id": "...",
    "customerName": "Rajesh Kumar",
    "mobile": "9876543210",
    "status": "New",
    "assignedTo": {
      "_id": "...",
      "name": "John Doe",
      "employeeId": "EMP001"
    }
  }
}
```

### 3. Assign Multiple Leads (Bulk)
```
POST /api/roundrobin/assign-bulk
Headers: Authorization: Bearer <token>
Admin Only: ✅

Request Body:
{
  "leadIds": [
    "60d5ec49c1234567890abcde",
    "60d5ec49c1234567890abcdf",
    "60d5ec49c1234567890abce0"
  ],
  "method": "round_robin"
}

Response:
{
  "success": true,
  "totalLeads": 3,
  "assignedCount": 3,
  "failedCount": 0,
  "assignmentMethod": "round_robin",
  "assignedLeads": [
    {
      "leadId": "...",
      "customerName": "Rajesh Kumar",
      "assignedTo": "..."
    }
  ],
  "failedLeads": []
}
```

### 4. Change Assignment Method
```
PUT /api/roundrobin/update-method
Headers: Authorization: Bearer <token>
Admin Only: ✅

Request Body:
{
  "method": "load_balanced"  // or: score_based, round_robin
}

Response:
{
  "success": true,
  "message": "Assignment method updated to load_balanced",
  "assignmentMethod": "load_balanced"
}
```

### 5. Reset Round Robin
```
PUT /api/roundrobin/reset
Headers: Authorization: Bearer <token>
Admin Only: ✅

Response:
{
  "success": true,
  "message": "Round robin state reset",
  "resetAt": "2024-01-15T10:30:00Z"
}
```

### 6. Get Assignment History
```
GET /api/roundrobin/assignment-history?employeeId=...&limit=20
Headers: Authorization: Bearer <token>
Admin Only: ✅

Response:
{
  "success": true,
  "count": 20,
  "history": [
    {
      "_id": "...",
      "leadId": {
        "_id": "...",
        "customerName": "Rajesh Kumar",
        "mobile": "9876543210"
      },
      "assignedTo": {
        "_id": "...",
        "name": "John Doe",
        "employeeId": "EMP001"
      },
      "assignedBy": {
        "_id": "...",
        "name": "Admin User"
      },
      "assignmentMethod": "round_robin",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 7. Get Statistics
```
GET /api/roundrobin/statistics
Headers: Authorization: Bearer <token>
Admin Only: ✅

Response:
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "employeeCount": 5,
  "statistics": [
    {
      "employeeId": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "score": 85,
      "stats": {
        "totalLeads": 25,
        "activeLeads": 12,
        "closedLeads": 8,
        "lostLeads": 5,
        "closureRate": 32.0
      }
    }
  ],
  "totalLeads": 125,
  "totalClosed": 40
}
```

### 8. Export Assignments
```
GET /api/roundrobin/export-assignments?format=csv
Headers: Authorization: Bearer <token>
Admin Only: ✅

Response (CSV):
Customer Name,Mobile,Email,Status,Assigned To,Assigned Date
"Rajesh Kumar","9876543210","raj@example.com","New","John Doe","2024-01-15T10:30:00Z"
```

### 9. Manual Lead Assignment
```
POST /api/roundrobin/manual-assign
Headers: Authorization: Bearer <token>
Admin Only: ✅

Request Body:
{
  "leadId": "60d5ec49c1234567890abcde",
  "employeeId": "60d5ec49c1234567890abcdf"
}

Response:
{
  "success": true,
  "message": "Lead manually assigned",
  "lead": {
    "_id": "...",
    "customerName": "Rajesh Kumar",
    "assignedTo": {
      "_id": "...",
      "name": "John Doe"
    }
  }
}
```

## 📊 Assignment Methods

### 1. **Simple Round Robin** (Default)
- Assigns leads sequentially to each employee
- Best for: Equal distribution when all employees have similar capacity
- Algorithm: Employee rotation based on index

```
Employee 1 → Employee 2 → Employee 3 → Employee 1 → ...
```

### 2. **Load Balanced**
- Assigns to employee with least active leads
- Best for: Varying employee capacity or workload handling
- Algorithm: Count active leads and assign to minimum

```
Emp1 (5 leads) → Emp2 (12 leads) → Emp3 (3 leads) ✓ (Choose Emp3)
```

### 3. **Score Based**
- Prioritizes top 3 highest-scoring employees
- Best for: Performance-based assignment
- Algorithm: Rotate among top performers

```
High Performers: Emp1 (95 score) → Emp2 (92 score) → Emp3 (88 score) → cycle
```

### 4. **Weighted Round Robin**
- Custom capacity weights per employee
- Best for: Skill-based assignment with custom weightage
- Algorithm: Assign based on weighted load

```
weightedLoad = currentLeads / capacityWeight
Choose employee with minimum weightedLoad
```

## 🔧 Using RoundRobinService Utility

```javascript
const RoundRobinService = require('./utils/roundRobinService');

// Assign using current method
const result = await RoundRobinService.assignLeadAuto(leadId);

// Simple round robin
const result = await RoundRobinService.simpleRoundRobinAssign();

// Load balanced
const result = await RoundRobinService.loadBalancedRoundRobin();

// Score based
const result = await RoundRobinService.scoreBasedRoundRobin();

// Get assignment method
const method = await RoundRobinService.getAssignmentMethod();

// Change method
await RoundRobinService.setAssignmentMethod('load_balanced');

// Get statistics
const stats = await RoundRobinService.getStatistics();

// Reset state
await RoundRobinService.reset();

// Preview next employee
const next = await RoundRobinService.getNextEmployee();
```

## 📝 Database Models

### RoundRobin Model
```javascript
{
  currentIndex: Number,              // Current position in employee list
  activeEmployees: [ObjectId],       // List of active employee IDs
  totalAssignments: Number,          // Total assignments made
  isActive: Boolean,                 // Is RR active
  assignmentMethod: String,          // Current method (round_robin, load_balanced, score_based, weighted)
  leadsPerEmployee: Number,          // Target leads per employee
  lastReset: Date,                   // Last reset timestamp
  lastUpdated: Date,                 // Last update timestamp
  rotationOrder: [{                  // Rotation order tracking
    employeeId: ObjectId,
    assignmentCount: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Lead Model (Updated)
```javascript
{
  customerName: String,
  mobile: String,
  email: String,
  source: String,
  intent: String,
  status: String,
  priority: String,
  score: Number,
  assignedTo: ObjectId,              // References User (Employee)
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### AssignmentHistory Model
```javascript
{
  leadId: ObjectId,                  // References Lead
  assignedTo: ObjectId,              // References User (Employee)
  assignedBy: ObjectId,              // References User (Admin)
  assignmentMethod: String,          // Method used
  previousAssignee: ObjectId,        // Previous assignee if reassigned
  createdAt: Date,
  updatedAt: Date
}
```

## 🛡️ Authentication & Authorization

All endpoints require:
- **JWT Token** in Authorization header: `Bearer <token>`
- **Admin Role** for most endpoints (except status for auth users)

Middleware files:
- `middleware/auth.js` - JWT verification
- `middleware/admin.js` - Admin check

## 📈 Performance Considerations

1. **Indexing**: Add indexes on frequently queried fields
   ```javascript
   Lead.collection.createIndex({ assignedTo: 1, status: 1 });
   User.collection.createIndex({ role: 1, status: 1 });
   ```

2. **Caching**: Consider caching active employee list
3. **Batch Operations**: Use bulk assignment for large lead imports
4. **History Cleanup**: Archive old assignment history periodically

## 🐛 Error Handling

Common errors and responses:

```javascript
400: "No active employees available for assignment"
404: "Lead not found" / "Employee not found"
401: "No token, access denied"
403: "Admin access required"
500: Server errors
```

## 📞 Integration Examples

### Creating a lead with auto-assignment
```javascript
// In your lead creation endpoint
const lead = new Lead({ customerName, mobile, email, ... });
const employeeId = await RoundRobinService.simpleRoundRobinAssign();
lead.assignedTo = employeeId;
await lead.save();
```

### Importing leads with round robin
```javascript
const leads = [...]; // Array of leads

for (const leadData of leads) {
  const lead = new Lead(leadData);
  const result = await RoundRobinService.assignLeadAuto(lead._id);
  await lead.save();
}
```

## 🚀 Setup Instructions

1. **Install dependencies** (if not already done)
   ```bash
   npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer
   npm install --save-dev nodemon
   ```

2. **Update server.js** - Already done ✅
   ```javascript
   app.use('/api/roundrobin', require('./routes/roundrobin'));
   ```

3. **Start server**
   ```bash
   npm run dev
   ```

4. **Test endpoints** using Postman or similar tool

## 📋 Testing the Round Robin

```bash
# 1. Get current status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/roundrobin/status

# 2. Change assignment method
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "load_balanced"}' \
  http://localhost:5000/api/roundrobin/update-method

# 3. Assign a lead
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"leadId": "...", "method": "round_robin"}' \
  http://localhost:5000/api/roundrobin/assign

# 4. Get statistics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/roundrobin/statistics
```

## 🎯 Best Practices

1. **Regular Monitoring**: Check statistics regularly
2. **Method Selection**: Choose method based on your business needs
3. **Employee Training**: Ensure new employees are marked "Active"
4. **Leads Quality**: Maintain good lead data quality for better assignment
5. **Feedback Loop**: Adjust methods based on performance metrics

## 📚 Related Files

- Server setup: `server.js`
- Lead routes: `routes/leads.js`
- Employee routes: `routes/employees.js`
- Models: `models/`
- Middleware: `middleware/`

## ✅ Summary

This round robin implementation provides a complete backend solution for intelligent lead distribution. It supports multiple assignment strategies, comprehensive tracking, and detailed analytics to optimize sales team productivity.


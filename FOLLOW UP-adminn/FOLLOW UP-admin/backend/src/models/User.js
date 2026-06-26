// User Model - Dummy data structure for MongoDB replacement
const users = [
  {
    id: 1,
    name: "John",
    email: "admin@crm.com",
    password: "admin123",
    role: "admin",
    avatar: "JA"
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    email: "sarah@crm.com",
    password: "employee123",
    role: "employee",
    avatar: "SJ"
  },
  {
    id: 3,
    name: "Mark Thompson",
    email: "mark@crm.com",
    password: "employee123",
    role: "employee",
    avatar: "MT"
  }
];

module.exports = { users };
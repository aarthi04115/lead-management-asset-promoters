// FollowUp Model - Dummy data structure with dynamic dates
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const dayBeforeYesterday = new Date(today);
dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 3);
const nextWeek2 = new Date(today);
nextWeek2.setDate(nextWeek2.getDate() + 5);

const followUps = [
  {
    id: 1,
    customerId: 1,
    customerName: "Jonathan Sterling",
    customerInitials: "JS",
    customerProperty: "Luxury Penthouse Estate",
    assignedEmployeeId: 2,
    assignedEmployee: "Sarah Jenkins",
    employeeInitials: "SJ",
    schedule: new Date(today.setHours(10, 30, 0, 0)).toISOString(),
    notes: "Interested in viewing the property next week",
    status: "pending",
    createdAt: new Date(yesterday.setHours(8, 0, 0, 0)).toISOString()
  },
  {
    id: 2,
    customerId: 2,
    customerName: "Alice Whitaker",
    customerInitials: "AW",
    customerProperty: "Commercial Leasing",
    assignedEmployeeId: 3,
    assignedEmployee: "Mark Thompson",
    employeeInitials: "MT",
    schedule: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
    notes: "Review contract terms for commercial space",
    status: "pending",
    createdAt: new Date(yesterday.setHours(9, 0, 0, 0)).toISOString()
  },
  {
    id: 3,
    customerId: 3,
    customerName: "Robert Baratheon",
    customerInitials: "RB",
    customerProperty: "Estate Purchase",
    assignedEmployeeId: 2,
    assignedEmployee: "Sarah Jenkins",
    employeeInitials: "SJ",
    schedule: new Date(yesterday.setHours(16, 45, 0, 0)).toISOString(),
    notes: "Urgent: Missed callback, needs reschedule",
    status: "overdue",
    createdAt: new Date(dayBeforeYesterday.setHours(10, 0, 0, 0)).toISOString()
  },
  {
    id: 4,
    customerId: 4,
    customerName: "Elena Holmes",
    customerInitials: "EH",
    customerProperty: "Townhouse Inquiry",
    assignedEmployeeId: 3,
    assignedEmployee: "Mark Thompson",
    employeeInitials: "MT",
    schedule: new Date(nextWeek.setHours(9, 15, 0, 0)).toISOString(),
    notes: "Initial contact, follow up on townhouse options",
    status: "upcoming",
    createdAt: new Date(yesterday.setHours(11, 0, 0, 0)).toISOString()
  },
  {
    id: 5,
    customerId: 5,
    customerName: "David Miller",
    customerInitials: "DM",
    customerProperty: "Luxury Villa",
    assignedEmployeeId: 2,
    assignedEmployee: "Sarah Jenkins",
    employeeInitials: "SJ",
    schedule: new Date(yesterday.setHours(11, 0, 0, 0)).toISOString(),
    notes: "Call overdue - 1 day",
    status: "overdue",
    createdAt: new Date(dayBeforeYesterday.setHours(14, 0, 0, 0)).toISOString()
  },
  {
    id: 6,
    customerId: 6,
    customerName: "Sophie Chen",
    customerInitials: "SC",
    customerProperty: "Apartment Rental",
    assignedEmployeeId: 3,
    assignedEmployee: "Mark Thompson",
    employeeInitials: "MT",
    schedule: new Date(yesterday.setHours(15, 30, 0, 0)).toISOString(),
    notes: "Email follow up - 4 hours overdue",
    status: "overdue",
    createdAt: new Date(dayBeforeYesterday.setHours(9, 0, 0, 0)).toISOString()
  },
  {
    id: 7,
    customerId: 7,
    customerName: "Michael Brown",
    customerInitials: "MB",
    customerProperty: "Office Space",
    assignedEmployeeId: 2,
    assignedEmployee: "Sarah Jenkins",
    employeeInitials: "SJ",
    schedule: new Date(nextWeek.setHours(13, 0, 0, 0)).toISOString(),
    notes: "Listing presentation scheduled",
    status: "upcoming",
    createdAt: new Date(yesterday.setHours(10, 0, 0, 0)).toISOString()
  },
  {
    id: 8,
    customerId: 8,
    customerName: "Lisa Wong",
    customerInitials: "LW",
    customerProperty: "Beach House",
    assignedEmployeeId: 3,
    assignedEmployee: "Mark Thompson",
    employeeInitials: "MT",
    schedule: new Date(nextWeek2.setHours(16, 0, 0, 0)).toISOString(),
    notes: "Follow-up call scheduled",
    status: "upcoming",
    createdAt: new Date(yesterday.setHours(8, 0, 0, 0)).toISOString()
  },
  {
    id: 9,
    customerId: 9,
    customerName: "James Wilson",
    customerInitials: "JW",
    customerProperty: "Investment Property",
    assignedEmployeeId: 2,
    assignedEmployee: "Sarah Jenkins",
    employeeInitials: "SJ",
    schedule: new Date(dayBeforeYesterday.setHours(10, 0, 0, 0)).toISOString(),
    notes: "Completed initial consultation",
    status: "completed",
    createdAt: new Date(dayBeforeYesterday.setHours(12, 0, 0, 0)).toISOString()
  },
  {
    id: 10,
    customerId: 10,
    customerName: "Emma Davis",
    customerInitials: "ED",
    customerProperty: "Family Home",
    assignedEmployeeId: 3,
    assignedEmployee: "Mark Thompson",
    employeeInitials: "MT",
    schedule: new Date(yesterday.setHours(14, 30, 0, 0)).toISOString(),
    notes: "Final inspection completed",
    status: "completed",
    createdAt: new Date(dayBeforeYesterday.setHours(9, 0, 0, 0)).toISOString()
  }
];

module.exports = { followUps };
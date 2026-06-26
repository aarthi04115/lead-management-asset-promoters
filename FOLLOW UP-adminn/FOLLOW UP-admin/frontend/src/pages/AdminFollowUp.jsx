import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Eye,
  Home,
  LogOut,
  MoreVertical,
  RefreshCcw,
  Search,
  Trash2,
  User,
  Users,
  X,
  AlertTriangle,
} from 'lucide-react';
import './AdminFollowUp.css';

const employees = [
  { id: 'emp-1', name: 'Aarav Mehta', initials: 'AM' },
  { id: 'emp-2', name: 'Neha Kapoor', initials: 'NK' },
  { id: 'emp-3', name: 'Rohan Iyer', initials: 'RI' },
  { id: 'emp-4', name: 'Priya Nair', initials: 'PN' },
  { id: 'emp-5', name: 'Vikram Rao', initials: 'VR' },
  { id: 'emp-6', name: 'Sara Khan', initials: 'SK' },
];

const properties = [
  'Skyline Heights 3BHK',
  'Palm Grove Villas',
  'Metro Square Office',
  'Lakeview Residency',
  'Green Acres Plot',
  'Urban Nest Studio',
  'Orchid County Duplex',
  'Summit Business Park',
  'Silver Oak Apartments',
  'Riverfront Towers',
];

const customers = [
  'Karthik Menon',
  'Ananya Sharma',
  'Rahul Verma',
  'Meera Joshi',
  'Siddharth Jain',
  'Nisha Reddy',
  'Aditya Kulkarni',
  'Pooja Bansal',
  'Farhan Qureshi',
  'Ishita Bose',
  'Manish Agarwal',
  'Divya Sethi',
  'Arjun Pillai',
  'Tanvi Shah',
  'Kabir Malhotra',
  'Sneha Patil',
  'Harsh Gupta',
  'Ritika Chawla',
  'Amit Desai',
  'Lavanya Rao',
];

const notes = [
  'Discussed pricing flexibility and requested callback with revised offer.',
  'Client wants brochure and floor plan shared on WhatsApp before visit.',
  'Needs confirmation from spouse before booking site visit.',
  'Interested in ready-to-move unit, asked about possession documents.',
  'Requested comparison with nearby projects and payment plan options.',
  'Asked for loan assistance details and preferred weekend callback.',
  'Follow up after virtual tour, client asked for corner unit availability.',
  'Needs rental yield estimate before moving ahead with token payment.',
  'Wants to negotiate parking charges and maintenance deposit.',
  'Requested callback after reviewing legal documents with family.',
];

const priorities = ['High', 'Medium', 'Low'];
const editableStatuses = ['Completed', 'Pending', 'Upcoming'];

const pad = (value) => String(value).padStart(2, '0');

const toDateInput = (date) => {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() - next.getTimezoneOffset());
  return next.toISOString().slice(0, 10);
};

const toTimeInput = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const addDays = (days, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const buildMockFollowUps = () =>
  Array.from({ length: 52 }, (_, index) => {
    const employee = employees[index % employees.length];
    const todaySlot = [5, 18, 31, 44].indexOf(index);
    const scheduleDate =
      todaySlot >= 0
        ? (() => {
            const today = new Date();
            today.setHours(today.getHours() + todaySlot + 1, todaySlot % 2 === 0 ? 15 : 45, 0, 0);
            return today;
          })()
        : addDays((index % 13) - 5, 9 + (index % 9), index % 2 === 0 ? 0 : 30);
    const createdAt = addDays(-18 + (index % 12), 10 + (index % 6), 15);
    const isCompleted = todaySlot === -1 && (index % 7 === 0 || index % 11 === 0);
    const storedStatus = isCompleted ? 'Completed' : scheduleDate > new Date() && index % 3 === 0 ? 'Upcoming' : 'Pending';

    return {
      id: `fu-${String(index + 1).padStart(3, '0')}`,
      customerName: customers[index % customers.length],
      property: properties[index % properties.length],
      assignedEmployeeId: employee.id,
      assignedEmployee: employee.name,
      employeeInitials: employee.initials,
      phone: `+91 98${pad((index * 37) % 100)} ${pad((index * 53) % 100)}${pad((index * 19) % 100)}`,
      whatsapp: `+91 97${pad((index * 29) % 100)} ${pad((index * 43) % 100)}${pad((index * 13) % 100)}`,
      date: toDateInput(scheduleDate),
      time: toTimeInput(scheduleDate),
      priority: priorities[index % priorities.length],
      status: storedStatus,
      notes: notes[index % notes.length],
      createdAt: createdAt.toISOString(),
      updatedAt: addDays(-4 + (index % 8), 11 + (index % 5), 45).toISOString(),
    };
  });

const parseSchedule = (record) => new Date(`${record.date}T${record.time || '00:00'}`);

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getDisplayStatus = (record, now = new Date()) => {
  if (record.status === 'Completed') return 'Completed';

  const schedule = parseSchedule(record);
  if (now > schedule) return 'Overdue';

  return record.status;
};

const statusClass = (status) => status.toLowerCase();

const emptyForm = () => {
  const tomorrow = addDays(1, 10, 0);
  return {
    customerName: '',
    property: properties[0],
    assignedEmployeeId: employees[0].id,
    phone: '',
    whatsapp: '',
    date: toDateInput(tomorrow),
    time: '10:00',
    priority: 'Medium',
    status: 'Pending',
    notes: '',
  };
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const sortBySchedule = (records) =>
  [...records].sort((a, b) => parseSchedule(a).getTime() - parseSchedule(b).getTime());

const AdminFollowUp = () => {
  const [records, setRecords] = useState(() => buildMockFollowUps());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    employee: '',
    status: '',
    priority: '',
    property: '',
    date: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeKpiFilter, setActiveKpiFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [panelMessage, setPanelMessage] = useState('');
  const [now, setNow] = useState(new Date());
  const highlightTimerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpenActionMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const enrichedRecords = useMemo(
    () =>
      records.map((record) => ({
        ...record,
        computedStatus: getDisplayStatus(record, now),
        customerInitials: getInitials(record.customerName),
      })),
    [records, now]
  );

  const stats = useMemo(
    () => ({
      today: enrichedRecords.filter((item) => isSameDay(parseSchedule(item), now) && !['Completed', 'Overdue'].includes(item.computedStatus)).length,
      upcoming: enrichedRecords.filter((item) => item.computedStatus === 'Upcoming').length,
      completed: enrichedRecords.filter((item) => item.computedStatus === 'Completed').length,
      overdue: enrichedRecords.filter((item) => item.computedStatus === 'Overdue').length,
    }),
    [enrichedRecords, now]
  );

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return enrichedRecords.filter((record) => {
      const matchesSearch =
        !query ||
        [
          record.customerName,
          record.assignedEmployee,
          record.phone,
          record.whatsapp,
          record.property,
          record.notes,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesEmployee = !appliedFilters.employee || record.assignedEmployeeId === appliedFilters.employee;
      const matchesStatus = !appliedFilters.status || record.computedStatus === appliedFilters.status;
      const matchesPriority = !appliedFilters.priority || record.priority === appliedFilters.priority;
      const matchesProperty = !appliedFilters.property || record.property === appliedFilters.property;
      const matchesDate = !appliedFilters.date || record.date === appliedFilters.date;
      const matchesKpi =
        !activeKpiFilter ||
        (activeKpiFilter === 'Today'
          ? isSameDay(parseSchedule(record), now) && !['Completed', 'Overdue'].includes(record.computedStatus)
          : record.computedStatus === activeKpiFilter);

      return matchesSearch && matchesEmployee && matchesStatus && matchesPriority && matchesProperty && matchesDate && matchesKpi;
    });
  }, [activeKpiFilter, appliedFilters, enrichedRecords, now, searchTerm]);

  const overdue = useMemo(
    () => sortBySchedule(enrichedRecords.filter((item) => item.computedStatus === 'Overdue')),
    [enrichedRecords]
  );
  const today = useMemo(
    () => sortBySchedule(enrichedRecords.filter((item) => isSameDay(parseSchedule(item), now) && !['Completed', 'Overdue'].includes(item.computedStatus))),
    [enrichedRecords, now]
  );
  const tomorrow = useMemo(
    () => {
      const nextDay = new Date(now);
      nextDay.setDate(now.getDate() + 1);
      return sortBySchedule(enrichedRecords.filter((item) => isSameDay(parseSchedule(item), nextDay) && !['Completed', 'Overdue'].includes(item.computedStatus)));
    },
    [enrichedRecords, now]
  );

  const employeeAnalytics = useMemo(
    () =>
      employees.map((employee) => {
        const assigned = enrichedRecords.filter((record) => record.assignedEmployeeId === employee.id);
        const completed = assigned.filter((record) => record.computedStatus === 'Completed').length;
        const pending = assigned.filter((record) => ['Pending', 'Upcoming'].includes(record.computedStatus)).length;
        const overdueCount = assigned.filter((record) => record.computedStatus === 'Overdue').length;

        return {
          ...employee,
          assigned: assigned.length,
          completed,
          pending,
          overdue: overdueCount,
          completionPercentage: assigned.length ? Math.round((completed / assigned.length) * 100) : 0,
        };
      }),
    [enrichedRecords]
  );

  const selectedEmployeeAnalytics = useMemo(
    () => employeeAnalytics.find((employee) => employee.id === selectedEmployee?.id),
    [employeeAnalytics, selectedEmployee]
  );

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    const cleared = { employee: '', status: '', priority: '', property: '', date: '' };
    setSearchTerm('');
    setFilters(cleared);
    setAppliedFilters(cleared);
    setHighlightedRow(null);
    setSelectedRow(null);
    setActiveKpiFilter('');
  };

  const handleKpiClick = (filterName) => {
    setActiveKpiFilter((current) => (current === filterName ? '' : filterName));
    setSelectedRow(null);
  };

  const isSearchMatch = (record) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return false;

    return [
      record.customerName,
      record.assignedEmployee,
      record.phone,
      record.whatsapp,
      record.property,
      record.notes,
    ].some((value) => value.toLowerCase().includes(query));
  };

  const openViewModal = (record) => {
    setOpenActionMenu(null);
    setSelectedRow(record.id);
    setSelectedFollowUp(record);
    setModalMode('view');
  };

  const openEditModal = (record) => {
    setOpenActionMenu(null);
    setSelectedRow(record.id);
    setSelectedFollowUp(record);
    setFormData({
      customerName: record.customerName,
      property: record.property,
      assignedEmployeeId: record.assignedEmployeeId,
      phone: record.phone,
      whatsapp: record.whatsapp,
      date: record.date,
      time: record.time,
      priority: record.priority,
      status: record.status,
      notes: record.notes,
    });
    setModalMode('edit');
  };

  const closeFollowUpModal = () => {
    setModalMode(null);
    setSelectedFollowUp(null);
    setFormData(emptyForm());
  };

  const handleFormChange = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSaveFollowUp = (event) => {
    event.preventDefault();
    const employee = employees.find((item) => item.id === formData.assignedEmployeeId);

    if (modalMode === 'edit' && selectedFollowUp) {
      setRecords((current) =>
        current.map((record) =>
          record.id === selectedFollowUp.id
            ? {
                ...record,
                ...formData,
                assignedEmployee: employee.name,
                employeeInitials: employee.initials,
                updatedAt: new Date().toISOString(),
              }
            : record
        )
      );
    }

    closeFollowUpModal();
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setRecords((current) => current.filter((record) => record.id !== deleteTarget.id));
    setDeleteTarget(null);
    setOpenActionMenu(null);
  };

  const openDeleteDialog = (record) => {
    setOpenActionMenu(null);
    setSelectedRow(record.id);
    setDeleteTarget(record);
  };

  const handleReminderClick = (item) => {
    setHighlightedRow(item.id);
    setSelectedRow(item.id);
    setActiveKpiFilter('');
    setSearchTerm('');
    const syncReminderFilters = (current) => {
      const next = { ...current };
      if (next.status && next.status !== item.computedStatus) next.status = '';
      if (next.employee && next.employee !== item.assignedEmployeeId) next.employee = '';
      if (next.property && next.property !== item.property) next.property = '';
      if (next.date && next.date !== item.date) next.date = '';
      if (next.priority && next.priority !== item.priority) next.priority = '';
      return next;
    };
    setAppliedFilters(syncReminderFilters);
    setFilters(syncReminderFilters);

    window.setTimeout(() => {
      document.getElementById(`followup-row-${item.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 50);

    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setHighlightedRow(null), 5000);
  };

  const showPanelMessage = (message) => {
    setPanelMessage(message);
    window.setTimeout(() => setPanelMessage(''), 2500);
  };

  const renderStatusBadge = (status) => (
    <span className={`status-badge ${statusClass(status)}`}>{status}</span>
  );

  const renderKpiCard = ({ key, label, value, icon, iconClass, helperClass, helperText }) => (
    <button
      type="button"
      className={`stat-card stat-card-button ${activeKpiFilter === key ? 'active' : ''}`}
      onClick={() => handleKpiClick(key)}
      aria-pressed={activeKpiFilter === key}
    >
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-info">
        <h3>{label}</h3>
        <p className="stat-number">{value}</p>
        <span className={`stat-change ${helperClass}`}>{activeKpiFilter === key ? 'Filter active' : helperText}</span>
      </div>
    </button>
  );

  const renderReminderList = (items, emptyText, showDate = false) => (
    <div className="widget-content">
      {items.length === 0 ? (
        <div className="widget-empty">{emptyText}</div>
      ) : (
        items.slice(0, 8).map((item) => (
          <button key={item.id} type="button" className="widget-item" onClick={() => handleReminderClick(item)}>
            <div className="widget-item-header">
              <span className="widget-item-title">{item.customerName}</span>
              <span className={`priority-pill ${item.priority.toLowerCase()}`}>{item.priority}</span>
            </div>
            <p className="widget-item-note">{item.notes}</p>
            <span className="widget-item-time">
              {showDate ? `${formatDate(item.date)} at ` : ''}
              {item.time} - {item.assignedEmployee}
            </span>
          </button>
        ))
      )}
    </div>
  );

  const activeFollowUp = selectedFollowUp
    ? enrichedRecords.find((record) => record.id === selectedFollowUp.id) || selectedFollowUp
    : null;

  return (
    <div className="admin-followup-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <Building2 size={28} />
            </div>
            <div>
              <h1>Elite Real Estate</h1>
              <p>Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button type="button" className="nav-item" onClick={() => showPanelMessage('Dashboard opens from the main CRM shell.')}>
            <ClipboardList size={18} />
            <span>Dashboard</span>
          </button>
          <button type="button" className="nav-item" onClick={() => showPanelMessage('Lead Management is available in the CRM shell.')}>
            <Users size={18} />
            <span>Lead Management</span>
          </button>
          <button type="button" className="nav-item active" onClick={() => showPanelMessage('You are viewing Follow-Up Management.')}>
            <CalendarDays size={18} />
            <span>Follow-Up Management</span>
          </button>
          <button type="button" className="nav-item" onClick={() => showPanelMessage('Site Visit Verification opens from the CRM shell.')}>
            <Home size={18} />
            <span>Site Visit Verification</span>
          </button>
          <button type="button" className="nav-item" onClick={() => showPanelMessage('Property Management opens from the CRM shell.')}>
            <Building2 size={18} />
            <span>Property Management</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="nav-item" onClick={() => showPanelMessage('Logout action acknowledged.')}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search customer, employee, phone, WhatsApp, property or notes..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="header-actions">
            <button className="icon-btn" type="button" title="Notifications" onClick={() => showPanelMessage(`${stats.overdue} overdue follow-ups need attention.`)}>
              <Bell size={18} />
            </button>
            <button className="icon-btn" type="button" title="Profile" onClick={() => showPanelMessage('Admin profile is active.')}>
              <User size={18} />
            </button>
            <div className="user-profile">
              <div className="avatar">AD</div>
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Senior Agent</span>
              </div>
            </div>
          </div>
        </header>

        {panelMessage && <div className="panel-message">{panelMessage}</div>}

        <div className="page-title-section">
          <div>
            <h2>Follow-Up Management</h2>
            <p>Oversee client interactions and maintain communication consistency.</p>
          </div>
        </div>

        <div className="stats-grid">
          {renderKpiCard({
            key: 'Today',
            label: "Today's Follow-Ups",
            value: stats.today,
            icon: <CalendarDays size={24} />,
            iconClass: 'blue',
            helperClass: 'positive',
            helperText: 'Live schedule',
          })}

          {renderKpiCard({
            key: 'Upcoming',
            label: 'Upcoming Follow-Ups',
            value: stats.upcoming,
            icon: <ClipboardList size={24} />,
            iconClass: 'green',
            helperClass: 'neutral',
            helperText: 'Active pipeline',
          })}

          {renderKpiCard({
            key: 'Completed',
            label: 'Completed Follow-Ups',
            value: stats.completed,
            icon: <CheckCircle2 size={24} />,
            iconClass: 'purple',
            helperClass: 'positive',
            helperText: 'Closed tasks',
          })}

          {renderKpiCard({
            key: 'Overdue',
            label: 'Overdue Follow-Ups',
            value: stats.overdue,
            icon: <AlertTriangle size={24} />,
            iconClass: 'red',
            helperClass: 'negative',
            helperText: 'Requires action',
          })}
        </div>

        <div className="engagement-section">
          <div className="section-header">
            <h3>Engagement Overview</h3>
            <div className="filters">
              <select value={filters.employee} onChange={(event) => handleFilterChange('employee', event.target.value)} className="filter-select">
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              <select value={filters.status} onChange={(event) => handleFilterChange('status', event.target.value)} className="filter-select">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
              </select>
              <select value={filters.priority} onChange={(event) => handleFilterChange('priority', event.target.value)} className="filter-select">
                <option value="">All Priority</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <select value={filters.property} onChange={(event) => handleFilterChange('property', event.target.value)} className="filter-select property-filter">
                <option value="">All Properties</option>
                {properties.map((property) => (
                  <option key={property} value={property}>
                    {property}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={filters.date}
                onChange={(event) => handleFilterChange('date', event.target.value)}
                className="date-input"
              />
              <button className="btn-primary" type="button" onClick={handleApplyFilters}>
                Apply Filters
              </button>
              <button className="btn-secondary" type="button" onClick={handleReset}>
                <RefreshCcw size={14} />
                Reset
              </button>
            </div>
          </div>

          <div className="table-summary">
            Showing {filteredRecords.length} of {records.length} follow-ups
            {activeKpiFilter && <span className="active-filter-note">KPI filter: {activeKpiFilter}</span>}
          </div>

          <div className="table-container">
            {filteredRecords.length === 0 ? (
              <div className="no-data">No follow-ups found.</div>
            ) : (
              <table className="followup-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Assigned Employee</th>
                    <th>Property</th>
                    <th>Phone</th>
                    <th>WhatsApp</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((followUp) => (
                    <tr
                      key={followUp.id}
                      id={`followup-row-${followUp.id}`}
                      className={`table-row ${highlightedRow === followUp.id ? 'highlighted' : ''} ${selectedRow === followUp.id ? 'selected' : ''} ${isSearchMatch(followUp) ? 'search-match' : ''}`}
                      onClick={() => setSelectedRow(followUp.id)}
                    >
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">{followUp.customerInitials}</div>
                          <span className="customer-name">{followUp.customerName}</span>
                        </div>
                      </td>
                      <td>
                        <button type="button" className="employee-cell employee-name-link" onClick={() => setSelectedEmployee(employees.find((item) => item.id === followUp.assignedEmployeeId))}>
                          <span className="employee-avatar">{followUp.employeeInitials}</span>
                          {followUp.assignedEmployee}
                        </button>
                      </td>
                      <td className="property-cell">{followUp.property}</td>
                      <td>{followUp.phone}</td>
                      <td>{followUp.whatsapp}</td>
                      <td>{formatDate(followUp.date)}</td>
                      <td>{followUp.time}</td>
                      <td>
                        <span className={`priority-pill ${followUp.priority.toLowerCase()}`}>{followUp.priority}</span>
                      </td>
                      <td>{renderStatusBadge(followUp.computedStatus)}</td>
                      <td className="notes-cell">{followUp.notes}</td>
                      <td className="actions-cell">
                        <div className="action-menu" onClick={(event) => event.stopPropagation()}>
                          <button
                            className="action-menu-trigger"
                            type="button"
                            onClick={() => setOpenActionMenu((current) => (current === followUp.id ? null : followUp.id))}
                            title="Open actions"
                            aria-label={`Open actions for ${followUp.customerName}`}
                            aria-expanded={openActionMenu === followUp.id}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openActionMenu === followUp.id && (
                            <div className="action-menu-dropdown">
                              <button type="button" onClick={() => openViewModal(followUp)}>
                                <Eye size={15} />
                                View Details
                              </button>
                              <button type="button" onClick={() => openEditModal(followUp)}>
                                <Edit3 size={15} />
                                Edit Follow-Up
                              </button>
                              <button type="button" className="danger" onClick={() => openDeleteDialog(followUp)}>
                                <Trash2 size={15} />
                                Delete Follow-Up
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="analytics-section">
            <div className="analytics-header">
              <h3>Employee Analytics</h3>
              <span>Calculated from current follow-ups</span>
            </div>
            <div className="analytics-grid">
              {employeeAnalytics.map((employee) => (
                <button key={employee.id} type="button" className="analytics-card" onClick={() => setSelectedEmployee(employee)}>
                  <div className="analytics-card-header">
                    <div className="employee-avatar">{employee.initials}</div>
                    <strong>{employee.name}</strong>
                  </div>
                  <div className="analytics-metrics">
                    <span>Assigned <b>{employee.assigned}</b></span>
                    <span>Completed <b>{employee.completed}</b></span>
                    <span>Pending <b>{employee.pending}</b></span>
                    <span>Overdue <b>{employee.overdue}</b></span>
                    <span>Completion <b>{employee.completionPercentage}%</b></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <aside className="right-sidebar">
        <div className="widget">
          <div className="widget-header">
            <h4>Overdue</h4>
            <span className="widget-count">{overdue.length}</span>
          </div>
          {renderReminderList(overdue, 'No overdue follow-ups', true)}
        </div>

        <div className="widget">
          <div className="widget-header">
            <h4>Today</h4>
            <span className="widget-count">{today.length}</span>
          </div>
          {renderReminderList(today, 'No follow-ups today')}
        </div>

        <div className="widget">
          <div className="widget-header">
            <h4>Tomorrow</h4>
            <span className="widget-count">{tomorrow.length}</span>
          </div>
          {renderReminderList(tomorrow, 'No follow-ups tomorrow')}
        </div>
      </aside>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content small-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Follow-Up</h2>
              <button className="modal-close" type="button" onClick={() => setDeleteTarget(null)}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this follow-up?</p>
              <p className="delete-info">
                <strong>Customer:</strong> {deleteTarget.customerName}
                <br />
                <strong>Property:</strong> {deleteTarget.property}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-delete" type="button" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMode && (
        <div className="modal-overlay" onClick={closeFollowUpModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'edit' ? 'Edit Follow-Up' : 'Follow-Up Details'}</h2>
              <button className="modal-close" type="button" onClick={closeFollowUpModal}>
                <X size={22} />
              </button>
            </div>

            {modalMode === 'view' && activeFollowUp ? (
              <>
                <div className="modal-body">
                  <div className="detail-row">
                    <label>Customer:</label>
                    <span>{activeFollowUp.customerName}</span>
                  </div>
                  <div className="detail-row">
                    <label>Property:</label>
                    <span>{activeFollowUp.property}</span>
                  </div>
                  <div className="detail-row">
                    <label>Assigned Employee:</label>
                    <button className="employee-link" type="button" onClick={() => setSelectedEmployee(employees.find((item) => item.id === activeFollowUp.assignedEmployeeId))}>
                      {activeFollowUp.assignedEmployee}
                    </button>
                  </div>
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{activeFollowUp.phone}</span>
                  </div>
                  <div className="detail-row">
                    <label>WhatsApp:</label>
                    <span>{activeFollowUp.whatsapp}</span>
                  </div>
                  <div className="detail-row">
                    <label>Follow-Up Date:</label>
                    <span>
                      {formatDate(activeFollowUp.date)} at {activeFollowUp.time}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Priority:</label>
                    <span className={`priority-pill ${activeFollowUp.priority.toLowerCase()}`}>{activeFollowUp.priority}</span>
                  </div>
                  <div className="detail-row">
                    <label>Status:</label>
                    {renderStatusBadge(activeFollowUp.computedStatus)}
                  </div>
                  <div className="detail-row">
                    <label>Notes:</label>
                    <span>{activeFollowUp.notes}</span>
                  </div>
                  <div className="detail-row">
                    <label>Created:</label>
                    <span>{formatDateTime(activeFollowUp.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <label>Updated:</label>
                    <span>{formatDateTime(activeFollowUp.updatedAt)}</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" type="button" onClick={closeFollowUpModal}>
                    Close
                  </button>
                  <button className="btn-primary" type="button" onClick={() => openEditModal(activeFollowUp)}>
                    <Edit3 size={15} />
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveFollowUp}>
                <div className="modal-body form-grid">
                  <label>
                    Customer
                    <input required value={formData.customerName} onChange={(event) => handleFormChange('customerName', event.target.value)} />
                  </label>
                  <label>
                    Assigned Employee
                    <select value={formData.assignedEmployeeId} onChange={(event) => handleFormChange('assignedEmployeeId', event.target.value)}>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Property
                    <select value={formData.property} onChange={(event) => handleFormChange('property', event.target.value)}>
                      {properties.map((property) => (
                        <option key={property} value={property}>
                          {property}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Phone
                    <input required value={formData.phone} onChange={(event) => handleFormChange('phone', event.target.value)} />
                  </label>
                  <label>
                    WhatsApp
                    <input required value={formData.whatsapp} onChange={(event) => handleFormChange('whatsapp', event.target.value)} />
                  </label>
                  <label>
                    Date
                    <input required type="date" value={formData.date} onChange={(event) => handleFormChange('date', event.target.value)} />
                  </label>
                  <label>
                    Time
                    <input required type="time" value={formData.time} onChange={(event) => handleFormChange('time', event.target.value)} />
                  </label>
                  <label>
                    Priority
                    <select value={formData.priority} onChange={(event) => handleFormChange('priority', event.target.value)}>
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Stored Status
                    <select value={formData.status} onChange={(event) => handleFormChange('status', event.target.value)}>
                      {editableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="form-status-preview">
                    <span>Display Status</span>
                    {renderStatusBadge(getDisplayStatus(formData, now))}
                  </div>
                  <label className="full-width">
                    Notes
                    <textarea required rows="4" value={formData.notes} onChange={(event) => handleFormChange('notes', event.target.value)} />
                  </label>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" type="button" onClick={closeFollowUpModal}>
                    Cancel
                  </button>
                  <button className="btn-primary" type="submit">
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {selectedEmployeeAnalytics && (
        <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="modal-content small-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Performance</h2>
              <button className="modal-close" type="button" onClick={() => setSelectedEmployee(null)}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-body">
              <div className="employee-header">
                <div className="employee-avatar-large">{selectedEmployeeAnalytics.initials}</div>
                <h3>{selectedEmployeeAnalytics.name}</h3>
              </div>
              <div className="performance-stats">
                <div className="perf-stat">
                  <span className="perf-label">Assigned:</span>
                  <span className="perf-value">{selectedEmployeeAnalytics.assigned}</span>
                </div>
                <div className="perf-stat">
                  <span className="perf-label">Completed:</span>
                  <span className="perf-value success">{selectedEmployeeAnalytics.completed}</span>
                </div>
                <div className="perf-stat">
                  <span className="perf-label">Pending:</span>
                  <span className="perf-value warning">{selectedEmployeeAnalytics.pending}</span>
                </div>
                <div className="perf-stat">
                  <span className="perf-label">Overdue:</span>
                  <span className="perf-value danger">{selectedEmployeeAnalytics.overdue}</span>
                </div>
                <div className="perf-stat">
                  <span className="perf-label">Completion %:</span>
                  <span className="perf-value">{selectedEmployeeAnalytics.completionPercentage}%</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={() => setSelectedEmployee(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFollowUp;

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
import AdminLayout from '../components/AdminLayout';
import Notification from '../components/Notification';
import { useNotify } from '../hooks/useNotify';
import api from '../api';
import './FollowUpManagement.css';

const pad = (value) => String(value).padStart(2, '0');

const toDateInput = (date) => {
    const next = new Date(date);
    if (isNaN(next.getTime())) return '';
    next.setMinutes(next.getMinutes() - next.getTimezoneOffset());
    return next.toISOString().slice(0, 10);
};

const toTimeInput = (date) => {
    const next = new Date(date);
    if (isNaN(next.getTime())) return '10:00';
    return `${pad(next.getHours())}:${pad(next.getMinutes())}`;
};

const getInitials = (name) => {
    if (!name) return '??';
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

const isSameDay = (left, right) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

const getDisplayStatus = (record, now = new Date()) => {
    if (record.status === 'Completed') return 'Completed';
    const schedule = new Date(record.schedule);
    if (now > schedule) return 'Overdue';
    return record.status === 'Pending' || record.status === 'Planned' || record.status === 'Upcoming' ? record.status : 'Pending';
};

const statusClass = (status) => status.toLowerCase();

const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const sortBySchedule = (records) =>
    [...records].sort((a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime());

const FollowUpManagement = () => {
    const { notification, notify } = useNotify();
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([
        { _id: 'emp-1', name: 'Aarav Mehta', initials: 'AM' },
        { _id: 'emp-2', name: 'Neha Kapoor', initials: 'NK' },
        { _id: 'emp-3', name: 'Rohan Iyer', initials: 'RI' },
        { _id: 'emp-4', name: 'Priya Nair', initials: 'PN' },
        { _id: 'emp-5', name: 'Vikram Rao', initials: 'VR' },
        { _id: 'emp-6', name: 'Sara Khan', initials: 'SK' },
    ]);
    const [properties, setProperties] = useState([
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
    ]);

    const [isFetching, setIsFetching] = useState(true);
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
    const [modalMode, setModalMode] = useState(null); // 'view', 'edit', 'add'
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [highlightedRow, setHighlightedRow] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [activeKpiFilter, setActiveKpiFilter] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [now, setNow] = useState(new Date());

    const [formData, setFormData] = useState({
        customerName: '',
        property: '',
        assignedTo: '',
        phone: '',
        whatsapp: '',
        date: '',
        time: '10:00',
        priority: 'Medium',
        status: 'Pending',
        notes: '',
    });

    const highlightTimerRef = useRef(null);

    // Fetch all followups
    const fetchFollowUps = async () => {
        try {
            setIsFetching(true);
            const { data } = await api.get('/followups');
            if (data && data.success) {
                setRecords(data.data);
            }
        } catch (err) {
            notify('error', 'Failed to fetch follow-ups');
        } finally {
            setIsFetching(false);
        }
    };

    // Fetch all administrative users/employees
    const fetchEmployeesAndProperties = async () => {
        try {
            const usersRes = await api.get('/auth/admin/users');
            if (usersRes.data && usersRes.data.success) {
                const filtered = usersRes.data.data.map(u => ({
                    _id: u._id,
                    name: u.name,
                    initials: getInitials(u.name)
                }));
                setEmployees(filtered);
            }
        } catch (err) {
            console.log('Using default employee fallback list.');
        }

        try {
            const propsRes = await api.get('/properties');
            if (propsRes.data && propsRes.data.success) {
                const titles = propsRes.data.data.map(p => p.title || p.name);
                if (titles.length > 0) {
                    setProperties(titles);
                }
            }
        } catch (err) {
            console.log('Using default property fallback list.');
        }
    };

    useEffect(() => {
        fetchFollowUps();
        fetchEmployeesAndProperties();
    }, []);

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

    const enrichedRecords = useMemo(() => {
        return records.map((record) => {
            const recordStatus = getDisplayStatus(record, now);
            const employeeName = record.assignedTo?.name ||
                employees.find(e => e._id === (record.assignedTo?._id || record.assignedTo))?.name ||
                'System Admin';

            return {
                ...record,
                computedStatus: recordStatus,
                customerInitials: getInitials(record.customerName),
                assignedEmployee: employeeName,
                assignedEmployeeId: record.assignedTo?._id || record.assignedTo,
                employeeInitials: getInitials(employeeName),
                phone: record.phone || '+91 9800 0000',
                whatsapp: record.whatsapp || '+91 9700 0000',
                property: record.property || properties[0],
                priority: record.priority || 'Medium',
                date: toDateInput(record.schedule),
                time: toTimeInput(record.schedule)
            };
        });
    }, [records, now, employees, properties]);

    const stats = useMemo(() => {
        return {
            today: enrichedRecords.filter((item) => isSameDay(new Date(item.schedule), now) && !['Completed', 'Overdue'].includes(item.computedStatus)).length,
            upcoming: enrichedRecords.filter((item) => item.computedStatus === 'Upcoming').length,
            completed: enrichedRecords.filter((item) => item.computedStatus === 'Completed').length,
            overdue: enrichedRecords.filter((item) => item.computedStatus === 'Overdue').length,
        };
    }, [enrichedRecords, now]);

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
                ].some((value) => value && value.toLowerCase().includes(query));

            const matchesEmployee = !appliedFilters.employee || record.assignedEmployeeId === appliedFilters.employee;
            const matchesStatus = !appliedFilters.status || record.computedStatus === appliedFilters.status;
            const matchesPriority = !appliedFilters.priority || record.priority === appliedFilters.priority;
            const matchesProperty = !appliedFilters.property || record.property === appliedFilters.property;
            const matchesDate = !appliedFilters.date || record.date === appliedFilters.date;
            const matchesKpi =
                !activeKpiFilter ||
                (activeKpiFilter === 'Today'
                    ? isSameDay(new Date(record.schedule), now) && !['Completed', 'Overdue'].includes(record.computedStatus)
                    : record.computedStatus === activeKpiFilter);

            return matchesSearch && matchesEmployee && matchesStatus && matchesPriority && matchesProperty && matchesDate && matchesKpi;
        });
    }, [activeKpiFilter, appliedFilters, enrichedRecords, now, searchTerm]);

    const overdueList = useMemo(
        () => sortBySchedule(enrichedRecords.filter((item) => item.computedStatus === 'Overdue')),
        [enrichedRecords]
    );
    const todayList = useMemo(
        () => sortBySchedule(enrichedRecords.filter((item) => isSameDay(new Date(item.schedule), now) && !['Completed', 'Overdue'].includes(item.computedStatus))),
        [enrichedRecords, now]
    );
    const tomorrowList = useMemo(
        () => {
            const nextDay = new Date(now);
            nextDay.setDate(now.getDate() + 1);
            return sortBySchedule(enrichedRecords.filter((item) => isSameDay(new Date(item.schedule), nextDay) && !['Completed', 'Overdue'].includes(item.computedStatus)));
        },
        [enrichedRecords, now]
    );

    const employeeAnalytics = useMemo(() => {
        return employees.map((employee) => {
            const assigned = enrichedRecords.filter((record) => record.assignedEmployeeId === employee._id);
            const completed = assigned.filter((record) => record.computedStatus === 'Completed').length;
            const pending = assigned.filter((record) => ['Pending', 'Upcoming'].includes(record.computedStatus)).length;
            const overdueCount = assigned.filter((record) => record.computedStatus === 'Overdue').length;

            return {
                ...employee,
                initials: employee.initials || getInitials(employee.name),
                assigned: assigned.length,
                completed,
                pending,
                overdue: overdueCount,
                completionPercentage: assigned.length ? Math.round((completed / assigned.length) * 100) : 0,
            };
        });
    }, [enrichedRecords, employees]);

    const selectedEmployeeAnalytics = useMemo(
        () => employeeAnalytics.find((employee) => employee._id === selectedEmployee?._id),
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
        ].some((value) => value && value.toLowerCase().includes(query));
    };

    const openViewModal = (record) => {
        setOpenActionMenu(null);
        setSelectedRow(record._id);
        setSelectedFollowUp(record);
        setModalMode('view');
    };

    const openAddModal = () => {
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        setFormData({
            customerName: '',
            property: properties[0] || '',
            assignedTo: employees[0]?._id || '',
            phone: '',
            whatsapp: '',
            date: toDateInput(tomorrowDate),
            time: '10:00',
            priority: 'Medium',
            status: 'Pending',
            notes: '',
        });
        setModalMode('add');
    };

    const openEditModal = (record) => {
        setOpenActionMenu(null);
        setSelectedRow(record._id);
        setSelectedFollowUp(record);
        setFormData({
            customerName: record.customerName,
            property: record.property,
            assignedTo: record.assignedEmployeeId,
            phone: record.phone,
            whatsapp: record.whatsapp,
            date: record.date,
            time: record.time,
            priority: record.priority,
            status: record.status || 'Pending',
            notes: record.notes,
        });
        setModalMode('edit');
    };

    const closeFollowUpModal = () => {
        setModalMode(null);
        setSelectedFollowUp(null);
    };

    const handleFormChange = (key, value) => {
        setFormData((current) => ({ ...current, [key]: value }));
    };

    const handleSaveFollowUp = async (event) => {
        event.preventDefault();
        try {
            const scheduleDateTime = new Date(`${formData.date}T${formData.time}`);
            const payload = {
                customerName: formData.customerName,
                property: formData.property,
                assignedTo: formData.assignedTo,
                phone: formData.phone,
                whatsapp: formData.whatsapp,
                schedule: scheduleDateTime.toISOString(),
                priority: formData.priority,
                status: formData.status,
                notes: formData.notes
            };

            if (modalMode === 'add') {
                const { data } = await api.post('/followups', payload);
                if (data && data.success) {
                    notify('success', 'Follow-up created successfully');
                    fetchFollowUps();
                }
            } else if (modalMode === 'edit' && selectedFollowUp) {
                const { data } = await api.put(`/followups/${selectedFollowUp._id}`, payload);
                if (data && data.success) {
                    notify('success', 'Follow-up updated successfully');
                    fetchFollowUps();
                }
            }
            closeFollowUpModal();
        } catch (err) {
            notify('error', err.response?.data?.message || 'Failed to save follow-up');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            const { data } = await api.delete(`/followups/${deleteTarget._id}`);
            if (data && data.success) {
                notify('success', 'Follow-up deleted successfully');
                fetchFollowUps();
            }
            setDeleteTarget(null);
            setOpenActionMenu(null);
        } catch (err) {
            notify('error', 'Failed to delete follow-up');
        }
    };

    const openDeleteDialog = (record) => {
        setOpenActionMenu(null);
        setSelectedRow(record._id);
        setDeleteTarget(record);
    };

    const handleReminderClick = (item) => {
        setHighlightedRow(item._id);
        setSelectedRow(item._id);
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
            document.getElementById(`followup-row-${item._id}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 50);

        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => setHighlightedRow(null), 5000);
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
                    <button key={item._id} type="button" className="widget-item" onClick={() => handleReminderClick(item)}>
                        <div className="widget-item-header">
                            <span className="widget-item-title">{item.customerName}</span>
                            <span className={`priority-pill ${item.priority.toLowerCase()}`}>{item.priority}</span>
                        </div>
                        <p className="widget-item-note">{item.notes}</p>
                        <span className="widget-item-time">
                            {showDate ? `${formatDate(item.schedule)} at ` : ''}
                            {item.time} - {item.assignedEmployee}
                        </span>
                    </button>
                ))
            )}
        </div>
    );

    const activeFollowUp = selectedFollowUp
        ? enrichedRecords.find((record) => record._id === selectedFollowUp._id) || selectedFollowUp
        : null;

    return (
        <AdminLayout>
            <div className="admin-followup-container">
                <main className="main-content">
                    <Notification notification={notification} />

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
                                        <option key={employee._id} value={employee._id}>
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
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
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
                            {isFetching ? (
                                <div className="no-data">Loading follow-ups...</div>
                            ) : filteredRecords.length === 0 ? (
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
                                                key={followUp._id}
                                                id={`followup-row-${followUp._id}`}
                                                className={`table-row ${highlightedRow === followUp._id ? 'highlighted' : ''} ${selectedRow === followUp._id ? 'selected' : ''} ${isSearchMatch(followUp) ? 'search-match' : ''}`}
                                                onClick={() => setSelectedRow(followUp._id)}
                                            >
                                                <td>
                                                    <div className="customer-cell">
                                                        <div className="customer-avatar">{followUp.customerInitials}</div>
                                                        <span className="customer-name">{followUp.customerName}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button type="button" className="employee-cell employee-name-link" onClick={() => setSelectedEmployee(employees.find((item) => item._id === followUp.assignedEmployeeId))}>
                                                        <span className="employee-avatar">{followUp.employeeInitials}</span>
                                                        {followUp.assignedEmployee}
                                                    </button>
                                                </td>
                                                <td className="property-cell">{followUp.property}</td>
                                                <td>{followUp.phone}</td>
                                                <td>{followUp.whatsapp}</td>
                                                <td>{formatDate(followUp.schedule)}</td>
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
                                                            onClick={() => setOpenActionMenu((current) => (current === followUp._id ? null : followUp._id))}
                                                            title="Open actions"
                                                            aria-label={`Open actions for ${followUp.customerName}`}
                                                            aria-expanded={openActionMenu === followUp._id}
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {openActionMenu === followUp._id && (
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
                                {employeeAnalytics.slice(0, 6).map((employee) => (
                                    <button key={employee._id} type="button" className="analytics-card" onClick={() => setSelectedEmployee(employee)}>
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
                            <span className="widget-count">{overdueList.length}</span>
                        </div>
                        {renderReminderList(overdueList, 'No overdue follow-ups', true)}
                    </div>

                    <div className="widget">
                        <div className="widget-header">
                            <h4>Today</h4>
                            <span className="widget-count">{todayList.length}</span>
                        </div>
                        {renderReminderList(todayList, 'No follow-ups today')}
                    </div>

                    <div className="widget">
                        <div className="widget-header">
                            <h4>Tomorrow</h4>
                            <span className="widget-count">{tomorrowList.length}</span>
                        </div>
                        {renderReminderList(tomorrowList, 'No follow-ups tomorrow')}
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
                                <h2>{modalMode === 'add' ? 'Schedule Follow-Up' : modalMode === 'edit' ? 'Edit Follow-Up' : 'Follow-Up Details'}</h2>
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
                                            <button className="employee-link" type="button" onClick={() => setSelectedEmployee(employees.find((item) => item._id === activeFollowUp.assignedEmployeeId))}>
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
                                                {formatDate(activeFollowUp.schedule)} at {activeFollowUp.time}
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
                                            <select value={formData.assignedTo} onChange={(event) => handleFormChange('assignedTo', event.target.value)}>
                                                {employees.map((employee) => (
                                                    <option key={employee._id} value={employee._id}>
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
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </label>
                                        <label>
                                            Stored Status
                                            <select value={formData.status} onChange={(event) => handleFormChange('status', event.target.value)}>
                                                <option value="Pending">Pending</option>
                                                <option value="Upcoming">Upcoming</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </label>
                                        <div className="form-status-preview">
                                            <span>Display Status</span>
                                            {renderStatusBadge(getDisplayStatus({
                                                status: formData.status,
                                                schedule: new Date(`${formData.date}T${formData.time}`)
                                            }, now))}
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
        </AdminLayout>
    );
};

export default FollowUpManagement;

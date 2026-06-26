import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import AdminLeadModal from './AdminLeadModal';
import AdminLeadForm from './AdminLeadForm';

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  navy: '#0B1220',
  darkSlate: '#0F172A',
  slate900: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',
  white: '#FFFFFF',
  amber: '#F59E0B',
  amberDark: '#D97706',
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  purple: '#7C3AED',
  indigo: '#4338CA',
};

// ─── Status Colors (matching target exactly) ──────────────────────────────────
const STATUS_MAP = {
  New: { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  'Attempted Call': { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' },
  Connected: { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  Contacted: { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  Interested: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  'Follow-Up': { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  'Site Visit Scheduled': { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  'Site Visit Completed': { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  Negotiation: { color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE' },
  Converted: { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0' },
  Closed: { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0' },
  Sold: { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0' },
  Booked: { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  Lost: { color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
};

// ─── Initials Color Palette ───────────────────────────────────────────────────
const INITIALS_COLORS = [
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#DBEAFE', color: '#1E40AF' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#FFE4E6', color: '#9F1239' },
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#E0E7FF', color: '#3730A3' },
  { bg: '#CCFBF1', color: '#134E4A' },
];

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getInitialsColor = (name) => {
  if (!name) return INITIALS_COLORS[0];
  return INITIALS_COLORS[name.charCodeAt(0) % INITIALS_COLORS.length];
};

// ─── Status Badge (matching target pill style) ────────────────────────────────
const StatusBadge = ({ status }) => {
  const style = STATUS_MAP[status] || { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 20,
      backgroundColor: style.bg,
      color: style.color,
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
      border: `1px solid ${style.border}`,
    }}>
      {status}
    </span>
  );
};

// ─── Metric Card (matching target: icon circle left, label+number right) ───────
const MetricCard = ({ label, value, icon, iconBg, loading }) => (
  <div style={{
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.slate200}`,
    borderRadius: 14,
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 0,
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    cursor: 'default',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{
      width: 44,
      height: 44,
      borderRadius: '50%',
      backgroundColor: iconBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: COLORS.slate500,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        marginBottom: 4,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 30,
        fontWeight: 800,
        color: COLORS.darkSlate,
        fontFamily: 'Outfit, sans-serif',
        lineHeight: 1,
      }}>
        {loading ? (
          <div style={{ width: 40, height: 22, backgroundColor: COLORS.slate200, borderRadius: 4 }} />
        ) : (
          value?.toLocaleString() ?? '—'
        )}
      </div>
    </div>
  </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAD_STATUSES = ['New', 'Attempted Call', 'Connected', 'Interested', 'Follow-Up', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Booked', 'Sold', 'Lost'];
const LEAD_SOURCES = ['99acres', 'MagicBricks', 'Housing.com', 'NoBroker', 'Walk-in', 'Referral', 'Social Media', 'WhatsApp', 'Google Ads', 'Facebook Ads', 'Instagram Ads', 'Cold Call', 'Website', 'Zillow', 'Newspaper Ad', 'Hoarding / Banner', 'IVR', 'Other'];

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[50, 140, 140, 120, 90, 90, 70].map((w, i) => (
      <td key={i} style={{ padding: '16px 16px' }}>
        <div style={{ height: 13, backgroundColor: COLORS.slate100, borderRadius: 4, width: w }} />
      </td>
    ))}
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminLeadManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leads, meta, loading, employees, fetchLeads, fetchEmployees, createLead, updateLead, deleteLead } = useLeads();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', source: '', assignedEmployee: '' });
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [toast, setToast] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load leads
  const loadLeads = useCallback(() => {
    const params = {
      page,
      limit: 10,
      sortBy: 'createdAt:desc',
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source }),
      ...(filters.assignedEmployee && { assignedEmployee: filters.assignedEmployee }),
    };
    fetchLeads(params);
  }, [page, debouncedSearch, filters, fetchLeads]);

  useEffect(() => { loadLeads(); }, [loadLeads]);
  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleViewLead = (lead) => { setSelectedLead(lead); setShowModal(true); };
  const handleCreateLead = () => { setEditingLead(null); setShowForm(true); };
  const handleEditLead = (lead) => { setEditingLead(lead); setShowForm(true); setShowModal(false); };

  const handleFormSubmit = async (formData) => {
    let res;
    if (editingLead) {
      res = await updateLead(editingLead._id, formData);
      if (res.success) { showToast('Lead updated successfully'); setShowForm(false); loadLeads(); }
      else showToast(res.error || 'Update failed', 'error');
    } else {
      res = await createLead(formData);
      if (res.success) { showToast('Lead created successfully'); setShowForm(false); loadLeads(); }
      else showToast(res.error || 'Creation failed', 'error');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this lead permanently?')) return;
    const res = await deleteLead(id);
    if (res.success) { showToast('Lead deleted'); loadLeads(); setShowModal(false); }
    else showToast(res.error || 'Delete failed', 'error');
  };

  const handleStatusUpdate = async (leadId, status) => {
    const res = await updateLead(leadId, { status });
    if (res.success) { showToast(`Status updated to ${status}`); loadLeads(); setShowModal(false); }
    else showToast(res.error || 'Update failed', 'error');
  };

  const totalPages = meta ? Math.ceil(meta.total / (meta.limit || 10)) : 1;
  const startItem = (page - 1) * (meta?.limit || 10) + 1;
  const endItem = Math.min(page * (meta?.limit || 10), meta?.total || 0);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Filter input/select shared style
  const filterInputStyle = {
    padding: '9px 12px',
    border: `1px solid ${COLORS.slate200}`,
    borderRadius: 8,
    fontSize: 13,
    color: COLORS.darkSlate,
    backgroundColor: COLORS.white,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'Inter, sans-serif',
    height: 38,
  };

  const filterSelectStyle = {
    ...filterInputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: 32,
  };

  return (
    <div style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10,
          backgroundColor: toast.type === 'error' ? '#FEF2F2' : '#ECFDF5',
          border: `1px solid ${toast.type === 'error' ? '#FCA5A5' : '#6EE7B7'}`,
          color: toast.type === 'error' ? '#DC2626' : '#059669',
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 22,
      }}>
        <div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.darkSlate,
            margin: 0,
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1.15,
          }}>
            Lead Management
          </h1>
          <p style={{
            fontSize: 13,
            color: COLORS.slate500,
            marginTop: 5,
            marginBottom: 0,
          }}>
            Oversee and nurture your property pipeline
          </p>
        </div>

        {/* Create New Lead button - matches target: dark bg, star icon */}
        <button
          onClick={handleCreateLead}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px',
            border: 'none',
            borderRadius: 10,
            backgroundColor: COLORS.darkSlate,
            color: COLORS.white,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1E293B'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = COLORS.darkSlate; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.15)'; }}
        >
          {/* Star / sparkle icon matching target */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Create New Lead
        </button>
      </div>

      {/* ── Metric Cards ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <MetricCard
          label="Total Leads"
          value={meta?.total ?? 0}
          loading={loading && leads.length === 0}
          iconBg={COLORS.darkSlate}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <MetricCard
          label="New Leads"
          value={leads.filter(l => l.status === 'New').length}
          loading={loading && leads.length === 0}
          iconBg="#EFF6FF"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <MetricCard
          label="Interested"
          value={leads.filter(l => l.status === 'Interested').length}
          loading={loading && leads.length === 0}
          iconBg="#FEF3C7"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
        <MetricCard
          label="Closed Leads"
          value={leads.filter(l => ['Sold', 'Closed', 'Converted', 'Booked'].includes(l.status)).length}
          loading={loading && leads.length === 0}
          iconBg="#ECFDF5"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        {/* Filter row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 14,
          alignItems: 'end',
        }}>
          {/* Search Customer */}
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.slate500,
              marginBottom: 6,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>Search Customer</div>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: COLORS.slate400 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Name, Email, Phone, Property or ID"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ ...filterInputStyle, paddingLeft: 32 }}
                onFocus={e => { e.currentTarget.style.borderColor = COLORS.slate400; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(148,163,184,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = COLORS.slate200; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.slate500, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Status</div>
            <select
              value={filters.status}
              onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              style={filterSelectStyle}
              onFocus={e => { e.currentTarget.style.borderColor = COLORS.slate400; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(148,163,184,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = COLORS.slate200; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <option value="">All Statuses</option>
              {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Source */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.slate500, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Source</div>
            <select
              value={filters.source}
              onChange={e => { setFilters(f => ({ ...f, source: e.target.value })); setPage(1); }}
              style={filterSelectStyle}
              onFocus={e => { e.currentTarget.style.borderColor = COLORS.slate400; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(148,163,184,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = COLORS.slate200; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <option value="">All Sources</option>
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.slate500, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Assigned To</div>
            <select
              value={filters.assignedEmployee}
              onChange={e => { setFilters(f => ({ ...f, assignedEmployee: e.target.value })); setPage(1); }}
              style={filterSelectStyle}
              onFocus={e => { e.currentTarget.style.borderColor = COLORS.slate400; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(148,163,184,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = COLORS.slate200; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <option value="">Everyone</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters toggle row */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setShowAdvancedFilters(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, color: COLORS.slate500,
              padding: '4px 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = COLORS.darkSlate}
            onMouseLeave={e => e.currentTarget.style.color = COLORS.slate500}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" />
            </svg>
            Advanced Filters
          </button>

          {(search || filters.status || filters.source || filters.assignedEmployee) && (
            <button
              onClick={() => { setFilters({ status: '', source: '', assignedEmployee: '' }); setSearch(''); setPage(1); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500, color: COLORS.red,
                padding: '4px 0',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* ── Leads Table ───────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.slate200}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.white, borderBottom: `1.5px solid ${COLORS.slate200}` }}>
                {[
                  { label: 'LEAD ID', width: 70 },
                  { label: 'CUSTOMER NAME', width: 160 },
                  { label: 'CONTACT DETAILS', width: 160 },
                  { label: 'PROPERTY INTEREST', width: 160 },
                  { label: 'ASSIGNED', width: 120 },
                  { label: 'STATUS', width: 130 },
                  { label: 'ACTIONS', width: 110 },
                ].map(col => (
                  <th key={col.label} style={{
                    padding: '13px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    color: COLORS.slate500,
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.07em',
                    minWidth: col.width,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: COLORS.slate400, fontSize: 14 }}>
                    <div>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    No leads found. Try adjusting your filters or create a new lead.
                  </td>
                </tr>
              ) : (
                leads.map((lead, idx) => {
                  const initColor = getInitialsColor(lead.customerName);
                  const assignedName = lead.assignedEmployee?.name
                    || (typeof lead.assignedTo === 'object' ? lead.assignedTo?.name : lead.assignedTo)
                    || null;
                  const assignedInitials = assignedName ? getInitials(assignedName) : null;
                  const assignedColor = getInitialsColor(assignedName || '');

                  // Lead display ID: #1, #2, #3 matching target
                  const displayId = `#${idx + 1 + (page - 1) * (meta?.limit || 10)}`;

                  return (
                    <tr
                      key={lead._id}
                      style={{
                        borderBottom: `1px solid ${COLORS.slate100}`,
                        transition: 'background 0.12s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.slate50}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => handleViewLead(lead)}
                    >
                      {/* Lead ID */}
                      <td style={{ padding: '14px 16px', fontSize: 13, color: COLORS.slate500, fontWeight: 500 }}>
                        {displayId}
                      </td>

                      {/* Customer Name */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            backgroundColor: initColor.bg, color: initColor.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                          }}>
                            {getInitials(lead.customerName)}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.darkSlate }}>
                            {lead.customerName}
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 13, color: COLORS.slate700, fontWeight: 500 }}>
                          {lead.mobile || lead.phone || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.slate400, marginTop: 2 }}>
                          {lead.email || '—'}
                        </div>
                      </td>

                      {/* Property Interest */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.darkSlate, lineHeight: 1.3 }}>
                          {lead.propertyInterested?.name || lead.propertyInterestedText || '—'}
                        </div>
                        {lead.source && (
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: COLORS.amber,
                            marginTop: 2, display: 'inline-block',
                          }}>
                            {lead.source}
                          </span>
                        )}
                      </td>

                      {/* Assigned */}
                      <td style={{ padding: '14px 16px' }}>
                        {assignedName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%',
                              backgroundColor: assignedColor.bg, color: assignedColor.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700, flexShrink: 0,
                            }}>
                              {assignedInitials}
                            </div>
                            <span style={{ fontSize: 13, color: COLORS.slate600 }}>
                              {assignedName.split(' ')[0]} {assignedName.split(' ')[1]?.[0] ? assignedName.split(' ')[1][0] + '.' : ''}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: COLORS.slate400, fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
                          {/* View */}
                          <button
                            onClick={() => handleViewLead(lead)}
                            style={{
                              width: 30, height: 30, borderRadius: 7,
                              border: `1px solid ${COLORS.slate200}`,
                              backgroundColor: COLORS.white,
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                              color: COLORS.slate500,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = COLORS.slate50; e.currentTarget.style.borderColor = COLORS.slate300; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = COLORS.white; e.currentTarget.style.borderColor = COLORS.slate200; }}
                            title="View details"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleEditLead(lead)}
                            style={{
                              width: 30, height: 30, borderRadius: 7,
                              border: `1px solid ${COLORS.slate200}`,
                              backgroundColor: COLORS.white,
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                              color: COLORS.blue,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = COLORS.white; e.currentTarget.style.borderColor = COLORS.slate200; }}
                            title="Edit lead"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            style={{
                              width: 30, height: 30, borderRadius: 7,
                              border: `1px solid ${COLORS.slate200}`,
                              backgroundColor: COLORS.white,
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                              color: COLORS.red,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = COLORS.white; e.currentTarget.style.borderColor = COLORS.slate200; }}
                            title="Delete lead"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderTop: `1px solid ${COLORS.slate200}`,
          backgroundColor: COLORS.white,
        }}>
          <span style={{ fontSize: 13, color: COLORS.slate500 }}>
            Showing {meta?.total === 0 ? 0 : startItem}–{endItem} of {(meta?.total ?? 0).toLocaleString()} leads
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 7, border: `1px solid ${COLORS.slate200}`,
                backgroundColor: COLORS.white, cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: page === 1 ? COLORS.slate300 : COLORS.slate600,
                transition: 'all 0.15s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 7,
                  border: p === page ? `1px solid ${COLORS.darkSlate}` : `1px solid ${COLORS.slate200}`,
                  backgroundColor: p === page ? COLORS.darkSlate : COLORS.white,
                  color: p === page ? COLORS.white : COLORS.slate600,
                  fontSize: 13, fontWeight: p === page ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 7, border: `1px solid ${COLORS.slate200}`,
                backgroundColor: COLORS.white,
                cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                color: (page === totalPages || totalPages === 0) ? COLORS.slate300 : COLORS.slate600,
                transition: 'all 0.15s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Lead Detail Modal ─────────────────────────────────────────────── */}
      {showModal && selectedLead && (
        <AdminLeadModal
          lead={selectedLead}
          employees={employees}
          onClose={() => setShowModal(false)}
          onEdit={() => handleEditLead(selectedLead)}
          onDelete={() => handleDeleteLead(selectedLead._id)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* ── Create/Edit Form ──────────────────────────────────────────────── */}
      {showForm && (
        <AdminLeadForm
          lead={editingLead}
          employees={employees}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default AdminLeadManagement;

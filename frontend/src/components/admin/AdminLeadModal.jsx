import React, { useState, useEffect } from 'react';
import { useLeads } from '../../context/LeadContext';
import StatusBadge from '../shared/StatusBadge';
import InitialsBadge from '../shared/InitialsBadge';
import api from '../../api';

const LEAD_STATUSES = [
  'New', 'Attempted Call', 'Connected', 'Interested', 'Follow-Up',
  'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Booked', 'Sold', 'Lost'
];

const WORKFLOW_STAGES = [
  'New', 'Attempted Call', 'Connected', 'Interested', 'Site Visit', 'Negotiation', 'Booked', 'Sold'
];

const inputStyle = {
  padding: '9px 12px',
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  fontSize: 13,
  color: '#1E293B',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  width: '100%',
  fontFamily: 'Inter, sans-serif',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 32,
};

const AdminLeadModal = ({ lead, employees, onClose, onEdit, onDelete, onStatusUpdate }) => {
  const { fetchLeadById, leadDetails, updateLead } = useLeads();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(lead.status);
  const [selectedAssignee, setSelectedAssignee] = useState(lead.assignedEmployee?._id || '');
  const [updating, setUpdating] = useState(false);
  const [detail, setDetail] = useState(lead);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    loadLeadDetails();
  }, [lead._id]);

  const loadLeadDetails = async () => {
    try {
      const res = await api.get(`/leads/${lead._id}`);
      const d = res.data.data;
      setDetail(d);
      setSelectedStatus(d.status);
      setSelectedAssignee(d.assignedEmployee?._id || '');
      // Activity log as timeline
      if (d.activityLog) {
        setTimeline(d.activityLog);
      }
    } catch (err) {
      console.error('Failed to load lead details:', err);
    }
  };

  const getStageIndex = (status) => {
    const map = {
      'New': 0, 'Attempted Call': 1, 'Connected': 2, 'Contacted': 2,
      'Interested': 3, 'Follow-Up': 3, 'Site Visit Scheduled': 4,
      'Site Visit Completed': 4, 'Negotiation': 5, 'Booked': 6,
      'Sold': 7, 'Converted': 7, 'Closed': 7,
    };
    return map[status] ?? 0;
  };

  const currentStage = getStageIndex(detail.status);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    await onStatusUpdate(lead._id, selectedStatus);
    setUpdating(false);
  };

  const handleAssigneeUpdate = async (val) => {
    setSelectedAssignee(val);
    setUpdating(true);
    await updateLead(lead._id, { assignedEmployee: val || null });
    setUpdating(false);
    await loadLeadDetails();
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await api.post(`/leads/${lead._id}/notes`, { content: newNote });
      setNewNote('');
      await loadLeadDetails();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const daysAgo = detail.createdAt
    ? Math.floor((Date.now() - new Date(detail.createdAt)) / 86400000)
    : 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          width: '100%',
          maxWidth: 860,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '24px 28px 0', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <InitialsBadge name={detail.customerName} size={52} dark />
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit, sans-serif' }}>
                  {detail.customerName}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
                  Lead ID: #{detail._id?.slice(-4)} • Registered {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatusBadge status={detail.status} />
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Workflow Progress Bar */}
          <div style={{ paddingBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', paddingBottom: 20 }}>
              {WORKFLOW_STAGES.map((stage, idx) => (
                <React.Fragment key={stage}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: idx < WORKFLOW_STAGES.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: idx <= currentStage ? '#0F172A' : '#E2E8F0',
                        border: idx === currentStage ? '2px solid #F59E0B' : `2px solid ${idx <= currentStage ? '#0F172A' : '#E2E8F0'}`,
                        flexShrink: 0,
                        zIndex: 1,
                        transition: 'all 0.3s',
                      }} />
                      {idx < WORKFLOW_STAGES.length - 1 && (
                        <div style={{
                          flex: 1,
                          height: 2,
                          backgroundColor: idx < currentStage ? '#0F172A' : '#E2E8F0',
                          transition: 'background 0.3s',
                        }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: 9,
                      fontWeight: idx === currentStage ? 700 : 500,
                      color: idx === currentStage ? '#F59E0B' : idx <= currentStage ? '#0F172A' : '#CBD5E1',
                      marginTop: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                    }}>
                      {stage}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Progress bar fill */}
          <div style={{ height: 3, backgroundColor: '#E2E8F0', borderRadius: 2, marginTop: -4 }}>
            <div style={{
              height: '100%',
              width: `${(currentStage / (WORKFLOW_STAGES.length - 1)) * 100}%`,
              backgroundColor: '#F59E0B',
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }} />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 16 }}>
            {['overview', 'timeline', 'notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #0F172A' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === tab ? '#0F172A' : '#94A3B8',
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {tab === 'overview' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    Overview
                  </span>
                ) : tab === 'timeline' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    Timeline
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Notes
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left sidebar — always visible */}
          <div style={{ width: 180, borderRight: '1px solid #F1F5F9', padding: '20px 16px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['overview', 'timeline', 'notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  border: 'none',
                  borderRadius: 8,
                  backgroundColor: activeTab === tab ? '#F1F5F9' : 'transparent',
                  color: activeTab === tab ? '#0F172A' : '#94A3B8',
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  textTransform: 'capitalize',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.1s',
                }}
              >
                {tab === 'overview' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                ) : tab === 'timeline' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                )}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Right content area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {/* ── Overview Tab ──────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                    Lead Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
                    {[
                      { label: 'EMAIL ADDRESS', value: detail.email },
                      { label: 'PHONE NUMBER', value: detail.mobile },
                      { label: 'PROPERTY INTEREST', value: detail.propertyInterested?.name || detail.propertyInterestedText },
                      { label: 'INQUIRY SOURCE', value: detail.source },
                      { label: 'CAMPAIGN', value: detail.campaign || '—' },
                      { label: 'REGISTERED', value: formatDate(detail.createdAt) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 500 }}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                    Internal Assignment
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    {detail.assignedEmployee ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <InitialsBadge name={detail.assignedEmployee.name} size={40} dark />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{detail.assignedEmployee.name}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>Senior Account Executive</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssigneeUpdate('')}
                          style={{
                            padding: '6px 14px',
                            border: '1px solid #E2E8F0',
                            borderRadius: 7,
                            backgroundColor: '#FFFFFF',
                            color: '#374151',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Re-assign
                        </button>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                        <span style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>Unassigned</span>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <select
                            value={selectedAssignee}
                            onChange={e => handleAssigneeUpdate(e.target.value)}
                            style={{ ...selectStyle, flex: 1 }}
                          >
                            <option value="">Select Employee...</option>
                            {employees?.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Update Status */}
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
                    Update Status
                  </h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <select
                      value={selectedStatus}
                      onChange={e => setSelectedStatus(e.target.value)}
                      style={{ ...selectStyle, flex: 1 }}
                    >
                      {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updating}
                      style={{
                        padding: '9px 18px',
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: updating ? 'not-allowed' : 'pointer',
                        opacity: updating ? 0.7 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {updating ? 'Saving…' : 'Save Status'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Timeline Tab ─────────────────────────────────── */}
            {activeTab === 'timeline' && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>
                  Lifecycle Timeline
                </h3>
                {timeline.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 14 }}>
                    No activity recorded yet.
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: 24 }}>
                    <div style={{ position: 'absolute', left: 5, top: 0, bottom: 0, width: 2, backgroundColor: '#E2E8F0', borderRadius: 2 }} />
                    {timeline.map((item, idx) => (
                      <div key={item._id || idx} style={{ position: 'relative', marginBottom: 24 }}>
                        <div style={{
                          position: 'absolute',
                          left: -20,
                          top: 2,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: item.action?.includes('Status') ? '#10B981' : item.action?.includes('Note') ? '#6366F1' : '#3B82F6',
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 0 0 2px #E2E8F0',
                        }} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{item.action || item.type}</div>
                        <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{item.details || item.content}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                          {formatDate(item.createdAt)}
                          {item.performedBy && ` · ${item.performedBy.name}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Notes Tab ────────────────────────────────────── */}
            {activeTab === 'notes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                    Lead Notes
                  </h3>
                  <button
                    onClick={handleAddNote}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px',
                      border: '1px solid #E2E8F0',
                      borderRadius: 7,
                      backgroundColor: '#FFFFFF',
                      color: '#F59E0B',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    New Note
                  </button>
                </div>

                {/* New Note Input */}
                <div style={{ marginBottom: 16 }}>
                  <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add a note about this lead..."
                    style={{
                      ...inputStyle,
                      minHeight: 80,
                      resize: 'vertical',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    style={{
                      marginTop: 8,
                      padding: '8px 16px',
                      backgroundColor: newNote.trim() ? '#0F172A' : '#E2E8F0',
                      color: newNote.trim() ? '#FFFFFF' : '#94A3B8',
                      border: 'none',
                      borderRadius: 7,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: newNote.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Add Note
                  </button>
                </div>

                {/* Existing Notes */}
                {detail.activityLog?.filter(l => l.action?.includes('Note') || l.type === 'note').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 14 }}>
                    No notes yet. Add the first note above.
                  </div>
                ) : (
                  detail.activityLog?.filter(l => l.action?.includes('Note') || l.type === 'note').map((note, idx) => (
                    <div key={note._id || idx} style={{
                      padding: '14px 16px',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      marginBottom: 10,
                      backgroundColor: '#F8FAFC',
                    }}>
                      <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                        "{note.details || note.content}"
                      </p>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                        ADDED BY {note.performedBy?.name?.toUpperCase() || 'ADMIN'} · {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadModal;

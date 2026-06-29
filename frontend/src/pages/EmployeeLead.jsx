import React, { useState, useEffect, useMemo, useCallback } from 'react';
import EmployeeLayout from '../components/EmployeeLayout';
import { useAuth } from '../context/AuthContext';
import { useRBAC } from '../utils/rbac';
import { useSearch } from '../context/SearchContext';
import api from '../api';
import { useLeads } from '../context/LeadContext';
import { useFollowUp } from '../context/FollowUpContext';

const StatusBadge = ({ status, size = 'md' }) => {
    const padding = size === 'sm' ? 'px-2.5 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]';

    return (
        <span
            className={`${padding} rounded-full bg-secondary-fixed text-secondary font-semibold uppercase inline-flex items-center whitespace-nowrap tracking-wide`}
        >
            {status}
        </span>
    );
};

const COLORS = [
    'bg-blue-100 text-blue-800',
    'bg-amber-100 text-amber-800',
    'bg-emerald-100 text-emerald-800',
    'bg-red-100 text-red-800',
    'bg-sky-100 text-sky-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-green-100 text-green-800',
];

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const InitialsBadge = ({ name, size = 36, dark = false }) => {
    const isLarge = size > 40;
    const baseClasses = isLarge
        ? "w-16 h-16 rounded-2xl font-bold text-2xl"
        : "w-8 h-8 rounded-full font-bold text-xs";

    const colorClasses = dark
        ? "bg-surface-container text-primary border border-outline-variant/60"
        : "bg-primary-container text-white shadow-sm";

    return (
        <div className={`${baseClasses} ${colorClasses} flex items-center justify-center flex-shrink-0 uppercase`}>
            {getInitials(name)}
        </div>
    );
};

const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    const getPageNumbers = () => {
        const pages = [];
        const delta = 1;
        const range = [];
        for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
            range.push(i);
        }
        if (page - delta > 2) range.unshift('...');
        if (page + delta < totalPages - 1) range.push('...');
        pages.push(1);
        pages.push(...range);
        if (totalPages > 1) pages.push(totalPages);
        return pages;
    };

    const pageNumbers = totalPages > 0 ? getPageNumbers() : [];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-outline-variant/30 gap-4 bg-surface-container-low/30">
            <span className="text-sm font-semibold text-on-surface-variant">
                Showing {total === 0 ? 0 : start}–{end} of <span className="font-extrabold text-primary">{total}</span> {total === 1 ? 'lead' : 'leads'}
            </span>

            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/30 transition-all font-semibold text-sm ${page === 1
                        ? 'bg-surface-container text-outline cursor-not-allowed opacity-40'
                        : 'bg-white text-on-surface hover:bg-surface-container cursor-pointer'
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {/* Pages */}
                {pageNumbers.map((p, idx) =>
                    p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-9 text-center font-bold text-on-surface-variant">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all font-semibold text-sm ${p === page
                                ? 'bg-primary-container text-white border-primary-container font-extrabold shadow-sm'
                                : 'bg-white text-on-surface border-outline-variant/30 hover:bg-surface-container'
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || totalPages === 0}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/30 transition-all font-semibold text-sm ${page === totalPages || totalPages === 0
                        ? 'bg-surface-container text-outline cursor-not-allowed opacity-40'
                        : 'bg-white text-on-surface hover:bg-surface-container cursor-pointer'
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
            </div>
        </div>
    );
};

const LEAD_STATUSES = [
    'New', 'Attempted Call', 'Connected', 'Interested', 'Follow-Up',
    'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Booked', 'Sold', 'Lost'
];

const WORKFLOW_STAGES = [
    'New', 'Attempted Call', 'Connected', 'Interested', 'Site Visit', 'Negotiation', 'Booked', 'Sold'
];

const selectClass = "w-full p-3 bg-surface-bright border border-outline rounded-xl focus:border-secondary outline-none font-medium text-sm text-on-surface shadow-sm";

const EmployeeLeadModal = ({ lead, onClose, onStatusUpdate }) => {
    const { user } = useAuth();
    const { can } = useRBAC();
    const [activeTab, setActiveTab] = useState('overview');
    const [detail, setDetail] = useState(lead);
    const [selectedStatus, setSelectedStatus] = useState(lead.status);

    // Connect to FollowUpContext
    const { openEditModal } = useFollowUp();
    const [updating, setUpdating] = useState(false);
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        loadDetail();
    }, [lead._id]);

    const loadDetail = async () => {
        try {
            const res = await api.get(`/leads/${lead._id}`);
            if (res.data && res.data.success) {
                setDetail(res.data.data);
                setSelectedStatus(res.data.data.status);
            }
        } catch (err) {
            console.error('Failed to load detail:', err);
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
        const performedBy = user ? { id: user._id, name: user.name } : null;
        try {
            let res;
            if (typeof onStatusUpdate === 'function') {
                res = await onStatusUpdate(lead._id, selectedStatus, performedBy);
            } else {
                res = await api.put(`/leads/${lead._id}/status`, { status: selectedStatus, performedBy });
            }

            setDetail(prev => ({ ...prev, status: selectedStatus }));
            if (res?.data?.success) {
                setDetail(res.data.data);
            } else if (res?.data) {
                setDetail(res.data);
            }
        } catch (err) {
            console.error('Status update request failed:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            const addedBy = user ? { id: user._id, name: user.name } : { id: null, name: 'Unknown' };
            const res = await api.post(`/leads/${lead._id}/notes`, { text: newNote, addedBy });
            if (res?.data?.success) {
                setNewNote('');
                setDetail(res.data.data);
                setActiveTab('notes');
            } else if (res?.data) {
                setNewNote('');
                setDetail(res.data);
                setActiveTab('notes');
            }
        } catch (err) {
            console.error('Failed to add note:', err);
        }
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const timelineItems = useMemo(() => {
        const activities = [...(detail.activities || detail.activityLog || [])].map(a => ({
            ...a,
            date: new Date(a.createdAt)
        }));

        const followUps = (detail.followUps || []).map(f => ({
            id: f._id || f.id,
            type: 'follow_up',
            action: `Follow-up: ${f.status || 'Pending'}`,
            details: f.notes || `Scheduled for ${f.followUpDate} ${f.followUpTime || ''}`,
            createdAt: f.createdAt || f.followUpDate,
            date: new Date(f.createdAt || f.followUpDate),
            performedBy: f.employeeName ? { name: f.employeeName } : null
        }));

        const siteVisits = (detail.siteVisits || []).map(s => ({
            id: s._id || s.id,
            type: 'site_visit',
            action: `Site Visit: ${s.status || 'Pending'}`,
            details: s.remarks || `Distance: ${s.distance ? s.distance.toFixed(2) : 0}km`,
            createdAt: s.createdAt || s.visitTime,
            date: new Date(s.createdAt || s.visitTime),
            performedBy: s.employeeName ? { name: s.employeeName } : null
        }));

        return [...activities, ...followUps, ...siteVisits]
            .sort((a, b) => b.date - a.date);
    }, [detail.activities, detail.activityLog, detail.followUps, detail.siteVisits]);

    const noteItems = useMemo(() => {
        return [...(detail.notes || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [detail.notes]);

    const qualifyPercent = Math.min(100, Math.round(((currentStage + 1) / WORKFLOW_STAGES.length) * 100));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
                {/* Modal Header */}
                <div className="p-8 border-b border-outline-variant/30 bg-surface-container-low">
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                            <InitialsBadge name={detail.customerName} size={56} dark />
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold text-primary tracking-tight font-display m-0">
                                        {detail.name || detail.customerName || 'Not Available'}
                                    </h2>
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] tracking-wide uppercase">
                                        HIGH PRIORITY
                                    </span>
                                </div>
                                <p className="text-xs text-on-surface-variant font-semibold m-0">
                                    Lead ID: #LD-{detail._id?.slice(-4) || 'N/A'} • Created {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {['overview', 'timeline', 'notes'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 font-bold text-xs uppercase tracking-wider transition-colors border-b-2 -mb-[34px] ${activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-surface space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-extrabold text-on-surface-variant/80 uppercase tracking-widest mb-3">
                                        Contact Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-semibold text-on-surface">
                                            <span className="material-symbols-outlined text-[20px] text-primary">mail</span>
                                            {detail.email || 'Not Available'}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-semibold text-on-surface">
                                            <span className="material-symbols-outlined text-[20px] text-primary">call</span>
                                            {detail.phone || detail.mobile || 'Not Available'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-extrabold text-on-surface-variant/80 uppercase tracking-widest mb-3">
                                        Property Interest
                                    </h4>
                                    <div className="border border-outline-variant/60 rounded-2xl overflow-hidden bg-white shadow-sm">
                                        <div className="h-16 bg-gradient-to-br from-primary to-primary-container" />
                                        <div className="p-4">
                                            <div className="font-bold text-sm text-on-surface">
                                                {detail.property || detail.propertyInterested?.name || detail.propertyInterestedText || 'Not Available'}
                                            </div>
                                            <div className="text-xs text-on-surface-variant font-medium mt-1">
                                                {detail.propertyInterested?.location || 'Not Available'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-extrabold text-on-surface-variant/80 uppercase tracking-widest mb-2">
                                        Lead Source
                                    </h4>
                                    <span className="inline-block px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface mb-4">
                                        {detail.source || 'Not Available'}
                                    </span>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="border border-outline-variant/60 rounded-2xl p-6 bg-white shadow-sm space-y-4">
                                    <h4 className="text-[10px] font-extrabold text-on-surface-variant/80 uppercase tracking-widest mb-1">
                                        Current Status
                                    </h4>

                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-on-surface-variant">{detail.status}</span>
                                        <span className="font-extrabold text-on-surface">{qualifyPercent}% Qualify</span>
                                    </div>
                                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-secondary transition-all duration-500 ease-out"
                                            style={{ width: `${qualifyPercent}%` }}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <select
                                            value={selectedStatus}
                                            onChange={e => setSelectedStatus(e.target.value)}
                                            className={selectClass}
                                        >
                                            {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>

                                        {can('update_own_lead_status') ? (
                                            <button
                                                onClick={handleStatusUpdate}
                                                disabled={updating}
                                                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center ${updating
                                                    ? 'bg-surface-container-high text-outline cursor-not-allowed'
                                                    : 'bg-primary text-white hover:bg-opacity-95 shadow-sm active:scale-95'
                                                    }`}
                                            >
                                                {updating ? 'Updating…' : 'Update Status'}
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center bg-surface-container text-on-surface-variant cursor-not-allowed opacity-60"
                                                title="Access Restricted"
                                            >
                                                <span className="material-symbols-outlined text-[20px] mr-2">lock</span>
                                                Update Status
                                            </button>
                                        )}

                                        {can('create_followup') && (
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    openEditModal({
                                                        leadId: detail._id,
                                                        assignedTo: detail.assignedTo || detail.assignedEmployee?.id || detail.assignedEmployee || null,
                                                        customerName: detail.customerName || detail.name,
                                                        phoneNumber: detail.mobile || detail.phone,
                                                        propertyName: detail.propertyInterested || detail.property
                                                    });
                                                }}
                                                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider border-2 border-primary text-primary hover:bg-primary-container/10 transition-colors bg-transparent"
                                            >
                                                Schedule Follow-Up
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="border border-outline-variant/60 rounded-2xl p-6 bg-white shadow-sm">
                                    <h4 className="text-[10px] font-extrabold text-on-surface-variant/80 uppercase tracking-widest mb-3">
                                        Pending Tasks
                                    </h4>
                                    {(!detail.followUps?.length && !detail.siteVisits?.length) ? (
                                        <div className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-6 text-center bg-surface-bright space-y-2">
                                            <span className="material-symbols-outlined text-[28px] text-outline">task</span>
                                            <p className="text-xs text-on-surface-variant font-semibold">No pending tasks for this lead.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(detail.followUps || []).filter(f => f.status !== 'Completed').map(f => (
                                                <div key={`fu-${f._id}`} className="p-3 border border-outline-variant/60 rounded-xl bg-surface-bright flex flex-col gap-1 shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-bold text-primary">Follow-Up</span>
                                                        <span className="text-[9px] bg-secondary-fixed text-secondary px-2 py-0.5 rounded font-extrabold uppercase">{f.status}</span>
                                                    </div>
                                                    <span className="text-xs text-on-surface-variant font-semibold">{f.notes || `Scheduled for ${f.followUpDate}`}</span>
                                                </div>
                                            ))}
                                            {(detail.siteVisits || []).filter(s => s.status === 'Pending').map(s => (
                                                <div key={`sv-${s._id}`} className="p-3 border border-outline-variant/60 rounded-xl bg-surface-bright flex flex-col gap-1 shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-bold text-primary">Site Visit</span>
                                                        <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold uppercase">{s.status}</span>
                                                    </div>
                                                    <span className="text-xs text-on-surface-variant font-semibold">{s.remarks || `Distance: ${s.distance ? s.distance.toFixed(2) : 0}km`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-on-surface font-display">Lifecycle Timeline</h3>

                            <div className="flex items-center relative overflow-x-auto pb-4 gap-2">
                                {WORKFLOW_STAGES.map((stage, idx) => (
                                    <React.Fragment key={stage}>
                                        <div className="flex flex-col items-center flex-1 min-w-[80px]">
                                            <div className="flex items-center w-full justify-center">
                                                <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 z-10 ${idx <= currentStage ? 'bg-primary shadow-sm' : 'bg-surface-container-high'
                                                    }`} />
                                            </div>
                                            <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-2.5 whitespace-nowrap ${idx === currentStage ? 'text-secondary' : (idx <= currentStage ? 'text-primary' : 'text-outline')
                                                }`}>
                                                {stage}
                                            </span>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>

                            {timelineItems.length === 0 ? (
                                <div className="text-center py-8 text-on-surface-variant italic font-semibold">
                                    No activity recorded yet.
                                </div>
                            ) : (
                                <div className="relative pl-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
                                    {timelineItems.map((item, idx) => (
                                        <div key={item.id || item._id || idx} className="relative mb-6 pl-4">
                                            <div className={`absolute -left-6.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${item.type === 'status_change' ? 'bg-emerald-500' : item.type === 'note' ? 'bg-secondary' : 'bg-blue-500'
                                                }`} />
                                            <div className="text-sm font-bold text-primary">{item.action || item.type}</div>
                                            <div className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">{item.details || item.text || item.content}</div>
                                            <div className="text-[10px] text-outline font-semibold mt-2.5">
                                                {formatDate(item.createdAt)}
                                                {item.performedBy && item.performedBy.name ? ` · ${item.performedBy.name}` : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-on-surface font-display">Remarks & Notes</h3>

                            <div className="space-y-3">
                                <textarea
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                    placeholder="Add a remark about this lead..."
                                    className="w-full p-4 border border-outline rounded-2xl text-sm font-medium text-on-surface bg-surface-bright focus:border-secondary transition-colors min-h-[100px] resize-y outline-none"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${newNote.trim()
                                        ? 'bg-primary text-white hover:bg-opacity-95 shadow-sm'
                                        : 'bg-surface-container text-outline cursor-not-allowed font-semibold'
                                        }`}
                                >
                                    Add Note
                                </button>
                            </div>

                            {noteItems.length === 0 ? (
                                <div className="text-center py-6 text-on-surface-variant italic font-semibold">
                                    No notes yet. Add the first note above.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {noteItems.map((note, idx) => (
                                        <div key={note.id || note._id || idx} className="p-5 border border-outline-variant/60 rounded-2xl bg-surface-bright shadow-sm space-y-3">
                                            <p className="m-0 text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
                                                {note.text || note.content}
                                            </p>
                                            <div className="text-[10px] text-on-surface-variant/80 font-bold">
                                                Added by {(note.addedBy?.name || 'Unknown')} · {new Date(note.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/30 flex justify-end bg-surface-container-low">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-opacity-95 shadow-md active:scale-95"
                    >
                        Close Board
                    </button>
                </div>
            </div>
        </div>
    );
};

const SkeletonRow = () => (
    <tr className="border-b border-outline-variant/30">
        {[60, 140, 100, 120, 80, 90].map((w, i) => (
            <td key={i} className="px-6 py-5">
                <div className="h-4 bg-surface-container rounded animate-pulse" style={{ width: w }} />
            </td>
        ))}
    </tr>
);

const relativeTime = (date) => {
    if (!date) return '—';
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
};

export default function EmployeeLead() {
    const { user } = useAuth();
    const { can } = useRBAC();
    const { leads, meta, loading, fetchLeads, updateLead, updateLeadStatus } = useLeads();
    const { globalSearch, setGlobalSearch } = useSearch();
    const [debouncedSearch, setDebouncedSearch] = useState(globalSearch);

    const [filters, setFilters] = useState({ status: '', propertyInterested: '' });
    const [page, setPage] = useState(1);

    const [selectedLead, setSelectedLead] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(globalSearch), 300);
        return () => clearTimeout(t);
    }, [globalSearch]);

    const loadLeads = useCallback(() => {
        const params = {
            page,
            limit: 10,
            sortBy: 'updatedAt:desc',
            ...(debouncedSearch && { search: debouncedSearch }),
            ...(filters.status && { status: filters.status }),
            ...(filters.propertyInterested && { propertyInterested: filters.propertyInterested }),
        };
        fetchLeads(params);
    }, [page, debouncedSearch, filters, fetchLeads]);

    useEffect(() => { loadLeads(); }, [loadLeads]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleViewLead = (lead) => {
        setSelectedLead(lead);
        setShowModal(true);
    };

    const handleStatusUpdate = async (leadId, status, performedBy = null) => {
        const res = updateLeadStatus ? await updateLeadStatus(leadId, status, performedBy) : await updateLead(leadId, { status });
        if (res?.success || res) {
            showToast(`Status updated to ${status}`);
            loadLeads();
            setShowModal(false);
        } else {
            showToast(res?.error || 'Update failed', 'error');
        }
    };

    const handleResetFilters = () => {
        setGlobalSearch('');
        setFilters({ status: '', propertyInterested: '' });
        setPage(1);
    };

    const totalPages = meta ? Math.ceil(meta.total / (meta.limit || 10)) : 1;
    const propertyOptions = [...new Set(leads.map(l => l.propertyInterested?.name || l.propertyInterestedText).filter(Boolean))];

    return (
        <EmployeeLayout>
            <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8 animate-fade-in bg-background min-h-screen text-on-background">
                {toast && (
                    <div className={`fixed top-24 right-8 z-[9999] px-5 py-3 rounded-2xl border shadow-lg font-bold text-xs flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                        <span className="material-symbols-outlined text-[18px]">
                            {toast.type === 'error' ? 'error' : 'check_circle'}
                        </span>
                        {toast.msg}
                    </div>
                )}

                {/* Page Header */}
                <div>
                    <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold font-display">Lead Management</h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 font-semibold">Track and nurture your high-value luxury real estate prospects.</p>
                </div>

                {/* Bento Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow group flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:bg-secondary-fixed transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">groups</span>
                            </div>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Total Leads</p>
                        <h3 className="font-display-lg text-headline-lg mt-1 font-bold font-display">{meta?.total ?? 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow group flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:bg-secondary-fixed transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">new_releases</span>
                            </div>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">New Leads</p>
                        <h3 className="font-display-lg text-headline-lg mt-1 font-bold font-display">{leads.filter(l => l.status === 'New').length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow group flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:bg-secondary-fixed transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">star</span>
                            </div>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Interested</p>
                        <h3 className="font-display-lg text-headline-lg mt-1 font-bold font-display">{leads.filter(l => l.status === 'Interested').length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-secondary-fixed/50 bg-secondary-fixed/5 shadow-sm hover:shadow-md transition-shadow group flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-secondary-fixed rounded-xl text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">verified</span>
                            </div>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Closed Leads</p>
                        <h3 className="font-display-lg text-headline-lg mt-1 text-secondary font-bold font-display">{leads.filter(l => ['Sold', 'Closed', 'Converted', 'Booked'].includes(l.status)).length}</h3>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[240px]">
                            <label className="text-[10px] font-extrabold text-on-surface-variant mb-2 block uppercase tracking-widest">Search Name or ID</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                                <input
                                    type="text"
                                    placeholder="Search lead info..."
                                    value={globalSearch}
                                    onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 border border-outline rounded-xl bg-surface-bright focus:border-secondary transition-all text-sm font-semibold"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="w-48">
                            <label className="text-[10px] font-extrabold text-on-surface-variant mb-2 block uppercase tracking-widest">Status</label>
                            <select
                                value={filters.status}
                                onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
                                className={selectClass}
                            >
                                <option value="">All Statuses</option>
                                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Property Interest */}
                        <div className="w-64">
                            <label className="text-[10px] font-extrabold text-on-surface-variant mb-2 block uppercase tracking-widest">Property Interest</label>
                            <select
                                value={filters.propertyInterested}
                                onChange={e => { setFilters(f => ({ ...f, propertyInterested: e.target.value })); setPage(1); }}
                                className={selectClass}
                            >
                                <option value="">All Properties</option>
                                {propertyOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Reset */}
                        <div className="pt-5">
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-3 bg-white border border-outline rounded-xl text-primary font-bold text-xs uppercase tracking-wider hover:bg-surface-container active:scale-95 transition-all w-full sm:w-auto h-[46px]"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-outline-variant bg-surface-container-lowest">
                                    {['ID', 'Customer Name', 'Phone', 'Property Interest', 'Status', 'Last Updated'].map(col => (
                                        <th key={col} className="px-6 py-4 font-bold text-[10px] text-on-surface-variant/80 tracking-widest uppercase">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant italic font-semibold">
                                            <span className="material-symbols-outlined text-[32px] text-outline block mx-auto mb-2">search_off</span>
                                            No leads match your search.
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => (
                                        <tr
                                            key={lead._id}
                                            onClick={() => handleViewLead(lead)}
                                            className="border-b border-outline-variant/10 hover:bg-surface transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-5 font-bold font-mono text-xs text-on-surface-variant">
                                                #LD-{lead._id?.slice(-4) || '0000'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <InitialsBadge name={lead.name || lead.customerName} size={32} dark />
                                                    <span className="font-bold text-sm text-primary">{lead.name || lead.customerName || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-on-surface-variant font-semibold">
                                                {lead.phone || lead.mobile || 'N/A'}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-on-surface font-semibold max-w-[200px] truncate">
                                                {lead.property || lead.propertyInterested?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={lead.status} size="sm" />
                                            </td>
                                            <td className="px-6 py-5 text-xs text-outline italic font-medium">
                                                {relativeTime(lead.updatedAt || lead.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        total={meta?.total ?? 0}
                        limit={meta?.limit ?? 10}
                        onPageChange={setPage}
                    />
                </div>
            </div>

            {showModal && selectedLead && (
                <EmployeeLeadModal
                    lead={selectedLead}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedLead(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </EmployeeLayout>
    );
}

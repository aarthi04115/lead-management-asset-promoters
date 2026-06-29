import React, { useState } from 'react';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { useAuth } from '../../context/AuthContext';
import { useRBAC } from '../../utils/rbac';
import { useFollowUp } from '../../context/FollowUpContext';
import { useSearch } from '../../context/SearchContext';
import FollowUpFormModal from '../../components/shared/FollowUpFormModal';

export default function EmployeeFollowUp() {
    const { user } = useAuth();
    const { can } = useRBAC();
    const { globalSearch, setGlobalSearch } = useSearch();
    const {
        followUps,
        stats,
        upcoming,
        openAddModal,
        openEditModal,
        modalOpen,
        closeModal,
        saveFollowUp,
        selectedFollowUp,
        saving,
        handleMarkCompleted,
        pagination,
        goToPage
    } = useFollowUp();

    const [viewingFollowUp, setViewingFollowUp] = useState(null);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getStatusColor = (status, isOverdueItem) => {
        if (isOverdueItem || status === 'Overdue') return 'bg-error text-white';
        if (status === 'Completed') return 'bg-green-100 text-green-800';
        return 'bg-secondary-container/20 text-secondary';
    };

    const getPriorityColor = (priority) => {
        if (priority === 'Urgent') return 'bg-error';
        return 'bg-secondary';
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const renderPageNumbers = () => {
        if (!pagination || !pagination.totalPages) return null;
        const pages = [];
        const totalPages = pagination.totalPages;
        const current = pagination.currentPage;

        let startPage = Math.max(1, current - 2);
        let endPage = Math.min(totalPages, current + 2);

        if (current <= 3) {
            endPage = Math.min(totalPages, 5);
        }
        if (current >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg border transition-colors ${current === i
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface hover:text-primary'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <>
                {startPage > 1 && (
                    <>
                        <button onClick={() => goToPage(1)} className="w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface hover:text-primary transition-colors">1</button>
                        {startPage > 2 && <span className="flex items-center text-on-surface-variant px-1 font-bold">...</span>}
                    </>
                )}
                {pages}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="flex items-center text-on-surface-variant px-1 font-bold">...</span>}
                        <button onClick={() => goToPage(totalPages)} className="w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface hover:text-primary transition-colors">{totalPages}</button>
                    </>
                )}
            </>
        );
    };

    return (
        <EmployeeLayout>
            <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8 animate-fade-in bg-background min-h-screen text-on-background">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold font-display">Follow-Up Management</h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 font-medium">Manage client relationships and conversion velocity.</p>
                    </div>
                    {can('create_followup') ? (
                        <button onClick={openAddModal} className="bg-primary-container hover:bg-opacity-95 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-md text-sm uppercase tracking-wider font-semibold">
                            <span className="material-symbols-outlined text-xl">add</span>
                            Schedule New Task
                        </button>
                    ) : (
                        <button disabled className="bg-surface-container text-on-surface-variant px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm cursor-not-allowed opacity-60 text-sm font-semibold" title="Access Restricted">
                            <span className="material-symbols-outlined text-xl">lock</span>
                            Schedule New Task
                        </button>
                    )}
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:bg-secondary-fixed transition-colors">
                                <span className="material-symbols-outlined text-[24px]">today</span>
                            </div>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Today's Tasks</p>
                        <h3 className="font-display-lg text-headline-lg mt-1 font-bold font-display">{stats.todaysFollowUps || 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:bg-secondary-fixed transition-colors">
                                <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                            </div>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Upcoming</p>
                        <h3 className="font-display-lg text-headline-lg mt-1 font-bold font-display">{stats.upcomingReminders || 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-surface-container rounded-xl text-primary group-hover:bg-secondary-fixed transition-colors">
                                <span className="material-symbols-outlined text-[24px]">task_alt</span>
                            </div>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Completed</p>
                        <h3 className="font-display-lg text-headline-lg mt-1 font-bold font-display">{stats.completed || 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-secondary-fixed/50 bg-secondary-fixed/5 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-secondary-fixed rounded-xl text-primary">
                                <span className="material-symbols-outlined text-[24px]">priority_high</span>
                            </div>
                            {stats.overdue > 0 && <span className="text-secondary font-semibold text-xs tracking-wider uppercase">Action Needed</span>}
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Overdue</p>
                        <h3 className="font-display-lg text-headline-lg mt-1 text-secondary font-bold font-display">{stats.overdue || 0}</h3>
                    </div>
                </div>

                {/* BENTO CONTENT AREA */}
                <div className="grid grid-cols-12 gap-6">

                    {/* URGENT REMINDERS COLUMN */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold flex items-center gap-2 font-display text-primary">
                                <span className="material-symbols-outlined text-secondary text-[24px]">notification_add</span>
                                Urgent Reminders
                            </h4>
                            <span className="text-xs font-bold text-secondary bg-secondary-fixed/50 px-3 py-1 rounded-full uppercase tracking-wider">Priority List</span>
                        </div>

                        <div className="space-y-4">
                            {upcoming.length === 0 ? (
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/60 text-center text-on-surface-variant italic font-medium">
                                    No upcoming reminders.
                                </div>
                            ) : (
                                upcoming.slice(0, 3).map(reminder => (
                                    <div key={reminder._id} className={`bg-white border-l-4 ${reminder.priority === 'Urgent' ? 'border-error' : 'border-secondary'} p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group`} onClick={() => setViewingFollowUp(reminder)}>
                                        <div className="flex justify-between items-start">
                                            <span className={`${reminder.priority === 'Urgent' ? 'bg-error/10 text-error border border-error/10' : 'bg-secondary/10 text-secondary border border-secondary/10'} px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider`}>
                                                {reminder.priority === 'Urgent' ? 'High Priority' : 'Medium'}
                                            </span>
                                            <span className="text-on-surface-variant text-xs font-semibold">{formatTime(reminder.followUpTime)}</span>
                                        </div>
                                        <h5 className="font-bold text-primary mt-2 flex items-center gap-1.5">{reminder.customerName}</h5>
                                        <p className="text-sm text-on-surface-variant mt-1 text-ellipsis overflow-hidden whitespace-nowrap">{reminder.notes || `Discuss ${reminder.propertyName}`}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                <div className="w-6.5 h-6.5 rounded-full border-2 border-white bg-primary-container text-white flex items-center justify-center text-[10px] font-bold shadow-sm uppercase">{getInitials(reminder.customerName)}</div>
                                            </div>
                                            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">arrow_forward</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* milestone tracking progress */}
                        <div className="bg-primary-container p-6 rounded-2xl text-white relative overflow-hidden shadow-sm">
                            <div className="relative z-10 space-y-4">
                                <h5 className="text-lg font-bold font-display">Performance Milestone</h5>
                                <p className="text-on-primary-container/85 text-sm leading-relaxed">You've reached {(stats.completed / ((stats.completed + stats.pending) || 1) * 100).toFixed(0)}% follow-up completion. Keep the velocity up!</p>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-secondary-fixed h-full transition-all duration-500" style={{ width: `${(stats.completed / ((stats.completed + stats.pending) || 1) * 100)}%` }}></div>
                                </div>
                            </div>
                            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-secondary-fixed/5 rounded-full blur-2xl"></div>
                        </div>
                    </div>

                    {/* FOLLOW-UP TABLE COLUMN */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest">
                                <h4 className="text-lg font-bold font-display text-primary">Follow-Up Registry</h4>
                                <div className="flex gap-4 items-center w-full sm:w-auto">
                                    <div className="relative flex-grow">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                                        <input
                                            type="text"
                                            placeholder="Search follow-ups..."
                                            value={globalSearch}
                                            onChange={(e) => { setGlobalSearch(e.target.value); goToPage(1); }}
                                            className="pl-10 pr-4 py-2 border border-outline rounded-xl bg-surface-bright focus:border-secondary transition-all w-full sm:w-64 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto flex-grow">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-container-low border-b border-outline-variant">
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Customer</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Date & Time</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Priority</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        {followUps.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant italic font-medium">No follow-ups found.</td>
                                            </tr>
                                        ) : (
                                            followUps.map(fu => {
                                                const isOverdue = fu.status === 'Pending' && new Date(`${fu.followUpDate}T${fu.followUpTime}`) < new Date();
                                                return (
                                                    <tr key={fu._id} className={`${isOverdue ? 'bg-error/5 hover:bg-error/10' : 'hover:bg-surface'} transition-colors group cursor-pointer`} onClick={() => setViewingFollowUp(fu)}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg ${isOverdue ? 'bg-error text-white font-bold' : 'bg-primary-container text-white'} flex items-center justify-center font-bold text-xs shadow-sm`}>
                                                                    {getInitials(fu.customerName)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold text-primary truncate">{fu.customerName}</p>
                                                                    <p className="text-[11px] text-on-surface-variant truncate max-w-[150px] font-medium">{fu.propertyName}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className={`text-sm font-bold ${isOverdue ? 'text-error' : 'text-primary'}`}>{fu.followUpDate}</p>
                                                            <p className="text-xs text-on-surface-variant font-semibold">{formatTime(fu.followUpTime)}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${getPriorityColor(fu.priority)} mr-2 shadow-sm`}></span>
                                                            <span className="text-xs font-bold uppercase tracking-tighter">{fu.priority}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full ${getStatusColor(fu.status, isOverdue)} text-[10px] font-bold uppercase tracking-wide border border-black/5`}>
                                                                {isOverdue ? 'Overdue' : fu.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {can('update_own_followup_status') || can('reschedule_own_followup') ? (
                                                                <button
                                                                    className="material-symbols-outlined text-outline hover:text-primary hover:bg-surface-container rounded-full p-2 transition-colors"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openEditModal(fu);
                                                                    }}
                                                                >
                                                                    edit
                                                                </button>
                                                            ) : (
                                                                <button disabled className="material-symbols-outlined text-outline-variant/40 cursor-not-allowed rounded-full p-2" title="Access Restricted">
                                                                    lock
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-surface-container-low/30 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-on-surface-variant font-semibold">
                                    Showing Page <span className="font-extrabold text-primary">{pagination?.currentPage || 1}</span> of <span className="font-bold">{pagination?.totalPages || 1}</span>
                                    <span className="hidden sm:inline"> ({pagination?.totalRecords || 0} records)</span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={!pagination || pagination.currentPage <= 1}
                                        onClick={() => goToPage(pagination.currentPage - 1)}
                                        className="px-4 py-2 text-sm font-bold border border-outline-variant/30 rounded-lg text-primary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                        Prev
                                    </button>

                                    <div className="flex gap-1">
                                        {renderPageNumbers()}
                                    </div>

                                    <button
                                        disabled={!pagination || pagination.currentPage >= pagination.totalPages}
                                        onClick={() => goToPage(pagination.currentPage + 1)}
                                        className="px-4 py-2 text-sm font-bold border border-outline-variant/30 rounded-lg text-primary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1"
                                    >
                                        Next
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOLLOW-UP DETAILS MODAL (VIEW MODE) */}
            {viewingFollowUp && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setViewingFollowUp(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                        <div className="p-8 border-b border-outline-variant/20 flex justify-between items-start">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-xl bg-primary-container text-white flex items-center justify-center font-display-lg text-2xl font-bold">
                                    {getInitials(viewingFollowUp.customerName)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-primary font-display">{viewingFollowUp.customerName}</h3>
                                    <p className="text-on-surface-variant font-semibold text-sm">Property: {viewingFollowUp.propertyName}</p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-surface rounded-full transition-colors" onClick={() => setViewingFollowUp(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="px-8 border-b border-outline-variant/10 bg-surface/50">
                            <div className="flex gap-8">
                                <button className="py-4 border-b-2 border-secondary text-secondary text-sm font-bold">Overview</button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant/80 mb-1">Scheduled Time</label>
                                        <p className="text-sm font-bold text-primary">{viewingFollowUp.followUpDate} at {formatTime(viewingFollowUp.followUpTime)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant/80 mb-1">Priority Level</label>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 ${getPriorityColor(viewingFollowUp.priority)} rounded-full shadow-sm`}></span>
                                            <p className={`text-sm font-bold ${viewingFollowUp.priority === 'Urgent' ? 'text-error' : 'text-primary'}`}>{viewingFollowUp.priority}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant/80 mb-1">Contact Info</label>
                                        <p className="text-sm font-bold text-primary">{viewingFollowUp.phoneNumber}</p>
                                        {viewingFollowUp.whatsappNumber && <p className="text-xs text-on-surface-variant font-medium mt-0.5">WhatsApp: {viewingFollowUp.whatsappNumber}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant/80 mb-1">Outcome Stage</label>
                                        <p className="text-sm font-bold text-primary">{viewingFollowUp.outcome}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant/80 mb-2">Discussion Notes</label>
                                <div className="bg-surface-container-low p-4 rounded-xl text-sm italic text-on-surface-variant border border-outline-variant/10 font-medium">
                                    {viewingFollowUp.notes || "No additional notes provided."}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-outline-variant/20 bg-surface/30 flex justify-end gap-4">
                            {can('update_own_followup_status') || can('reschedule_own_followup') ? (
                                <button onClick={() => { setViewingFollowUp(null); openEditModal(viewingFollowUp); }} className="px-6 py-3 border border-outline-variant text-primary font-bold rounded-xl hover:bg-surface transition-colors font-semibold">Edit Details</button>
                            ) : (
                                <button disabled className="px-6 py-3 border border-outline-variant text-on-surface-variant font-bold rounded-xl flex items-center gap-2 cursor-not-allowed opacity-50 font-semibold" title="Access Restricted">
                                    <span className="material-symbols-outlined text-[18px]">lock</span>
                                    Edit Details
                                </button>
                            )}
                            {viewingFollowUp.status !== 'Completed' && can('complete_own_followup') && (
                                <button onClick={() => { handleMarkCompleted(viewingFollowUp); setViewingFollowUp(null); }} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 font-semibold">Mark Complete</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* RENDER FORM MODAL FOR CREATE/EDIT */}
            <FollowUpFormModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSave={saveFollowUp}
                followUp={selectedFollowUp}
                saving={saving}
            />
        </EmployeeLayout>
    );
}

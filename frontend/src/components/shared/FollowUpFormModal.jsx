import React, { useState, useEffect } from 'react';

const EMPTY_FORM = {
    leadId: '',
    assignedTo: '',
    customerName: '',
    phoneNumber: '',
    whatsappNumber: '',
    propertyName: '',
    followUpDate: new Date().toISOString().slice(0, 10),
    followUpTime: '10:00',
    priority: 'Normal',
    status: 'Pending',
    outcome: 'Callback',
    notes: '',
};

export default function FollowUpFormModal({ isOpen, onClose, onSave, followUp, saving }) {
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        if (followUp) {
            setFormData({
                leadId: followUp.leadId || '',
                assignedTo: followUp.assignedTo || '',
                customerName: followUp.customerName || '',
                phoneNumber: followUp.phoneNumber || '',
                whatsappNumber: followUp.whatsappNumber || '',
                propertyName: followUp.propertyName || '',
                followUpDate: (followUp.followUpDate || '').slice(0, 10),
                followUpTime: followUp.followUpTime || '10:00',
                priority: followUp.priority || 'Normal',
                status: followUp.status || 'Pending',
                outcome: followUp.outcome || 'Callback',
                notes: followUp.notes || '',
            });
        } else {
            setFormData(EMPTY_FORM);
        }
    }, [followUp, isOpen]);

    if (!isOpen) return null;

    const isEdit = Boolean(followUp && followUp._id);
    const today = new Date().toISOString().slice(0, 10);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-primary-container/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-modal w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl relative flex flex-col bg-white">
                {/* Modal Header */}
                <div className="p-8 border-b border-outline-variant flex justify-between items-start">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary-container text-white flex items-center justify-center font-headline-md text-headline-md">
                            <span className="material-symbols-outlined text-[32px]">{isEdit ? 'edit_square' : 'event_note'}</span>
                        </div>
                        <div>
                            <h3 className="font-headline-md text-headline-md text-primary font-bold">{isEdit ? 'Edit Follow-Up' : 'Schedule New Follow-Up'}</h3>
                            <p className="font-body-md text-on-surface-variant mt-1">
                                {isEdit ? 'Update the details for this scheduled follow-up.' : 'Enter details to track a new client interaction.'}
                            </p>
                        </div>
                    </div>
                    <button type="button" className="p-2 hover:bg-surface-container rounded-full transition-colors" onClick={onClose}>
                        <span className="material-symbols-outlined text-primary">close</span>
                    </button>
                </div>

                {/* Modal Content Scrollable */}
                <div className="flex-grow overflow-y-auto bg-surface-bright/50">
                    <form id="followup-form" onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="space-y-6">
                            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant pb-2 font-bold">Client Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Customer Name *</label>
                                    <input name="customerName" value={formData.customerName} onChange={handleChange} required type="text" className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md" placeholder="Enter full name" />
                                </div>
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Property Interest *</label>
                                    <input name="propertyName" value={formData.propertyName} onChange={handleChange} required type="text" className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md" placeholder="e.g. Skyline Penthouse" />
                                </div>
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Phone Number *</label>
                                    <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required type="tel" className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md" placeholder="+1 234-567-8900" />
                                </div>
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">WhatsApp Number</label>
                                    <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} type="tel" className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md" placeholder="+1 234-567-8900" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant pb-2 font-bold">Schedule & Status</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Follow-Up Date *</label>
                                    <input name="followUpDate" value={formData.followUpDate} onChange={handleChange} min={today} required type="date" className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md" />
                                </div>
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Follow-Up Time *</label>
                                    <input name="followUpTime" value={formData.followUpTime} onChange={handleChange} required type="time" className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md" />
                                </div>
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md">
                                        <option value="Normal">Normal</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md">
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Outcome / Stage</label>
                                    <select name="outcome" value={formData.outcome} onChange={handleChange} className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md">
                                        <option value="Callback">Callback</option>
                                        <option value="Interested">Interested</option>
                                        <option value="No Response">No Response</option>
                                        <option value="Not Interested">Not Interested</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant mb-2 block uppercase tracking-tight font-semibold">Notes</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:border-secondary transition-all text-body-md resize-none" placeholder="Add discussion points, requirements, or internal notes..."></textarea>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-outline-variant bg-white flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors font-semibold">Cancel</button>
                    <button type="submit" form="followup-form" disabled={saving} className="px-8 py-2 bg-primary-container text-white rounded-lg font-label-md text-label-md hover:bg-primary transition-all flex items-center gap-2 font-semibold">
                        {saving ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

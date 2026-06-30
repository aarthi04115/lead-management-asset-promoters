import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const LEAD_STATUSES = [
  'New', 'Attempted Call', 'Connected', 'Interested', 'Follow-Up',
  'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Booked', 'Sold', 'Lost'
];

const LEAD_SOURCES = [
  '99acres', 'MagicBricks', 'Housing.com', 'NoBroker', 'Walk-in', 'Referral',
  'Social Media', 'WhatsApp', 'Google Ads', 'Facebook Ads', 'Instagram Ads',
  'Cold Call', 'Website', 'Zillow', 'Newspaper Ad', 'Hoarding / Banner', 'IVR', 'Other'
];

const inputStyle = {
  padding: '10px 13px',
  border: '1.5px solid #E2E8F0',
  borderRadius: 8,
  fontSize: 14,
  color: '#1E293B',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  width: '100%',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.15s',
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

const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.3px' }}>
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'block' }}>{error}</span>}
  </div>
);

const AdminLeadForm = ({ lead, employees, onClose, onSubmit }) => {
  const isEdit = !!lead;

  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    email: '',
    propertyInterested: '',
    source: 'Social Media',
    campaign: '',
    assignedEmployee: '',
    status: 'New',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (lead) {
      setForm({
        customerName: lead.customerName || '',
        mobile: lead.mobile || '',
        email: lead.email || '',
        propertyInterested: lead.propertyInterested?.name || lead.propertyInterested || lead.propertyInterestedText || lead.property || '',
        source: lead.source || 'Social Media',
        campaign: lead.campaign || '',
        assignedEmployee: lead.assignedEmployee?._id || lead.assignedEmployee || '',
        status: lead.status || 'New',
        remarks: lead.remarks || lead.notes || '',
      });
    }
  }, [lead]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Name is required';
    if (!form.mobile.trim()) e.mobile = 'Phone number is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await onSubmit({
      customerName: form.customerName,
      mobile: form.mobile,
      email: form.email,
      propertyInterested: form.propertyInterested,
      source: form.source,
      campaign: form.campaign,
      assignedEmployee: form.assignedEmployee,
      status: form.status,
      remarks: form.remarks,
    });
    setSubmitting(false);
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
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
          maxWidth: 560,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Form Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit, sans-serif' }}>
            {isEdit ? 'Edit Lead Details' : 'Add New Lead'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px 28px', flex: 1 }}>
          {/* Row: Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Customer Name *" error={errors.customerName}>
              <input
                type="text"
                value={form.customerName}
                onChange={e => set('customerName', e.target.value)}
                placeholder="Full name"
                style={{ ...inputStyle, borderColor: errors.customerName ? '#EF4444' : '#E2E8F0' }}
              />
            </Field>
            <Field label="Phone Number *" error={errors.mobile}>
              <input
                type="tel"
                value={form.mobile}
                onChange={e => set('mobile', e.target.value)}
                placeholder="+1 (555) 000-0000"
                style={{ ...inputStyle, borderColor: errors.mobile ? '#EF4444' : '#E2E8F0' }}
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email Address" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@example.com"
              style={{ ...inputStyle, borderColor: errors.email ? '#EF4444' : '#E2E8F0' }}
            />
          </Field>

          {/* Property Interest */}
          <Field label="Property Interest">
            <input
              type="text"
              value={form.propertyInterested}
              onChange={e => set('propertyInterested', e.target.value)}
              placeholder="e.g. Skyline Penthouse 4B"
              style={inputStyle}
            />
          </Field>

          {/* Source + Campaign */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Lead Source">
              <select value={form.source} onChange={e => set('source', e.target.value)} style={selectStyle}>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Campaign">
              <input
                type="text"
                value={form.campaign}
                onChange={e => set('campaign', e.target.value)}
                placeholder="e.g. Summer Launch 2024"
                style={inputStyle}
              />
            </Field>
          </div>

          {/* Status + Assign */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)} style={selectStyle}>
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Assign To">
              <select value={form.assignedEmployee} onChange={e => set('assignedEmployee', e.target.value)} style={selectStyle}>
                <option value="">Unassigned</option>
                {employees?.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes / Remarks">
            <textarea
              value={form.remarks}
              onChange={e => set('remarks', e.target.value)}
              placeholder="Add any notes about this lead..."
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            />
          </Field>
        </form>

        {/* Form Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '9px 24px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: submitting ? '#E2E8F0' : '#0F172A',
              color: submitting ? '#94A3B8' : '#FFFFFF',
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Lead'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdminLeadForm;

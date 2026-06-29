import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

const LeadContext = createContext();

export const LeadProvider = ({ children }) => {
    const [leads, setLeads] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
    const [loading, setLoading] = useState(false);

    const normalizeLead = (raw, empsMap = {}) => ({
        ...raw,
        _id: raw._id || raw.id,
        customerName: raw.customerName || raw.name || raw.customer || raw.customerName,
        mobile: raw.mobile || raw.phone || raw.contact || '',
        email: raw.email || raw.emailAddress || '',
        propertyInterestedText: raw.property || raw.propertyInterestedText || '',
        assignedEmployee: raw.assignedTo
            ? (typeof raw.assignedTo === 'object' ? raw.assignedTo : empsMap[raw.assignedTo])
            : null,
    });

    const fetchLeads = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (params.page) query.set('page', params.page);
            if (params.limit) query.set('limit', params.limit);
            if (params.search) query.set('search', params.search);
            if (params.status) query.set('status', params.status);
            if (params.source) query.set('source', params.source);
            if (params.propertyInterested) query.set('propertyInterested', params.propertyInterested);
            if (params.assignedEmployee) query.set('assignedEmployee', params.assignedEmployee);
            const path = '/leads' + (query.toString() ? `?${query.toString()}` : '');
            console.log('LeadContext.fetchLeads ->', path);
            const axiosRes = await api.get(path);
            const res = axiosRes.data;
            if (res && res.success) {
                // Build employees map for lead enrichment
                const empsMap = {};
                employees.forEach(emp => {
                    empsMap[emp._id] = emp;
                });
                const data = (res.data || []).map(raw => normalizeLead(raw, empsMap));
                setLeads(data);
                setMeta(res.meta || { total: data.length, page: params.page || 1, limit: params.limit || 10 });
            } else {
                setLeads([]);
            }
        } catch (error) {
            console.error('fetchLeads error', error);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, [employees]);

    const fetchEmployees = useCallback(async () => {
        try {
            const axiosRes = await api.get('/auth/admin/users');
            const res = axiosRes.data;
            if (res && res.success) {
                // include all users except admins as assignment candidates
                const emps = (res.data || []).filter(u => u.role !== 'admin').map(u => ({ ...u, _id: u.id || u._id }));
                setEmployees(emps);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('fetchEmployees error', error);
            setEmployees([]);
        }
    }, []);

    const mapToBackend = (payload) => {
        const data = { ...payload };
        if ('customerName' in data) { data.name = data.customerName; delete data.customerName; }
        if ('mobile' in data) { data.phone = data.mobile; delete data.mobile; }
        if ('propertyInterested' in data) { data.property = data.propertyInterested; delete data.propertyInterested; }
        if ('assignedEmployee' in data) {
            data.assignedTo = data.assignedEmployee || null;
            if (!data.assignedTo) delete data.assignedTo;
            delete data.assignedEmployee;
        }
        if ('remarks' in data) { data.notes = data.remarks; delete data.remarks; }
        return data;
    };

    const createLead = async (payload) => {
        try {
            const backendPayload = mapToBackend(payload);
            const axiosRes = await api.post('/leads', backendPayload);
            const res = axiosRes.data;
            if (res && res.success) {
                const lead = normalizeLead(res.data);
                setLeads(l => [lead, ...l]);
                return { success: true, data: lead };
            }
            return { success: false, error: res.error || res.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateLead = async (id, payload) => {
        try {
            const backendPayload = mapToBackend(payload);
            const axiosRes = await api.put(`/leads/${id}`, backendPayload);
            const res = axiosRes.data;
            if (res && res.success) {
                const updated = normalizeLead(res.data);
                setLeads(l => l.map(ld => (ld._id === id ? updated : ld)));
                return { success: true, data: updated };
            }
            return { success: false, error: res.error || res.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteLead = async (id) => {
        try {
            const axiosRes = await api.delete(`/leads/${id}`);
            const res = axiosRes.data;
            if (res && res.success) {
                setLeads(l => l.filter(ld => ld._id !== id && ld.id !== id));
                return { success: true };
            }
            return { success: false, error: res.error || res.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const addLeadNote = async (id, text) => {
        try {
            const axiosRes = await api.post(`/leads/${id}/notes`, { text });
            const res = axiosRes.data;
            if (res && res.success) {
                const updated = normalizeLead(res.data);
                setLeads(l => l.map(ld => (ld._id === id ? updated : ld)));
                return { success: true, data: updated };
            }
            return { success: false, error: res.error || res.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <LeadContext.Provider value={{ leads, employees, meta, loading, fetchLeads, fetchEmployees, createLead, updateLead, deleteLead, addLeadNote }}>
            {children}
        </LeadContext.Provider>
    );
};

export const useLeads = () => {
    const context = useContext(LeadContext);
    if (!context) throw new Error('useLeads must be used within LeadProvider');
    return context;
};

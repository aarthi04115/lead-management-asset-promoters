import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useSearch } from './SearchContext';

const SiteVisitContext = createContext(null);

export function SiteVisitProvider({ children }) {
    const [visits, setVisits] = useState([]);
    const [stats, setStats] = useState({ todaysVisits: 0, pending: 0, completed: 0, avgTime: '0m' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const { globalSearch, setGlobalSearch } = useSearch();
    const [debouncedSearch, setDebouncedSearch] = useState(globalSearch);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10
    });

    const [pagination, setPagination] = useState({
        next: null,
        prev: null,
        total: 0
    });

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(globalSearch), 300);
        return () => clearTimeout(t);
    }, [globalSearch]);

    const loadData = useCallback(async () => {
        if (!localStorage.getItem("token")) return;
        setLoading(true);
        setError(null);
        try {
            const activeFilters = { ...filters };
            if (debouncedSearch) {
                activeFilters.search = debouncedSearch;
            }
            const response = await api.get('/sitevisits', { params: activeFilters });
            const data = response.data.data || [];
            setVisits(data);
            if (response.data.pagination) {
                setPagination({
                    next: response.data.pagination.next,
                    prev: response.data.pagination.prev,
                    total: response.data.total || 0
                });
            } else {
                setPagination({
                    next: null,
                    prev: null,
                    total: response.data.total || data.length
                });
            }

            // Calculate stats locally based on fetched data
            const today = new Date().toISOString().split('T')[0];
            let todaysCount = 0;
            let pendingCount = 0;
            let completedCount = 0;

            data.forEach(v => {
                if (v.status === 'Pending') pendingCount++;
                if (v.status === 'Approved') completedCount++;
                if (v.visitTime && v.visitTime.startsWith(today)) todaysCount++;
            });

            setStats({
                todaysVisits: todaysCount,
                pending: pendingCount,
                completed: completedCount,
                avgTime: '12m' // mock as requested preserving UI
            });

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load site visits');
        } finally {
            setLoading(false);
        }
    }, [filters, debouncedSearch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const goToPage = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleCreate = async (payload) => {
        setSaving(true);
        try {
            // payload is FormData since we upload image
            await api.post('/sitevisits', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create site visit');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id, payload) => {
        setSaving(true);
        try {
            await api.put(`/sitevisits/${id}`, payload);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update site visit');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleApprove = async (id) => {
        setSaving(true);
        try {
            await api.put(`/sitevisits/${id}/approve`);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to approve site visit');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleReject = async (id) => {
        setSaving(true);
        try {
            await api.put(`/sitevisits/${id}/reject`);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to reject site visit');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return (
        <SiteVisitContext.Provider value={{
            visits,
            stats,
            loading,
            saving,
            error,
            pagination,
            goToPage,
            refreshData: loadData,
            createVisit: handleCreate,
            updateVisit: handleUpdate,
            approveVisit: handleApprove,
            rejectVisit: handleReject,
            globalSearch,
            setGlobalSearch
        }}>
            {children}
        </SiteVisitContext.Provider>
    );
}

export function useSiteVisit() {
    const ctx = useContext(SiteVisitContext);
    if (!ctx) throw new Error('useSiteVisit must be used inside SiteVisitProvider');
    return ctx;
}

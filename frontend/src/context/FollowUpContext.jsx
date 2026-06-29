import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';
import FollowUpFormModal from '../components/shared/FollowUpFormModal';
import { useSearch } from './SearchContext';

const FollowUpContext = createContext(null);

export function FollowUpProvider({ children }) {
    const [followUps, setFollowUps] = useState([]);
    const [stats, setStats] = useState({ todaysFollowUps: 0, pending: 0, completed: 0, overdue: 0, upcomingReminders: 0 });
    const [reminders, setReminders] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [nextFollowUp, setNextFollowUp] = useState(null);
    const [selectedFollowUp, setSelectedFollowUp] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const { globalSearch: searchQuery, setGlobalSearch: setSearchQuery } = useSearch();
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    const [filters, setFilters] = useState({
        status: 'All',
        priority: 'All',
        timeFilter: 'All',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        recordsPerPage: 10
    });
    const [highlightedId, setHighlightedId] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const loadData = useCallback(async () => {
        if (!localStorage.getItem("token")) return;
        setLoading(true);
        setError(null);

        try {
            const [statsRes, remindersRes, upcomingRes, nextRes] = await Promise.all([
                api.get('/followups/kpis'),
                api.get('/followups/reminders'),
                api.get('/followups/upcoming'),
                api.get('/followups/next'),
            ]);
            setStats(statsRes.data.data);
            setReminders(remindersRes.data.data);
            setUpcoming(upcomingRes.data.data);
            setNextFollowUp(nextRes.data.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto-refresh data every 60 seconds to update overdue status
    useEffect(() => {
        const interval = setInterval(() => {
            loadData();
        }, 60000); // Refresh every 60 seconds

        return () => clearInterval(interval);
    }, [loadData]);

    const openAddModal = () => {
        setSelectedFollowUp(null);
        setModalOpen(true);
    };

    const openEditModal = (followUp) => {
        setSelectedFollowUp(followUp);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedFollowUp(null);
    };

    const saveFollowUp = async (formData) => {
        setSaving(true);
        setError(null);

        try {
            if (selectedFollowUp && selectedFollowUp._id) {
                await api.put(`/followups/${selectedFollowUp._id}`, formData);
            } else {
                await api.post('/followups', formData);
            }
            await applyFilters();
            await loadData();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save follow-up');
        } finally {
            setSaving(false);
        }
    };

    const handleMarkCompleted = async (followUp, outcome) => {
        setError(null);
        try {
            await api.patch(`/followups/${followUp._id}/complete`, { outcome: outcome || 'Callback' });
            await applyFilters();
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to mark as completed');
        }
    };

    const handleDelete = async (followUp) => {
        if (!window.confirm(`Delete follow-up for ${followUp.customerName}?`)) return;
        setError(null);
        try {
            await api.delete(`/followups/${followUp._id}`);
            await applyFilters();
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to delete follow-up');
        }
    };

    const applyFilters = useCallback(async () => {
        if (!localStorage.getItem("token")) return;
        setLoading(true);
        setError(null);
        try {
            const activeFilters = { ...filters };
            if (debouncedSearch) {
                activeFilters.search = debouncedSearch;
            }
            const res = await api.get('/followups/filter', { params: activeFilters });
            const response = res.data;
            setFollowUps(response.data);
            setPagination({
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                totalRecords: response.totalRecords,
                recordsPerPage: response.recordsPerPage
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to apply filters');
        } finally {
            setLoading(false);
        }
    }, [filters, debouncedSearch]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
    };

    const goToPage = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    useEffect(() => {
        applyFilters();
    }, [filters, applyFilters]);

    return (
        <FollowUpContext.Provider value={{
            followUps,
            stats,
            reminders,
            upcoming,
            nextFollowUp,
            selectedFollowUp,
            modalOpen,
            loading,
            saving,
            error,
            searchQuery,
            setSearchQuery,
            filters,
            updateFilter,
            pagination,
            goToPage,
            openAddModal,
            openEditModal,
            closeModal,
            saveFollowUp,
            handleMarkCompleted,
            handleDelete,
            refreshData: loadData,
            highlightedId,
            setHighlightedId,
        }}>
            {children}
            <FollowUpFormModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSave={saveFollowUp}
                followUp={selectedFollowUp}
                saving={saving}
            />
        </FollowUpContext.Provider>
    );
}

export function useFollowUp() {
    const ctx = useContext(FollowUpContext);
    if (!ctx) throw new Error('useFollowUp must be used inside FollowUpProvider');
    return ctx;
}

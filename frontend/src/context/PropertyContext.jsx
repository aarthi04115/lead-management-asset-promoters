import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useSearch } from './SearchContext';

const PropertyContext = createContext(null);

export function PropertyProvider({ children }) {
    const [properties, setProperties] = useState([]);
    const [featuredProperty, setFeaturedProperty] = useState(null);
    const [stats, setStats] = useState({ total: 0, available: 0, booked: 0, negotiation: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { globalSearch: searchQuery, setGlobalSearch: setSearchQuery } = useSearch();
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    const [filters, setFilters] = useState({
        status: 'All',
        category: 'All',
        location: 'All Locations'
    });

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const loadData = useCallback(async () => {
        if (!localStorage.getItem("token")) return;
        setLoading(true);
        setError(null);

        try {
            // Build API query from filters + search
            const query = { ...filters };
            if (debouncedSearch) query.search = debouncedSearch;

            const [resData, resStats] = await Promise.all([
                api.get('/properties', { params: query }),
                api.get('/properties/stats')
            ]);

            const data = resData.data.data;
            const statsData = resStats.data.data;

            setProperties(data);
            setStats(statsData);

            // We'll treat the first property as featured if available
            if (data.length > 0) {
                setFeaturedProperty(data[0]);
            } else {
                setFeaturedProperty(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load properties');
        } finally {
            setLoading(false);
        }
    }, [filters, debouncedSearch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <PropertyContext.Provider value={{
            properties,
            featuredProperty,
            stats,
            loading,
            error,
            searchQuery,
            setSearchQuery,
            filters,
            updateFilter,
            refreshData: loadData
        }}>
            {children}
        </PropertyContext.Provider>
    );
}

export function useProperty() {
    const ctx = useContext(PropertyContext);
    if (!ctx) throw new Error('useProperty must be used inside PropertyProvider');
    return ctx;
}

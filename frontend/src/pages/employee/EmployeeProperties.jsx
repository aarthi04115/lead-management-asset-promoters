import React, { useState } from 'react';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { useProperty } from '../../context/PropertyContext';
import FeaturedProperty from '../../components/property/FeaturedProperty';
import PropertyCard from '../../components/property/PropertyCard';

export default function EmployeeProperties() {
    const { properties, featuredProperty, stats, loading, error, filters, updateFilter, searchQuery, setSearchQuery } = useProperty();

    const remainingProperties = properties.filter(p => p._id !== featuredProperty?._id);

    return (
        <EmployeeLayout>
            <main className="max-w-[1600px] mx-auto px-8 py-10 space-y-8 animate-fade-in bg-background min-h-screen text-on-background">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold font-display">Properties</h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 font-medium">Explore and preview premium real estate assets in details.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        {/* Quick Search */}
                        <div className="relative flex-grow sm:flex-grow-0">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                            <input
                                type="text"
                                placeholder="Search properties..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-surface-bright border border-outline rounded-xl focus:border-secondary outline-none transition-all w-full sm:w-64 text-sm font-semibold"
                            />
                        </div>

                        {/* Filters */}
                        <select
                            value={filters.status}
                            onChange={(e) => updateFilter('status', e.target.value)}
                            className="px-4 py-3 bg-white border border-outline text-on-surface rounded-xl outline-none font-semibold text-sm shadow-sm"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Available">Available</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Booked">Booked</option>
                        </select>

                        <select
                            value={filters.category}
                            onChange={(e) => updateFilter('category', e.target.value)}
                            className="px-4 py-3 bg-white border border-outline text-on-surface rounded-xl outline-none font-semibold text-sm shadow-sm"
                        >
                            <option value="All">All Categories</option>
                            <option value="Villa">Villa</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Townhouse">Townhouse</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl flex items-center gap-3 font-semibold text-sm">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64 text-on-surface-variant gap-3 font-semibold">
                        <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                        <span className="text-body-lg">Loading luxury portfolio...</span>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant gap-3 border-2 border-dashed border-outline-variant/40 rounded-3xl">
                        <span className="material-symbols-outlined text-[48px]">search_off</span>
                        <p className="text-body-lg font-bold">No properties match your filters.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Property Overview */}
                        {featuredProperty && (
                            <FeaturedProperty
                                property={featuredProperty}
                                stats={stats}
                            />
                        )}

                        {/* Property Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {remainingProperties.map(property => (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </EmployeeLayout>
    );
}

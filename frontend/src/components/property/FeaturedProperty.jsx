import React, { useState } from 'react';
import placeholderImg from '../../assets/placeholder.png';
import { getBackendURL } from '../../api';

export default function FeaturedProperty({ property, stats }) {
    if (!property) return null;

    const getImageUrl = (url) => {
        if (!url) return placeholderImg;
        if (url.startsWith('/')) return getBackendURL(url);
        return url;
    };

    const image = property.images && property.images.length > 0
        ? getImageUrl(property.images[0])
        : placeholderImg;

    const [imgError, setImgError] = useState(false);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter mb-12 animate-fade-in">
            <div className="xl:col-span-8 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8">
                    <span className="px-4 py-1.5 bg-secondary-fixed text-on-secondary-fixed text-label-md rounded-full font-semibold">
                        FEATURED LISTING
                    </span>
                </div>
                <div className="flex flex-col md:flex-row h-full gap-8">
                    <div className="w-full md:w-1/2 h-64 md:h-auto rounded-2xl overflow-hidden shadow-lg bg-surface-container-highest">
                        {!imgError && image ? (
                            <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                src={image}
                                alt={property.title}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                src={placeholderImg}
                                alt="Property Placeholder"
                            />
                        )}
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <h3 className="font-headline-md text-headline-md text-primary leading-tight font-bold">{property.title}</h3>
                        <p className="text-body-md text-on-surface-variant mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            {property.location}
                        </p>
                        <div className="mt-6 flex gap-6">
                            <div>
                                <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Price</p>
                                <p className="font-title-lg text-title-lg text-secondary font-bold">{property.price}</p>
                            </div>
                            <div>
                                <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Type</p>
                                <p className="font-title-lg text-title-lg text-primary font-bold">{property.category || "—"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="xl:col-span-4 space-y-gutter">
                <div className="bg-primary-container rounded-3xl p-6 text-white h-[calc(50%-12px)] flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-secondary-fixed text-[32px]">analytics</span>
                        <span className="text-label-md bg-white/10 px-3 py-1 rounded-full text-secondary-fixed font-semibold">Live</span>
                    </div>
                    <div>
                        <p className="text-body-md text-on-primary-container/85">Active Listings</p>
                        <h4 className="text-display-lg font-display-lg font-bold">{stats.total || 0}</h4>
                    </div>
                </div>
                <div className="bg-secondary-container rounded-3xl p-6 text-on-secondary-container h-[calc(50%-12px)] flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-primary text-[32px]">payments</span>
                        <span className="text-label-md bg-black/5 px-3 py-1 rounded-full text-primary font-semibold">Pending</span>
                    </div>
                    <div>
                        <p className="text-body-md text-on-secondary-fixed-variant/85">Under Negotiation</p>
                        <h4 className="text-display-lg font-display-lg text-primary font-bold">{stats.negotiation || 0}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

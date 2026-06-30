import React, { useState } from 'react';
import placeholderImg from '../../assets/placeholder.png';
import { getBackendURL } from '../../api';

export default function PropertyCard({ property, onClick }) {
    const { title, location, price, status, category, images } = property;

    const getImageUrl = (url) => {
        if (!url) return placeholderImg;
        if (url.startsWith('/')) return getBackendURL(url);
        return url;
    };

    const image = images && images.length > 0 ? getImageUrl(images[0]) : placeholderImg;

    // Status badge styling
    const statusColors = {
        Available: "bg-white/90 backdrop-blur-md text-primary",
        Negotiation: "bg-secondary-fixed text-on-secondary-fixed",
        Booked: "bg-surface-container-highest text-on-surface-variant"
    };
    const statusClass = statusColors[status] || statusColors.Available;
    const [imgError, setImgError] = useState(false);

    return (
        <div className="property-card bg-white border border-outline-variant rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col cursor-pointer" onClick={onClick}>
            <div className="h-64 relative overflow-hidden bg-surface-container-highest">
                {!imgError && image ? (
                    <img
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        src={image}
                        alt={title}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <img
                        className="w-full h-full object-cover"
                        src={placeholderImg}
                        alt="Property Placeholder"
                    />
                )}
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 ${statusClass} text-label-md rounded-lg font-bold uppercase`}>
                        {status}
                    </span>
                </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                    <h4 className="font-title-lg text-title-lg text-primary font-semibold">{title}</h4>
                    <p className="text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {location}
                    </p>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                    <span className="text-body-md text-on-surface-variant font-medium">
                        {category}
                    </span>
                    <p className="text-title-lg font-title-lg text-secondary font-bold">{price}</p>
                </div>
            </div>
        </div>
    );
}

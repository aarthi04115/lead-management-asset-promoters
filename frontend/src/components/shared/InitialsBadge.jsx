import React from 'react';

const InitialsBadge = ({ name, size = 40, dark = false }) => {
    const getInitials = (n) => {
        if (!n) return '?';
        return n.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: dark ? '#0F172A' : '#F1F5F9',
            color: dark ? '#FFFFFF' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.4,
            fontWeight: '700',
            fontFamily: 'Outfit, sans-serif'
        }}>
            {getInitials(name)}
        </div>
    );
};

export default InitialsBadge;

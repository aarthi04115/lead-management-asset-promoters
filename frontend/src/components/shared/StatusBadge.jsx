import React from 'react';

const StatusBadge = ({ status }) => {
    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'new':
                return { bg: '#EFF6FF', text: '#3B82F6' };
            case 'interested':
                return { bg: '#ECFDF5', text: '#10B981' };
            case 'follow-up':
                return { bg: '#FFFBEB', text: '#F59E0B' };
            case 'lost':
                return { bg: '#FEF2F2', text: '#EF4444' };
            default:
                return { bg: '#F1F5F9', text: '#64748B' };
        }
    };

    const styles = getStatusStyles(status);

    return (
        <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            backgroundColor: styles.bg,
            color: styles.text,
            letterSpacing: '0.5px'
        }}>
            {status}
        </span>
    );
};

export default StatusBadge;

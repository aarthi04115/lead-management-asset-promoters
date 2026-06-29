import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

// Centralized RBAC Matrix
export const ROLE_PERMISSIONS = {
    admin: ['*'],
    lead_management: [
        'view_own_leads', 'create_lead', 'edit_own_lead', 'update_own_lead_status',
        'view_own_followups',
        'view_own_sitevisits',
        'view_properties'
    ],
    followup_management: [
        'view_own_leads',
        'view_own_followups', 'update_own_followup_status', 'complete_own_followup',
        'view_own_sitevisits',
        'view_properties'
    ],
    sitevisit_verification: [
        'view_own_leads',
        'view_own_followups',
        'view_own_sitevisits', 'verify_own_sitevisit', 'update_own_sitevisit_status', 'update_own_sitevisit_outcome',
        'view_properties'
    ],
    sales_executive: [
        'view_own_leads', 'edit_own_lead', 'update_own_lead_status', 'add_own_lead_remarks', 'add_own_lead_notes',
        'view_own_followups', 'create_followup', 'reschedule_own_followup', 'update_own_followup_status', 'complete_own_followup', 'add_own_followup_remarks',
        'view_own_sitevisits', 'create_sitevisit', 'verify_own_sitevisit', 'update_own_sitevisit_status', 'add_own_sitevisit_remarks',
        'view_properties'
    ],
    employee: [
        'view_own_leads', 'edit_own_lead', 'update_own_lead_status', 'add_own_lead_remarks', 'add_own_lead_notes',
        'view_own_followups', 'create_followup', 'reschedule_own_followup', 'update_own_followup_status', 'complete_own_followup', 'add_own_followup_remarks',
        'view_own_sitevisits', 'create_sitevisit', 'verify_own_sitevisit', 'update_own_sitevisit_status', 'add_own_sitevisit_remarks',
        'view_properties'
    ]
};

export const useRBAC = () => {
    const { user } = useAuth();

    const can = useMemo(() => {
        return (action) => {
            if (!user) return false;
            if (user.role === 'admin') return true;

            const permissions = ROLE_PERMISSIONS[user.role] || [];
            return permissions.includes(action) || permissions.includes('*');
        };
    }, [user]);

    return { can };
};

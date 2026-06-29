const ROLE_PERMISSIONS = {
    admin: ['*'],
    lead_management: [
        'view_leads', 'create_lead', 'edit_own_lead', 'update_own_lead_status', 'add_own_lead_notes',
        'view_followups', 'view_sitevisits', 'create_followup',
        'view_properties'
    ],
    followup_management: [
        'view_leads',
        'view_followups', 'update_own_followup_status', 'complete_own_followup', 'reschedule_own_followup', 'add_own_followup_remarks',
        'view_sitevisits',
        'view_properties'
    ],
    sitevisit_verification: [
        'view_leads', 'view_followups', 'view_sitevisits', 'verify_own_sitevisit', 'update_own_sitevisit_status', 'add_own_sitevisit_remarks', 'update_own_sitevisit_outcome',
        'view_properties'
    ],
    sales_executive: [
        'view_own_leads', 'edit_own_lead', 'update_own_lead_status', 'add_own_lead_notes', 'add_own_lead_remarks',
        'view_own_followups', 'create_own_followup', 'reschedule_own_followup', 'update_own_followup_status', 'complete_own_followup', 'add_own_followup_remarks',
        'view_own_sitevisits', 'create_own_sitevisit', 'verify_own_sitevisit', 'update_own_sitevisit_status', 'add_own_sitevisit_remarks',
        'view_properties'
    ],
    employee: [
        'view_own_leads', 'edit_own_lead', 'update_own_lead_status', 'add_own_lead_notes', 'add_own_lead_remarks',
        'view_own_followups', 'create_own_followup', 'reschedule_own_followup', 'update_own_followup_status', 'complete_own_followup', 'add_own_followup_remarks',
        'view_own_sitevisits', 'create_own_sitevisit', 'verify_own_sitevisit', 'update_own_sitevisit_status', 'add_own_sitevisit_remarks',
        'view_properties'
    ]
};

const hasPermission = (userRole, permission) => {
    if (!userRole) return false;
    if (userRole === 'admin') return true;

    const perms = ROLE_PERMISSIONS[userRole] || [];
    return perms.includes(permission) || perms.includes('*');
};

const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        // Exact permission match
        if (hasPermission(req.user.role, permission)) {
            req.restrictToOwnData = false;
            return next();
        }

        // Check for "own" data permission
        const parts = permission.split('_');
        const action = parts[0];
        const resource = parts.slice(1).join('_');
        const ownPermission = `${action}_own_${resource}`;

        if (hasPermission(req.user.role, ownPermission)) {
            // Restore data retrieval restriction for 'own' permissions
            req.restrictToOwnData = true;
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Access denied. Requires permission: ${permission}`
        });
    };
};

module.exports = { checkPermission, hasPermission, ROLE_PERMISSIONS };

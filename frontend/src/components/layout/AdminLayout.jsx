import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Users, Bell, Building2, MapPin, BarChart3,
    ChevronLeft, ChevronRight, LogOut, ChevronDown,
    UserCog, Settings2, Search
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const NAV = [
    { id: "dashboard", label: "Dashboard", path: "/admin", icon: LayoutDashboard, group: "general" },

    { id: "leads", label: "Lead Management", path: "/admin/leads", icon: Users, group: "crm" },
    { id: "properties", label: "Property Management", path: "/admin/properties", icon: Building2, group: "crm" },
    { id: "followups", label: "Follow-Up Management", path: "/admin/followups", icon: Bell, group: "crm" },
    { id: "employees", label: "Employee Management", path: "/admin/employees", icon: UserCog, group: "crm" },
    { id: "sitevisits", label: "Site Visits", path: "/admin/sitevisits", icon: MapPin, group: "crm" },

    {
        id: "reports", label: "Reports", icon: BarChart3, group: "reports",
        subItems: [
            { id: "dashboard-analytics", label: "Dashboard Analytics", path: "/admin/reports/analytics" },
            { id: "sales-reports", label: "Sales Reports", path: "/admin/reports/sales" },
            { id: "employee-performance", label: "Employee Performance", path: "/admin/reports/performance" },
            { id: "export-reports", label: "Export Reports", path: "/admin/reports/export" }
        ]
    },

    {
        id: "settings", label: "Settings", icon: Settings2, group: "system",
        subItems: [
            { id: "my-profile", label: "My Profile", path: "/admin/settings/profile" },
            { id: "security", label: "Security", path: "/admin/settings/security" },
            { id: "notifications", label: "Notifications", path: "/admin/settings/notifications" },
            { id: "appearance", label: "Appearance", path: "/admin/settings/appearance" }
        ]
    },
];

const GROUP_LABELS = {
    general: "GENERAL",
    crm: "CRM",
    reports: "REPORTS",
    system: "SYSTEM",
};

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Automatically expand the parent menu if the location matches a sub-item
    const [expandedMenus, setExpandedMenus] = useState({
        reports: location.pathname.includes('/admin/reports'),
        settings: location.pathname.includes('/admin/settings'),
    });

    useEffect(() => {
        const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const groups = NAV.reduce((acc, item) => {
        (acc[item.group] ??= []).push(item);
        return acc;
    }, {});

    const toggleSubMenu = (e, id) => {
        e.preventDefault();
        if (collapsed) setCollapsed(false); // Auto expand sidebar if opening sub-menu while collapsed
        setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderNavList = (isMobile) => {
        return Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-6 px-4">
                {(!collapsed || isMobile) && (
                    <div className="mb-[16px] px-2 text-[11px] font-bold text-[#A0A7B8] uppercase tracking-[0.15em]">
                        {GROUP_LABELS[group]}
                    </div>
                )}
                <div className="space-y-[6px]">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const hasSub = !!item.subItems;
                        // Check if any sub-item is active
                        const isSubActive = hasSub && item.subItems.some(sub => location.pathname.startsWith(sub.path) || (item.id === "reports" && location.pathname.startsWith('/admin/reports')) || (item.id === "settings" && location.pathname.startsWith('/admin/settings')));
                        const isActive = location.pathname === item.path && item.path !== '#';
                        const isPrimaryActive = isActive || isSubActive;
                        const isOpen = expandedMenus[item.id];

                        const content = (
                            <>
                                <div className={cn(
                                    "w-full flex items-center gap-[14px] px-[18px] min-h-[48px] rounded-[12px] transition-all duration-250 relative group outline-none",
                                    isPrimaryActive ? "bg-[#23293D] shadow-sm text-white font-bold" : "text-[#A0A7B8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] font-medium",
                                    hasSub ? "cursor-pointer" : ""
                                )}>
                                    <Icon size={20} className={cn("shrink-0 transition-colors duration-250", isPrimaryActive ? "text-[#F4B400]" : "group-hover:text-[#F4B400]")} />
                                    <AnimatePresence>
                                        {(!collapsed || isMobile) && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                                                transition={{ duration: 0.2 }} className="text-[14px] whitespace-nowrap leading-none flex-1 pt-0.5"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {/* Chevron for Submenus */}
                                    {hasSub && (!collapsed || isMobile) && (
                                        <ChevronDown size={14} className={cn("shrink-0 transition-transform duration-300", isOpen ? "rotate-180" : "opacity-50")} />
                                    )}

                                    {/* Active Highlight Line */}
                                    {isPrimaryActive && (
                                        <motion.div layoutId={isMobile ? "mobileActiveInd" : "desktopActiveInd"} className="absolute left-0 top-[12px] bottom-[12px] w-1 bg-[#F4B400] rounded-r-md" />
                                    )}
                                </div>

                                {/* Render SubItems Drawer */}
                                {hasSub && (!collapsed || isMobile) && (
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pl-[28px] mt-1 space-y-1 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[rgba(255,255,255,0.08)]">
                                                    {item.subItems.map((sub) => {
                                                        const isChildActive = location.pathname.startsWith(sub.path);
                                                        return (
                                                            <Link
                                                                key={sub.id}
                                                                to={sub.path}
                                                                onClick={isMobile ? () => setMobileOpen(false) : undefined}
                                                                className={cn(
                                                                    "flex items-center pl-6 pr-4 py-2.5 rounded-lg text-[13px] transition-colors relative",
                                                                    isChildActive ? "text-white font-bold" : "text-[#A0A7B8] hover:text-white hover:bg-[rgba(255,255,255,0.04)] font-medium"
                                                                )}
                                                            >
                                                                <span className={cn("absolute left-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border-2", isChildActive ? "border-[#F4B400] bg-[#171C2D]" : "border-transparent")} />
                                                                {sub.label}
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </>
                        );

                        return (
                            <div key={item.id} title={collapsed && !isMobile ? item.label : ""}>
                                {hasSub ? (
                                    <div onClick={(e) => toggleSubMenu(e, item.id)}>{content}</div>
                                ) : (
                                    <Link to={item.path} onClick={isMobile ? () => setMobileOpen(false) : undefined}>{content}</Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        ));
    };

    return (
        <div className="flex h-screen w-full overflow-hidden relative bg-slate-50 font-inter">
            {/* Ambient background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute w-[800px] h-[800px] rounded-full flex shrink-0"
                    style={{ background: "rgba(201, 162, 39, 0.05)", filter: "blur(120px)", top: "-20%", right: "-10%" }} />
                <div className="absolute w-[600px] h-[600px] rounded-full flex shrink-0"
                    style={{ background: "rgba(15, 23, 42, 0.03)", filter: "blur(100px)", bottom: "-10%", left: "-10%" }} />
            </div>

            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 80 : 280 }}
                className="hidden lg:flex flex-col bg-[#171C2D] relative shrink-0 z-20 transition-all duration-300 shadow-xl overflow-hidden h-full"
            >
                {/* Logo Area */}
                <div className="pt-[32px] pb-[32px] border-b border-[rgba(255,255,255,0.08)] shrink-0 flex flex-col items-center justify-center relative">
                    {collapsed ? (
                        <div className="w-10 h-10 rounded-lg bg-[#23293D] flex items-center justify-center shrink-0 border border-[rgba(255,255,255,0.08)]">
                            <span className="text-[#F4B400] font-black text-lg">S</span>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1 w-full text-center px-4">
                            <h2 className="text-[20px] font-bold text-white tracking-tight leading-tight whitespace-nowrap">
                                Smart Real Estate
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F4B400] whitespace-nowrap">
                                ADMIN PORTAL
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto pt-6 pb-4 custom-scrollbar">
                    {renderNavList(false)}
                </nav>

                {/* Bottom Profile and Logout Section */}
                <div className="p-4 border-t border-[rgba(255,255,255,0.08)] shrink-0 bg-[#171C2D]">
                    {/* Admin Profile Details */}
                    {!collapsed && (
                        <div className="bg-[#23293D] rounded-[12px] p-3 flex items-center gap-3 border border-[rgba(255,255,255,0.06)] mb-2 shadow-sm">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#171C2D] text-white flex items-center justify-center text-xs font-bold border border-[rgba(255,255,255,0.1)]">
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
                                </div>
                                <div className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full border-2 border-[#23293D] bg-[#22C55E]"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-[13px] font-bold truncate">{user?.name || "Administrator"}</p>
                                <p className="text-[#A0A7B8] text-[10px] font-medium uppercase tracking-wider mt-0.5">Online</p>
                            </div>
                        </div>
                    )}

                    {/* Logout Button */}
                    <button onClick={logout} className="w-full flex items-center gap-[14px] px-[18px] py-[10px] min-h-[48px] rounded-[12px] text-[#A0A7B8] hover:text-white hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444] transition-colors group outline-none" title={collapsed ? "Logout" : ""}>
                        <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
                        {!collapsed && <span className="text-[14px] font-bold whitespace-nowrap pt-0.5">Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle Bubble */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-[32px] w-6 h-6 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#23293D] text-[#A0A7B8] flex items-center justify-center z-50 hover:text-white hover:bg-[rgba(255,255,255,0.06)] shadow-lg transition-colors cursor-pointer"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 lg:hidden bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                        <motion.aside
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-40 w-64 bg-[#171C2D] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Mobile Logo */}
                            <div className="pt-8 pb-6 border-b border-[rgba(255,255,255,0.08)] shrink-0 flex flex-col items-center justify-center relative">
                                <h2 className="text-[20px] font-bold text-white tracking-tight leading-tight">Smart Real Estate</h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F4B400] mt-1">ADMIN PORTAL</p>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="flex-1 overflow-y-auto pt-4 pb-4 custom-scrollbar">
                                {renderNavList(true)}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Space */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 transition-all duration-300">
                {/* Header Navbar */}
                <header className="h-[80px] bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40 px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <button className="lg:hidden text-slate-500 hover:text-[#0F172A]" onClick={() => setMobileOpen(true)}>
                            <LayoutDashboard size={24} />
                        </button>
                        <div className="relative w-64 md:w-96 hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search leads, properties, or agents..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F172A]/5 focus:border-[#F4B400] transition-all text-[#0F172A] font-medium placeholder:text-slate-400 shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-[#F4B400] transition-colors group">
                            <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-[#F4B400] rounded-full" />
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-full border border-slate-100 shadow-sm">
                            <div className="w-9 h-9 rounded-full bg-[#171C2D] text-[#F4B400] flex items-center justify-center text-sm font-bold tracking-tight shadow-inner">
                                {user?.name ? user.name.substring(0, 2).toUpperCase() : "SA"}
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-[#171C2D] leading-none mb-1">{user?.name || "System Admin"}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {user?.role === "admin" ? "Super Admin" : "Executive"}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

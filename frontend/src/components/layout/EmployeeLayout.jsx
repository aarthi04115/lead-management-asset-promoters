import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Users, Bell, Building2, MapPin,
    ChevronLeft, ChevronRight, LogOut, ChevronDown, Search, X, Phone
} from "lucide-react";
import { useSearch } from "../../context/SearchContext";
import api from "../../api";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const NAV = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, group: "general" },
    { id: "leads", label: "Lead Management", path: "/employee/leads", icon: Users, group: "crm" },
    { id: "followups", label: "Follow-Up Management", path: "/employee/followups", icon: Bell, group: "crm" },
    { id: "sitevisits", label: "Site Visit Verification", path: "/employee/site-visits", icon: MapPin, group: "crm" },
    { id: "properties", label: "Properties", path: "/employee/properties", icon: Building2, group: "crm" }
];

const GROUP_LABELS = {
    general: "GENERAL",
    crm: "CRM"
};

const getRoleLabel = (role) => {
    switch (role) {
        case "lead_management":
            return "Lead Management Executive";
        case "followup_management":
            return "Follow-up Executive";
        case "sitevisit_verification":
            return "Site Visit Coordinator";
        case "sales_executive":
            return "Sales Executive";
        default:
            return "Employee";
    }
};

const EmployeeLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { globalSearch: searchQuery, setGlobalSearch: setSearchQuery } = useSearch();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const [leadRes, fupRes, svRes] = await Promise.all([
                    api.get("/leads?limit=5").catch(() => ({ data: { data: [] } })),
                    api.get("/followups").catch(() => ({ data: { data: [] } })),
                    api.get("/sitevisits?limit=5").catch(() => ({ data: { data: [] } }))
                ]);

                const fetchedLeads = leadRes.data?.data || [];
                const fetchedFups = fupRes.data?.data || [];
                const fetchedSvisits = svRes.data?.data || [];

                const activities = [];

                fetchedFups.slice(0, 3).forEach(f => {
                    const schedDate = f.schedule ? new Date(f.schedule).toLocaleDateString() : '';
                    activities.push({
                        id: `fup-${f._id}`,
                        title: 'Follow-Up Scheduled',
                        desc: `Scheduled with ${f.customerName || 'Unknown'} on ${f.followUpDate || schedDate}`,
                        time: 'Soon',
                        type: 'followup'
                    });
                });

                fetchedSvisits.slice(0, 3).forEach(v => {
                    activities.push({
                        id: `sv-${v._id}`,
                        title: 'Site Visit Scheduled',
                        desc: `Visit with ${v.customerName || 'Unknown'} for ${v.propertyName || 'Property'}`,
                        time: 'Scheduled',
                        type: 'sitevisit'
                    });
                });

                fetchedLeads.slice(0, 3).forEach(l => {
                    activities.push({
                        id: `lead-${l._id}`,
                        title: 'New Lead Registered',
                        desc: `${l.name} from ${l.source || 'Website'}`,
                        time: 'Registered',
                        type: 'lead'
                    });
                });

                setNotifications(activities);
                setUnreadCount(activities.length);
            } catch (err) {
                console.error("Failed to load notifications:", err);
            }
        };
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user, location.pathname]);

    useEffect(() => {
        const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const groups = NAV.reduce((acc, item) => {
        (acc[item.group] ??= []).push(item);
        return acc;
    }, {});

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
                        const isActive = location.pathname === item.path;

                        const content = (
                            <div className={cn(
                                "w-full flex items-center gap-[14px] px-[18px] min-h-[48px] rounded-[12px] transition-all duration-250 relative group outline-none",
                                isActive ? "bg-[#23293D] shadow-sm text-white font-bold" : "text-[#A0A7B8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] font-medium"
                            )}>
                                <Icon size={20} className={cn("shrink-0 transition-colors duration-250", isActive ? "text-[#F4B400]" : "group-hover:text-[#F4B400]")} />
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

                                {/* Active Highlight Line */}
                                {isActive && (
                                    <motion.div layoutId={isMobile ? "mobileActiveIndEmp" : "desktopActiveIndEmp"} className="absolute left-0 top-[12px] bottom-[12px] w-1 bg-[#F4B400] rounded-r-md" />
                                )}
                            </div>
                        );

                        return (
                            <div key={item.id} title={collapsed && !isMobile ? item.label : ""}>
                                <Link to={item.path} onClick={isMobile ? () => setMobileOpen(false) : undefined}>{content}</Link>
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
                            <span className="text-[#F4B400] font-black text-lg">P</span>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1 w-full text-center px-4">
                            <h2 className="text-[20px] font-bold text-white tracking-tight leading-tight whitespace-nowrap">
                                Smart Real Estate
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F4B400] whitespace-nowrap">
                                EMPLOYEE PORTAL
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto pt-6 pb-4 custom-scrollbar">
                    {renderNavList(false)}
                </nav>

                {/* Sidebar Search Bar and Notifications */}
                <div className="px-[18px] mb-4 shrink-0">
                    {!collapsed ? (
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A7B8]" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-[#23293D] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs outline-none focus:border-[#F4B400] text-white font-medium placeholder:text-[#A0A7B8]/60"
                            />
                        </div>
                    ) : (
                        <div className="flex justify-center text-[#A0A7B8] hover:text-white cursor-pointer" onClick={() => setCollapsed(false)}>
                            <Search size={18} />
                        </div>
                    )}

                    {/* Notifications Button */}
                    <button
                        onClick={() => {
                            setDropdownOpen(true);
                            setUnreadCount(0);
                        }}
                        className="w-full flex items-center gap-[14px] px-[18px] py-[10px] min-h-[48px] rounded-[12px] text-[#A0A7B8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors group outline-none mt-2"
                        title={collapsed ? "Notifications" : ""}
                    >
                        <div className="relative">
                            <Bell size={20} className="shrink-0 transition-transform group-hover:rotate-12" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F4B400] rounded-full border-2 border-[#171C2D] animate-pulse" />
                            )}
                        </div>
                        {!collapsed && (
                            <span className="text-[14px] font-bold whitespace-nowrap pt-0.5 flex-1 text-left">
                                Notifications
                            </span>
                        )}
                        {!collapsed && unreadCount > 0 && (
                            <span className="bg-[#F4B400] text-[#171C2D] text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Bottom Profile and Logout Section */}
                <div className="p-4 border-t border-[rgba(255,255,255,0.08)] shrink-0 bg-[#171C2D]">
                    {!collapsed && (
                        <div className="bg-[#23293D] rounded-[12px] p-3 flex items-center gap-3 border border-[rgba(255,255,255,0.06)] mb-2 shadow-sm">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#171C2D] text-white flex items-center justify-center text-xs font-bold border border-[rgba(255,255,255,0.1)]">
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'EM'}
                                </div>
                                <div className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full border-2 border-[#23293D] bg-[#22C55E]"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-[13px] font-bold truncate">{user?.name || "Employee"}</p>
                                <p className="text-[#A0A7B8] text-[9px] font-semibold uppercase tracking-wider mt-0.5 truncate">{getRoleLabel(user?.role)}</p>
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
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F4B400] mt-1">EMPLOYEE PORTAL</p>
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
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
                    {children}
                </main>
            </div>

            {/* Centered Notifications Modal Showcase */}
            {dropdownOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setDropdownOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-[#171C2D] animate-fade-in flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 bg-slate-50 flex justify-between items-center border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <Bell className="text-[#F4B400]" size={18} />
                                <span className="text-base font-bold text-[#171C2D]">Recent Notifications</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        setNotifications([]);
                                        setDropdownOpen(false);
                                    }}
                                    className="text-[11px] font-black text-rose-500 hover:underline uppercase tracking-wider"
                                >
                                    Clear All
                                </button>
                                <button onClick={() => setDropdownOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto divide-y divide-slate-100 custom-scrollbar flex-1">
                            {notifications.length > 0 ? (
                                notifications.map((item) => {
                                    const selectIcon = () => {
                                        if (item.type === 'followup') return <Phone size={14} className="text-[#EAB308]" />;
                                        if (item.type === 'sitevisit') return <MapPin size={14} className="text-blue-500" />;
                                        return <Users size={14} className="text-indigo-500" />;
                                    };
                                    const selectBg = () => {
                                        if (item.type === 'followup') return 'bg-[#EAB308]/10';
                                        if (item.type === 'sitevisit') return 'bg-blue-500/10';
                                        return 'bg-indigo-500/10';
                                    };
                                    return (
                                        <div key={item.id} className="p-4 hover:bg-slate-50/50 flex items-start gap-4 transition-colors cursor-pointer" onClick={() => setDropdownOpen(false)}>
                                            <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5", selectBg())}>
                                                {selectIcon()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[14px] font-bold text-[#171C2D]">{item.title}</p>
                                                <p className="text-[12px] font-medium text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider mt-2.5 inline-block">{item.time}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-16 text-center text-sm font-semibold text-slate-400 flex flex-col items-center justify-center gap-2">
                                    <Bell size={32} className="text-slate-300" />
                                    No recent notifications
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeLayout;

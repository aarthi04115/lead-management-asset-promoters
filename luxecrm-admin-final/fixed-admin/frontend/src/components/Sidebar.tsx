import React from "react";

interface NavItem {
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "groups", label: "Lead Management" },
  { icon: "history_toggle_off", label: "Follow-Up Management" },
  { icon: "verified", label: "Site Visit Verification" },
  { icon: "domain", label: "Property Management" },
];

interface SidebarProps {
  activeNav: string;
  onNavClick: (label: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavClick,
  onLogout,
  isOpen,
  onCloseMobile,
}) => {
  return (
    <aside
      className={`w-[260px] h-screen fixed left-0 top-0 bg-primary-container text-secondary-fixed shadow-md border-r border-outline-variant flex flex-col py-6 z-50 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="px-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Elite Real Estate</h1>
          <p className="text-xs text-[#7884a2] opacity-70 tracking-widest uppercase mt-1">
            Admin Portal
          </p>
        </div>
        <button
          onClick={onCloseMobile}
          aria-label="Close menu"
          className="lg:hidden text-white/70 hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-2">
        {navItems.map((item) => {
          const isActive = item.label === activeNav;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavClick(item.label)}
              className={
                isActive
                  ? "w-full flex items-center gap-4 px-4 py-2 rounded-lg border-l-4 border-[#ffe088] bg-[rgba(211,228,254,0.1)] text-[#ffe088] font-bold text-left"
                  : "w-full flex items-center gap-4 px-4 py-2 rounded-lg text-[rgba(211,228,254,0.8)] font-medium hover:bg-[rgba(211,228,254,0.1)] hover:text-white transition-colors text-left"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-2 mt-auto">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-2 rounded-lg text-[rgba(211,228,254,0.8)] font-medium hover:bg-error/10 hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

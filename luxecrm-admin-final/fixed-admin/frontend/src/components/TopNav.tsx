import React from "react";
import { adminAvatar } from "../data";

interface TopNavProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onBellClick: () => void;
  onAlertClick: () => void;
}

const TopNav: React.FC<TopNavProps> = ({
  onMenuClick,
  searchQuery,
  onSearchChange,
  onBellClick,
  onAlertClick,
}) => {
  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-[260px] bg-surface-container-lowest border-b border-surface-variant shadow-sm flex justify-between items-center px-4 sm:px-6 z-30">
      <div className="flex items-center gap-3 sm:gap-6 w-full max-w-md">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden text-black p-1"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search properties, owners..."
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-2">
        <button
          onClick={onAlertClick}
          aria-label="Important notifications"
          className="p-2 rounded-full hover:bg-surface-variant/20 transition-all active:scale-95 duration-150"
        >
          <span className="material-symbols-outlined text-black">
            notification_important
          </span>
        </button>

        <button
          onClick={onBellClick}
          aria-label="Notifications"
          className="p-2 rounded-full hover:bg-surface-variant/20 transition-all active:scale-95 duration-150 relative"
        >
          <span className="material-symbols-outlined text-black">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>

        <div className="h-8 w-[1px] bg-outline-variant mx-1 sm:mx-2 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-black">Admin User</p>
            <p className="text-[10px] text-outline uppercase tracking-wider">
              Super Admin
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline-variant">
            <img
              src={adminAvatar}
              alt="Admin user avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

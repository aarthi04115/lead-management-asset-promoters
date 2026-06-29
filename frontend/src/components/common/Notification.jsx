import React from "react";

/**
 * Reusable Notification Component
 */
const Notification = ({ notification }) => {
    if (!notification) return null;

    const { type, message } = notification;
    const isSuccess = type === "success";

    return (
        <div
            className={`mb-lg p-4 rounded-xl text-sm flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${isSuccess
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}
        >
            <span className="material-symbols-outlined text-md">
                {isSuccess ? "check_circle" : "error"}
            </span>
            <span className="font-medium">{message}</span>
        </div>
    );
};

export default Notification;

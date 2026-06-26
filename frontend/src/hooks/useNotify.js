import { useState, useCallback } from "react";

/**
 * Custom hook to manage notifications/toasts
 */
export const useNotify = (duration = 4500) => {
    const [notification, setNotification] = useState(null);

    const notify = useCallback((type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), duration);
    }, [duration]);

    return { notification, notify };
};

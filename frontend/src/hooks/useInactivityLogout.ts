import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in milliseconds

export const useInactivityLogout = () => {
  const { logout, isAuthenticated } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isAuthenticated) {
      timerRef.current = setTimeout(() => {
        logout();
        alert("You've been logged out due to inactivity. Please log in again.");
        window.location.href = "/login";
      }, INACTIVITY_LIMIT);
    }
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // initialize

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isAuthenticated]);
};

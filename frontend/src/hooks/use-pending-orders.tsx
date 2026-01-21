"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import StaffOrderTrackingService from "@/services/staff-order-tracking.service";
import { toast } from "sonner";

export function usePendingOrders(autoRefresh = false, refreshInterval = 30000) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const previousCountRef = useRef<number | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== "undefined") {
      soundRef.current = new Audio("/sounds/notification.mp3");
      soundRef.current.volume = 0.5;
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      setLoading(true);
      const response = await StaffOrderTrackingService.getPendingOrders();
      
      if (response.success && response.data) {
        const newCount = response.data.length;
        setPendingCount(newCount);

        // Detect new orders (count increased)
        if (previousCountRef.current !== null && newCount > previousCountRef.current) {
          const newOrdersCount = newCount - previousCountRef.current;
          
          // Play sound
          if (soundRef.current) {
            // Reset audio to start before playing
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(err => console.log("Audio play failed:", err));
          }

          // Show toast notification with action
          toast.success(
            `🔔 Có ${newOrdersCount} đơn hàng mới!`,
            {
              description: "Nhấn vào để xem chi tiết đơn hàng",
              duration: 10000,
              action: {
                label: "Xem ngay",
                onClick: () => {
                  window.location.href = "/staff/tracking-order";
                }
              }
            }
          );
        }

        previousCountRef.current = newCount;
      }
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPendingCount();

    if (autoRefresh) {
      const interval = setInterval(fetchPendingCount, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchPendingCount]);

  return {
    pendingCount,
    loading,
    refresh: fetchPendingCount,
  };
}

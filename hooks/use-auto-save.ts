"use client"

import { useEffect, useRef } from "react"

/**
 * Custom hook to automatically save data after a debounce period
 * Optimized for preserving state during data collection tasks
 *
 * @param data - The data to auto-save
 * @param onSave - Callback function to execute when saving
 * @param delay - Debounce delay in milliseconds (default: 1000ms)
 */
export function useAutoSave<T>(data: T, onSave: (data: T) => void, delay = 1000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip auto-save on first render to avoid unnecessary saves
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      onSave(data)
    }, delay)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave, delay])
}

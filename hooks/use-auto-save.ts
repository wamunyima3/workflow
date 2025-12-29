"use client"

import { useEffect, useRef } from "react"

/**
 * Enhanced auto-save hook with hybrid strategy:
 * - Debounced saves during active typing
 * - Immediate save when user stops interacting
 * - Save on page unload to prevent data loss
 *
 * @param data - The data to auto-save
 * @param onSave - Callback function to execute when saving
 * @param options - Configuration options
 */
export function useAutoSave<T>(
    data: T,
    onSave: (data: T) => void,
    options: {
      debounceDelay?: number // Delay during active typing (default: 1000ms)
      idleDelay?: number // Delay after user stops interacting (default: 300ms)
      saveOnUnload?: boolean // Save when page unloads (default: true)
    } = {}
) {
  const {
    debounceDelay = 1000,
    idleDelay = 300,
    saveOnUnload = true
  } = options

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)
  const lastSavedData = useRef<T>(data)
  const isTypingRef = useRef(false)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track if user is actively typing
  useEffect(() => {
    const handleUserActivity = () => {
      isTypingRef.current = true

      // Clear idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }

      // Set new idle timeout
      idleTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
      }, idleDelay)
    }

    window.addEventListener('keydown', handleUserActivity)
    window.addEventListener('input', handleUserActivity)

    return () => {
      window.removeEventListener('keydown', handleUserActivity)
      window.removeEventListener('input', handleUserActivity)
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
    }
  }, [idleDelay])

  // Main auto-save logic
  useEffect(() => {
    // Skip auto-save on first render
    if (isFirstRender.current) {
      isFirstRender.current = false
      lastSavedData.current = data
      return
    }

    // Check if data actually changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedData.current)) {
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Use shorter delay if user is idle, longer if actively typing
    const delay = isTypingRef.current ? debounceDelay : idleDelay

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      onSave(data)
      lastSavedData.current = data
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave, debounceDelay, idleDelay])

  // Save on page unload to prevent data loss
  useEffect(() => {
    if (!saveOnUnload) return

    const handleBeforeUnload = () => {
      // Check if there's unsaved data
      if (JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
        onSave(data)
        lastSavedData.current = data
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [data, onSave, saveOnUnload])

  // Save on visibility change (tab switch, minimize)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Check if there's unsaved data
        if (JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
          onSave(data)
          lastSavedData.current = data
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [data, onSave])
}
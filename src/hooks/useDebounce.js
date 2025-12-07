/**
 * useDebounce Hook
 *
 * Returns a debounced version of a callback function
 */
import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook that returns a debounced version of a callback
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {[Function, Function]} [debouncedFn, cancel]
 */
export function useDebounce(callback, delay) {
    const timerRef = useRef(null);
    const callbackRef = useRef(callback);

    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedFn = useCallback((...args) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);

    const cancel = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return [debouncedFn, cancel];
}

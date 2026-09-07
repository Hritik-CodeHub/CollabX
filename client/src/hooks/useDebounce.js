import { useRef, useCallback, useEffect } from 'react';

export function useDebounce(callback, delay = 500) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  // Keep callbackRef up-to-date with latest callback reference
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up any pending timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current?.(...args);
      }, delay);
    },
    [delay]
  );

  return debouncedCallback;
}

export default useDebounce;


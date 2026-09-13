import { useEffect, useState } from 'react';

// useState that survives page reloads via localStorage.
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage blocked — keep working in memory.
    }
  }, [key, value]);

  return [value, setValue];
}

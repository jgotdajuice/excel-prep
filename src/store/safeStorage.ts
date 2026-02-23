/**
 * Safe localStorage wrapper that silently no-ops in private browsing mode
 * or any environment where localStorage is unavailable.
 *
 * Used with Zustand persist middleware's createJSONStorage().
 */
export const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Silent — private browsing or storage quota exceeded
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Silent
    }
  },
};

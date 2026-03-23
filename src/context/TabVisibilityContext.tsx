import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface TabVisibilityContextType {
  isTabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
}

const TabVisibilityContext = createContext<TabVisibilityContextType | undefined>(undefined);

export const TabVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const setTabBarVisible = useCallback((visible: boolean) => {
    setIsTabBarVisible((prev) => {
      if (prev === visible) return prev;
      return visible;
    });
  }, []);

  // FIX 3: Memoize the context value so it doesn't trigger unnecessary re-renders
  const value = useMemo(() => ({
    isTabBarVisible,
    setTabBarVisible
  }), [isTabBarVisible, setTabBarVisible]);

  return (
    <TabVisibilityContext.Provider value={value}>
      {children}
    </TabVisibilityContext.Provider>
  );
};

export const useTabVisibility = () => {
  const context = useContext(TabVisibilityContext);
  if (!context) {
    throw new Error('useTabVisibility must be used within a TabVisibilityProvider');
  }
  return context;
};
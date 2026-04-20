import { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
  navigateTo: (page: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ 
  children, 
  navigateTo 
}: { 
  children: ReactNode;
  navigateTo: (page: string) => void;
}) {
  return (
    <NavigationContext.Provider value={{ navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

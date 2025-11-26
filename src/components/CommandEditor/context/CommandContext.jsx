import { createContext, useContext } from 'react';

const CommandContext = createContext(null);

export const CommandProvider = ({ children, value }) => {
  return (
    <CommandContext.Provider value={value}>
      {children}
    </CommandContext.Provider>
  );
};

export const useCommandContext = () => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommandContext must be used within a CommandProvider');
  }
  return context;
};

export default CommandContext;

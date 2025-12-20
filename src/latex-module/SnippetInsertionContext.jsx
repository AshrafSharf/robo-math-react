import { createContext, useContext, useState, useCallback } from 'react';

const SnippetInsertionContext = createContext();

export function SnippetInsertionProvider({ children }) {
  const [insertSnippet, setInsertSnippet] = useState(null);

  const registerInsertHandler = useCallback((handler) => {
    setInsertSnippet(() => handler);
  }, []);

  return (
    <SnippetInsertionContext.Provider value={{ insertSnippet, registerInsertHandler }}>
      {children}
    </SnippetInsertionContext.Provider>
  );
}

export function useSnippetInsertion() {
  const context = useContext(SnippetInsertionContext);
  return context || { insertSnippet: null, registerInsertHandler: () => {} };
}

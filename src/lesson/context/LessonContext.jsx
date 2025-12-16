import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { createLesson, createPage, getNextPageId } from '../models/lessonModel';

const LessonContext = createContext(null);

// Action types
const ACTIONS = {
  SET_LESSON: 'SET_LESSON',
  SET_LESSON_NAME: 'SET_LESSON_NAME',
  ADD_PAGE: 'ADD_PAGE',
  DELETE_PAGE: 'DELETE_PAGE',
  RENAME_PAGE: 'RENAME_PAGE',
  SET_ACTIVE_PAGE: 'SET_ACTIVE_PAGE',
  UPDATE_PAGE_COMMANDS: 'UPDATE_PAGE_COMMANDS',
  NEW_LESSON: 'NEW_LESSON'
};

function lessonReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LESSON:
      return action.payload;

    case ACTIONS.SET_LESSON_NAME:
      return { ...state, name: action.payload, updatedAt: Date.now() };

    case ACTIONS.ADD_PAGE: {
      const newPageId = getNextPageId(state);
      const newPage = createPage(newPageId, `Page ${newPageId}`);
      return {
        ...state,
        pages: [...state.pages, newPage],
        activePageId: newPageId,
        updatedAt: Date.now()
      };
    }

    case ACTIONS.DELETE_PAGE: {
      if (state.pages.length <= 1) return state;
      const newPages = state.pages.filter(p => p.id !== action.payload);
      const newActiveId = state.activePageId === action.payload
        ? newPages[0].id
        : state.activePageId;
      return {
        ...state,
        pages: newPages,
        activePageId: newActiveId,
        updatedAt: Date.now()
      };
    }

    case ACTIONS.RENAME_PAGE:
      return {
        ...state,
        pages: state.pages.map(p =>
          p.id === action.payload.pageId
            ? { ...p, name: action.payload.name }
            : p
        ),
        updatedAt: Date.now()
      };

    case ACTIONS.SET_ACTIVE_PAGE:
      return { ...state, activePageId: action.payload };

    case ACTIONS.UPDATE_PAGE_COMMANDS:
      return {
        ...state,
        pages: state.pages.map(p =>
          p.id === action.payload.pageId
            ? { ...p, commands: action.payload.commands }
            : p
        ),
        updatedAt: Date.now()
      };

    case ACTIONS.NEW_LESSON:
      return createLesson();

    default:
      return state;
  }
}

export const LessonProvider = ({ children, initialLesson }) => {
  const [lesson, dispatch] = useReducer(lessonReducer, initialLesson || createLesson());

  // Memoized action creators
  const setLesson = useCallback((lesson) =>
    dispatch({ type: ACTIONS.SET_LESSON, payload: lesson }), []);

  const setLessonName = useCallback((name) =>
    dispatch({ type: ACTIONS.SET_LESSON_NAME, payload: name }), []);

  const addPage = useCallback(() =>
    dispatch({ type: ACTIONS.ADD_PAGE }), []);

  const deletePage = useCallback((pageId) =>
    dispatch({ type: ACTIONS.DELETE_PAGE, payload: pageId }), []);

  const renamePage = useCallback((pageId, name) =>
    dispatch({ type: ACTIONS.RENAME_PAGE, payload: { pageId, name } }), []);

  const setActivePage = useCallback((pageId) =>
    dispatch({ type: ACTIONS.SET_ACTIVE_PAGE, payload: pageId }), []);

  const updatePageCommands = useCallback((pageId, commands) =>
    dispatch({ type: ACTIONS.UPDATE_PAGE_COMMANDS, payload: { pageId, commands } }), []);

  const newLesson = useCallback(() =>
    dispatch({ type: ACTIONS.NEW_LESSON }), []);

  // Derived state
  const activePage = lesson.pages.find(p => p.id === lesson.activePageId) || lesson.pages[0];

  return (
    <LessonContext.Provider value={{
      lesson,
      activePage,
      setLesson,
      setLessonName,
      addPage,
      deletePage,
      renamePage,
      setActivePage,
      updatePageCommands,
      newLesson
    }}>
      {children}
    </LessonContext.Provider>
  );
};

export const useLesson = () => {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLesson must be used within a LessonProvider');
  }
  return context;
};

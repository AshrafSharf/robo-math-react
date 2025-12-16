import React from 'react';
import { useLesson } from '../../context';
import './PageTabBar.css';

const PageTab = ({ page, isActive, onClick, onDelete, canDelete }) => {
  return (
    <div
      className={`page-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={page.name}
    >
      <span className="page-tab-name">{page.name}</span>
      {canDelete && (
        <span
          className="page-tab-close"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete page"
        >
          &times;
        </span>
      )}
    </div>
  );
};

const PageTabBar = ({ isSidebarCollapsed }) => {
  const { lesson, activePage, setActivePage, addPage, deletePage } = useLesson();
  const canDelete = lesson.pages.length > 1;

  return (
    <div className={`page-tab-bar ${isSidebarCollapsed ? 'expanded' : ''}`}>
      <div className="page-tabs">
        {lesson.pages.map(page => (
          <PageTab
            key={page.id}
            page={page}
            isActive={page.id === activePage.id}
            onClick={() => setActivePage(page.id)}
            onDelete={() => deletePage(page.id)}
            canDelete={canDelete}
          />
        ))}
      </div>
      <button
        className="add-page-btn"
        onClick={addPage}
        title="Add Page"
      >
        +
      </button>
    </div>
  );
};

export default PageTabBar;

import React from 'react';
import { getExpressionDisplayName, hasOptionsPanel, hasRefTab } from '../../utils/expressionTypeDetector';
import { getAllowedTabs } from '../../utils/expressionOptionsSchema';

/**
 * Tab navigation component for Settings dialog
 */
const SettingsTabs = ({ activeTab, onTabChange, expressionType, innerExpressionType }) => {
  // For ref expressions, use inner type for expression options panel
  const effectiveType = innerExpressionType || expressionType;

  // Check if this expression type has restricted tabs via schema
  const allowedTabs = getAllowedTabs(expressionType);

  // Build tabs list
  const tabs = [];

  // Style tab (unless restricted)
  if (!allowedTabs || allowedTabs.includes('style')) {
    tabs.push({ id: 'style', label: 'Style' });
  }

  // Ref tab for ref() expressions
  if (hasRefTab(expressionType)) {
    tabs.push({ id: 'ref', label: 'Ref' });
  }

  // Expression options tab (g2d, p2d, table)
  if (hasOptionsPanel(effectiveType)) {
    tabs.push({
      id: 'expression',
      label: getExpressionDisplayName(effectiveType)
    });
  }

  // Animation tab (unless restricted)
  if (!allowedTabs || allowedTabs.includes('animation')) {
    tabs.push({ id: 'animation', label: 'Animation' });
  }

  return (
    <div className="settings-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default SettingsTabs;

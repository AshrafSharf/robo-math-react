import React from 'react';
import { getExpressionDisplayName, hasOptionsPanel, hasRefTab } from '../../utils/expressionTypeDetector';

/**
 * Tab navigation component for Settings dialog
 */
const SettingsTabs = ({ activeTab, onTabChange, expressionType, innerExpressionType }) => {
  const tabs = [
    { id: 'style', label: 'Style' }
  ];

  // Add Ref tab if expression is ref() - before Animation
  if (hasRefTab(expressionType)) {
    tabs.push({ id: 'ref', label: 'Ref' });
  }

  // For ref expressions, use inner type for expression options panel (g2d, p2d)
  const effectiveType = innerExpressionType || expressionType;

  // Only add expression options tab if this type has a dedicated panel (g2d, p2d)
  if (hasOptionsPanel(effectiveType)) {
    tabs.push({
      id: 'expression',
      label: getExpressionDisplayName(effectiveType)
    });
  }

  // Animation tab always last
  tabs.push({ id: 'animation', label: 'Animation' });

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

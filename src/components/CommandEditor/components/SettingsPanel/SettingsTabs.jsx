import React from 'react';
import { getExpressionDisplayName, hasOptionsPanel } from '../../utils/expressionTypeDetector';

/**
 * Tab navigation component for Settings dialog
 */
const SettingsTabs = ({ activeTab, onTabChange, expressionType }) => {
  const tabs = [
    { id: 'style', label: 'Style' },
    { id: 'animation', label: 'Animation' }
  ];

  // Only add expression options tab if this type has a dedicated panel (g2d, p2d)
  if (hasOptionsPanel(expressionType)) {
    tabs.splice(1, 0, {
      id: 'expression',
      label: getExpressionDisplayName(expressionType)
    });
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

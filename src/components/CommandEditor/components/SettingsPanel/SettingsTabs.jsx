import React from 'react';
import { getExpressionDisplayName, hasOptionsPanel } from '../../utils/expressionTypeDetector';

/**
 * Tab navigation component for Settings dialog
 */
const SettingsTabs = ({ activeTab, onTabChange, expressionType }) => {
  const tabs = [
    { id: 'style', label: 'Style' },
    {
      id: 'expression',
      label: hasOptionsPanel(expressionType)
        ? getExpressionDisplayName(expressionType)
        : 'Options',
      disabled: !hasOptionsPanel(expressionType)
    },
    { id: 'animation', label: 'Animation' }
  ];

  return (
    <div className="settings-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`settings-tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          title={tab.disabled ? 'No options available for this expression type' : ''}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default SettingsTabs;

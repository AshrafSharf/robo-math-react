import React from 'react';
import G2DOptionsPanel from '../panels/G2DOptionsPanel';
import P2DOptionsPanel from '../panels/P2DOptionsPanel';
import TableOptionsPanel from '../panels/TableOptionsPanel';

/**
 * Map of expression types to their option panel components
 *
 * Graph containers (g2d, p2d) and table have dedicated panels with unique options.
 * All other shapes use standard styling from StyleTab (color, strokeWidth, fill, etc.)
 */
const PANEL_MAP = {
  g2d: G2DOptionsPanel,
  p2d: P2DOptionsPanel,
  table: TableOptionsPanel,
};

/**
 * Expression Options Tab - Dynamically loads the appropriate options panel
 * based on the detected expression type
 */
const ExpressionOptionsTab = ({ expressionType, options, onChange, onRedraw }) => {
  const PanelComponent = PANEL_MAP[expressionType];

  if (!PanelComponent) {
    return (
      <div className="no-options">
        No additional options available for this expression type.
      </div>
    );
  }

  return (
    <div className="expression-options-tab">
      <PanelComponent options={options} onChange={onChange} onRedraw={onRedraw} />
    </div>
  );
};

export default ExpressionOptionsTab;

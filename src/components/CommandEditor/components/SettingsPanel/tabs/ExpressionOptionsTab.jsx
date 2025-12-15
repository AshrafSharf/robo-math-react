import React from 'react';
import G2DOptionsPanel from '../panels/G2DOptionsPanel';
import P2DOptionsPanel from '../panels/P2DOptionsPanel';
import LineOptionsPanel from '../panels/LineOptionsPanel';
import CircleOptionsPanel from '../panels/CircleOptionsPanel';
import VectorOptionsPanel from '../panels/VectorOptionsPanel';
import AngleOptionsPanel from '../panels/AngleOptionsPanel';
import PolygonOptionsPanel from '../panels/PolygonOptionsPanel';
import LabelOptionsPanel from '../panels/LabelOptionsPanel';
import PlotOptionsPanel from '../panels/PlotOptionsPanel';
import ArcOptionsPanel from '../panels/ArcOptionsPanel';
import EllipseOptionsPanel from '../panels/EllipseOptionsPanel';

/**
 * Map of expression types to their option panel components
 */
const PANEL_MAP = {
  g2d: G2DOptionsPanel,
  p2d: P2DOptionsPanel,
  line: LineOptionsPanel,
  segment: LineOptionsPanel,
  ray: LineOptionsPanel,
  circle: CircleOptionsPanel,
  vec: VectorOptionsPanel,
  angle: AngleOptionsPanel,
  polygon: PolygonOptionsPanel,
  label: LabelOptionsPanel,
  plot: PlotOptionsPanel,
  paraplot: PlotOptionsPanel,
  arc: ArcOptionsPanel,
  ellipse: EllipseOptionsPanel,
};

/**
 * Expression Options Tab - Dynamically loads the appropriate options panel
 * based on the detected expression type
 */
const ExpressionOptionsTab = ({ expressionType, options, onChange }) => {
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
      <PanelComponent options={options} onChange={onChange} />
    </div>
  );
};

export default ExpressionOptionsTab;

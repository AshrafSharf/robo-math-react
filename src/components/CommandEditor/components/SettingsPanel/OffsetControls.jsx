import React from 'react';

/**
 * Offset X and Y controls using number inputs
 */
const OffsetControls = ({ offsetX, offsetY, onChangeX, onChangeY }) => {
  const handleXChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onChangeX(value);
  };

  const handleYChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onChangeY(value);
  };

  return (
    <div className="label-wrap">
      <div>
        <span className="offset-label">Offset X:</span>
        <input
          type="number"
          step="0.1"
          value={offsetX}
          onChange={handleXChange}
          style={{ width: '60px', marginLeft: '5px' }}
        />
      </div>
      <div>
        <span className="offset-label">Offset Y:</span>
        <input
          type="number"
          step="0.1"
          value={offsetY}
          onChange={handleYChange}
          style={{ width: '60px', marginLeft: '5px' }}
        />
      </div>
    </div>
  );
};

export default OffsetControls;

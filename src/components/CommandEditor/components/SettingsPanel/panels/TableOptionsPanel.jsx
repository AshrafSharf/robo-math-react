import React, { useState, useEffect, useCallback } from 'react';
import { getDefaultOptions } from '../../../utils/expressionOptionsSchema';
import './TableOptionsPanel.css';

// LaTeX pattern for visual indication
const LATEX_PATTERN = /\\(frac|sqrt|sum|int|prod|lim|sin|cos|tan|log|ln|exp|alpha|beta|gamma|delta|theta|phi|pi|omega|sigma|cdot|times|div|pm|leq|geq|neq|approx|infty|rightarrow|leftarrow|Rightarrow|Leftarrow|text|mathbf|mathrm|vec|hat|bar|overline)/;

/**
 * Detect if content contains LaTeX commands
 * @param {string} content
 * @returns {boolean}
 */
function detectMath(content) {
    if (!content || typeof content !== 'string') return false;
    return LATEX_PATTERN.test(content);
}

/**
 * Create empty cells array
 * @param {number} rows
 * @param {number} cols
 * @returns {Array}
 */
function createEmptyCells(rows, cols) {
    const cells = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push({ content: '' });
        }
        cells.push(row);
    }
    return cells;
}

/**
 * Resize cells array to new dimensions, preserving existing content
 * @param {Array} existingCells
 * @param {number} newRows
 * @param {number} newCols
 * @returns {Array}
 */
function resizeCells(existingCells, newRows, newCols) {
    const cells = [];
    for (let r = 0; r < newRows; r++) {
        const row = [];
        for (let c = 0; c < newCols; c++) {
            // Preserve existing content if available
            const existing = existingCells?.[r]?.[c];
            row.push(existing || { content: '' });
        }
        cells.push(row);
    }
    return cells;
}

/**
 * Table Options Panel
 * Provides UI for configuring table dimensions and cell content
 */
const TableOptionsPanel = ({ options, onChange, onRedraw }) => {
    const defaults = getDefaultOptions('table');

    // Local state for dimensions
    const [rows, setRows] = useState(options.rows ?? defaults.rows ?? 2);
    const [cols, setCols] = useState(options.cols ?? defaults.cols ?? 2);

    // Local state for cells (2D array)
    const [cells, setCells] = useState(() => {
        if (options.cells && Array.isArray(options.cells)) {
            return options.cells;
        }
        return createEmptyCells(rows, cols);
    });

    // Update cells when dimensions change
    useEffect(() => {
        const newCells = resizeCells(cells, rows, cols);
        setCells(newCells);
        // Notify parent of all changes
        onChange('rows', rows);
        onChange('cols', cols);
        onChange('cells', newCells);
        onRedraw?.();
    }, [rows, cols]);

    // Handle row count change
    const handleRowsChange = useCallback((e) => {
        const newRows = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
        setRows(newRows);
    }, []);

    // Handle column count change
    const handleColsChange = useCallback((e) => {
        const newCols = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
        setCols(newCols);
    }, []);

    // Handle cell content change
    const handleCellChange = useCallback((rowIdx, colIdx, value) => {
        const newCells = cells.map((row, r) =>
            row.map((cell, c) =>
                r === rowIdx && c === colIdx
                    ? { ...cell, content: value }
                    : cell
            )
        );
        setCells(newCells);
        onChange('cells', newCells);
        onRedraw?.();
    }, [cells, onChange, onRedraw]);

    // Handle border style change
    const handleBorderStyleChange = useCallback((style) => {
        onChange('borderStyle', style);
        onRedraw?.();
    }, [onChange, onRedraw]);

    const currentBorderStyle = options.borderStyle ?? defaults.borderStyle ?? 'all';

    return (
        <div className="table-options-panel">
            {/* Dimensions row */}
            <div className="table-dimensions-row">
                <div className="dimension-control">
                    <label>Rows</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={rows}
                        onChange={handleRowsChange}
                        className="dimension-input"
                    />
                </div>
                <div className="dimension-control">
                    <label>Cols</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={cols}
                        onChange={handleColsChange}
                        className="dimension-input"
                    />
                </div>
            </div>

            {/* Border style row */}
            <div className="border-style-row">
                <label>Borders</label>
                <div className="border-style-buttons">
                    {['all', 'none', 'horizontal', 'vertical', 'outer'].map(style => (
                        <button
                            key={style}
                            type="button"
                            className={`border-btn ${currentBorderStyle === style ? 'active' : ''}`}
                            onClick={() => handleBorderStyleChange(style)}
                            title={style.charAt(0).toUpperCase() + style.slice(1)}
                        >
                            {style === 'all' && <BorderAllIcon />}
                            {style === 'none' && <BorderNoneIcon />}
                            {style === 'horizontal' && <BorderHorizontalIcon />}
                            {style === 'vertical' && <BorderVerticalIcon />}
                            {style === 'outer' && <BorderOuterIcon />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editable table grid */}
            <div className="table-editor">
                <div className="table-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {cells.map((row, rowIdx) =>
                        row.map((cell, colIdx) => (
                            <input
                                key={`${rowIdx}-${colIdx}`}
                                type="text"
                                value={cell.content}
                                onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                                className={`cell-input ${detectMath(cell.content) ? 'math-cell' : 'text-cell'}`}
                                placeholder={`R${rowIdx + 1}C${colIdx + 1}`}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="table-hint">
                Use LaTeX commands like <code>\frac&#123;1&#125;&#123;2&#125;</code> for math
            </div>
        </div>
    );
};

// Simple SVG icons for border styles
const BorderAllIcon = () => (
    <svg viewBox="0 0 16 16" width="14" height="14">
        <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="8" y1="1" x2="8" y2="15" stroke="currentColor" strokeWidth="1"/>
        <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1"/>
    </svg>
);

const BorderNoneIcon = () => (
    <svg viewBox="0 0 16 16" width="14" height="14">
        <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
    </svg>
);

const BorderHorizontalIcon = () => (
    <svg viewBox="0 0 16 16" width="14" height="14">
        <line x1="1" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="1" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

const BorderVerticalIcon = () => (
    <svg viewBox="0 0 16 16" width="14" height="14">
        <line x1="4" y1="1" x2="4" y2="15" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="8" y1="1" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="12" y1="1" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

const BorderOuterIcon = () => (
    <svg viewBox="0 0 16 16" width="14" height="14">
        <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
);

export default TableOptionsPanel;

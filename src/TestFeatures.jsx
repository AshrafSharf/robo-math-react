import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { RoboCanvas } from './RoboCanvas.js';
import { AnimationSpeedManager } from './mathtext/animation-speed-manager.js';
import { TextSectionManager } from './mathtext/utils/text-section-manager.js';
import { MathTextMoveEffect } from './effects/math-text-move-effect.js';
import AnnotationLayer from './components/AnnotationLayer';

function TestFeatures() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [roboCanvas, setRoboCanvas] = useState(null);
  const roboCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // Component name management
  const componentsMapRef = useRef({});
  const [componentsCount, setComponentsCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [componentName, setComponentName] = useState('');
  const [createType, setCreateType] = useState('graph');

  // Form state for creating components
  const [newName, setNewName] = useState('');
  const [newRow1, setNewRow1] = useState('0');
  const [newCol1, setNewCol1] = useState('0');
  const [newRow2, setNewRow2] = useState('16');
  const [newCol2, setNewCol2] = useState('8');
  const [newLatex, setNewLatex] = useState('\\tan(\\theta)=\\frac{\\bbox[0px]{\\sin(\\theta)}}{\\bbox[0px]{\\cos(\\theta)}}');

  // Expression plotting state
  const [expressionInput, setExpressionInput] = useState('x^2');
  const [scopeInput, setScopeInput] = useState('{}');
  const [domainMin, setDomainMin] = useState('-5');
  const [domainMax, setDomainMax] = useState('5');

  // TextSectionManager state
  const [cloneTargetX, setCloneTargetX] = useState('200');
  const [cloneTargetY, setCloneTargetY] = useState('300');
  const [cloneBboxIndex, setCloneBboxIndex] = useState('0');
  const [cloneSpacing, setCloneSpacing] = useState('20');
  const [bboxSectionCount, setBboxSectionCount] = useState(0);

  // Callback when annotation layer SVG is ready
  const handleAnnotationLayerReady = useCallback((svgElement) => {
    if (roboCanvas) {
      roboCanvas.setAnnotationLayer(svgElement);
    }
  }, [roboCanvas]);

  // Initialize RoboCanvas
  useEffect(() => {
    if (!containerRef.current || roboCanvasRef.current) return;

    const initRoboCanvas = async () => {
      try {
        const canvas = new RoboCanvas(containerRef.current, {
          canvasWidth: 1200,
          logicalWidth: 8,
          logicalHeight: 200
        });

        await canvas.init();

        roboCanvasRef.current = canvas;
        setRoboCanvas(canvas);
        console.log('TestFeatures: RoboCanvas initialized');
      } catch (error) {
        console.error('TestFeatures: RoboCanvas initialization failed', error);
        alert(`Failed to initialize RoboCanvas: ${error.message}`);
      }
    };

    initRoboCanvas();

    return () => {
      if (roboCanvasRef.current) {
        roboCanvasRef.current.destroy();
        roboCanvasRef.current = null;
        setRoboCanvas(null);
      }
    };
  }, []);

  // Create component handler
  const handleCreateComponent = () => {
    if (!newName.trim()) {
      alert('Please enter a component name');
      return;
    }

    const roboCanvas = roboCanvasRef.current;

    if (componentsMapRef.current[newName]) {
      alert(`Component "${newName}" already exists`);
      return;
    }

    const row1 = parseFloat(newRow1);
    const col1 = parseFloat(newCol1);

    if (createType === 'graph') {
      const row2 = parseFloat(newRow2);
      const col2 = parseFloat(newCol2);

      // Use bounds-based API: graphContainer(row1, col1, row2, col2, options)
      const gc = roboCanvas.diagram.graphContainer(row1, col1, row2, col2, {
        showGrid: true,
        xRange: [-10, 10],
        yRange: [-10, 10]
      });

      componentsMapRef.current[newName] = gc;
      console.log(`Created graph container: ${newName} from (${row1},${col1}) to (${row2},${col2})`);
    } else {
      // Use row-first API: mathText(text, row, col, options)
      const mathComponent = roboCanvas.mathText(newLatex, row1, col1, {
        fontSize: 32,
        stroke: '#000000'
      });

      componentsMapRef.current[newName] = mathComponent;
      console.log(`Created math text: ${newName} at (${row1},${col1})`);
    }

    setNewName('');
    setNewRow1('0');
    setNewCol1('0');
    setNewRow2('16');
    setNewCol2('8');
    setShowCreateModal(false);
    setComponentsCount(prev => prev + 1);
  };

  // Helper to check if component is a graph container (has point method)
  const isGraphContainer = (component) => {
    return component && typeof component.point === 'function';
  };

  // Helper to check if component is a MathText component
  const isMathText = (component) => {
    return component && typeof component.show === 'function' && !isGraphContainer(component);
  };

  // Test button handlers
  const handleWriteMathText = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isMathText(component)) {
      alert(`"${componentName}" is not a MathText component. Create a text first.`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.writeMathText(component);
  };

  const handleTestPoint = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isGraphContainer(component)) {
      alert(`"${componentName}" is not a graph container. Create a graph first.`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.point(component, {x: 0, y: 0}, 'red', { radius: 6 });
  };

  const handleTestLine = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isGraphContainer(component)) {
      alert(`"${componentName}" is not a graph container. Create a graph first.`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.line(component, {x: -5, y: -5}, {x: 5, y: 5}, 'blue', { strokeWidth: 2 });
  };

  const handleTestPlot = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isGraphContainer(component)) {
      alert(`"${componentName}" is not a graph container. Create a graph first.`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    // Plot y = x^2 using function callback
    roboCanvasRef.current.diagram.plotFunction(component, (x) => x * x, -10, 10, 'purple', { strokeWidth: 2 });
  };

  const handleTestCircle = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isGraphContainer(component)) {
      alert(`"${componentName}" is not a graph container. Create a graph first.`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.circle(component, {x: 0, y: 0}, 3, 'orange', { strokeWidth: 2 });
  };

  const handleTestVector = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isGraphContainer(component)) {
      alert(`"${componentName}" is not a graph container. Create a graph first.`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.vector(component, {x: 0, y: 0}, {x: 4, y: 3}, 'green', { strokeWidth: 2 });
  };

  const handleTestPlotExpression = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isGraphContainer(component)) {
      alert(`"${componentName}" is not a graph container. Create a graph first.`);
      return;
    }

    let scope = {};
    try {
      scope = JSON.parse(scopeInput);
    } catch (e) {
      alert(`Invalid scope JSON: ${e.message}`);
      return;
    }

    await roboCanvasRef.current.scrollToComponent(component);
    roboCanvasRef.current.diagram.plot(
      component,
      expressionInput,
      parseFloat(domainMin),
      parseFloat(domainMax),
      scope,
      'purple',
      { strokeWidth: 2 }
    );
  };

  const handleClearAll = () => {
    roboCanvasRef.current.clearAll();
    componentsMapRef.current = {};
    setComponentsCount(0);
  };

  const handleToggleAnimated = (e) => {
    const newAnimated = e.target.checked;
    setIsAnimated(newAnimated);
    roboCanvasRef.current.clearAll();
    // Single Diagram2d - no mode switching needed
  };

  // Handle speed change
  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    AnimationSpeedManager.setSpeedMultiplier(newSpeed);
  };

  // TextSectionManager handlers
  const transformCopyRef = useRef(null);

  const handleDetectBbox = () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isMathText(component)) {
      alert(`"${componentName}" is not a MathText component. Create a text with \\bbox first.`);
      return;
    }

    // Create TextSectionManager instance and cache it
    transformCopyRef.current = new TextSectionManager(component, containerRef.current);
    const sections = transformCopyRef.current.extractBBoxSections();
    setBboxSectionCount(sections.length);

    if (sections.length === 0) {
      alert('No bbox sections found. Use \\bbox[0px]{content} in your LaTeX.');
    } else {
      console.log(`Found ${sections.length} bbox section(s):`, sections);
      alert(`Found ${sections.length} bbox section(s). Use Clone or Clone All to copy them.`);
    }
  };

  const handleCloneBbox = () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isMathText(component)) {
      alert(`"${componentName}" is not a MathText component.`);
      return;
    }

    // Create or reuse TextSectionManager instance
    if (!transformCopyRef.current || transformCopyRef.current.mathTextComponent !== component) {
      transformCopyRef.current = new TextSectionManager(component, containerRef.current);
    }

    const x = parseFloat(cloneTargetX);
    const y = parseFloat(cloneTargetY);
    const index = parseInt(cloneBboxIndex);

    const clonedComponent = transformCopyRef.current.createCloneAt(index, x, y);

    if (clonedComponent) {
      // Show the cloned component (it's hidden by default)
      clonedComponent.show();
      console.log(`Cloned bbox section ${index} to (${x}, ${y})`);
    } else {
      alert(`Failed to clone bbox section ${index}. Check console for details.`);
    }
  };

  const handleCloneAllBbox = () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isMathText(component)) {
      alert(`"${componentName}" is not a MathText component.`);
      return;
    }

    // Create or reuse TextSectionManager instance
    if (!transformCopyRef.current || transformCopyRef.current.mathTextComponent !== component) {
      transformCopyRef.current = new TextSectionManager(component, containerRef.current);
    }

    const x = parseFloat(cloneTargetX);
    const y = parseFloat(cloneTargetY);
    const spacing = parseFloat(cloneSpacing);

    const clonedComponents = transformCopyRef.current.createAllClonesAt(x, y, {
      horizontalSpacing: spacing
    });

    // Show all cloned components
    clonedComponents.forEach(comp => comp.show());
    console.log(`Cloned ${clonedComponents.length} bbox sections starting at (${x}, ${y}) with spacing ${spacing}`);
  };

  // Store active effects for cleanup
  const effectsRef = useRef([]);

  const handleClearClones = () => {
    // Clear TextSectionManager clones
    if (transformCopyRef.current) {
      transformCopyRef.current.clearClones();
    }

    // Clear effect clones
    effectsRef.current.forEach(effect => {
      effect.stop();
      effect.remove();
    });
    effectsRef.current = [];

    console.log('Cleared all cloned components and effects');
  };

  const handleDrawRects = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component || !isMathText(component)) return;

    const index = parseInt(cloneBboxIndex);
    await roboCanvasRef.current.staticDiagram.annotateSectionRect(component, index, {
      stroke: '#ff0000',
      strokeWidth: 2,
      padding: 3
    });
  };

  const handleAnimateRect = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component || !isMathText(component)) return;

    const index = parseInt(cloneBboxIndex);

    // Use animated diagram - pen traced
    roboCanvasRef.current.animatedDiagram.setAnimateMode(true);
    await roboCanvasRef.current.animatedDiagram.annotateSectionRect(component, index, {
      stroke: '#ff0000',
      strokeWidth: 2,
      padding: 3
    });
  };

  const handleClearRects = () => {
    // Diagram tracks shapes - use clearAll or specific removal if needed
    console.log('Use diagram.clearAll() to clear shapes');
  };

  const handleAnimateClone = async () => {
    const component = componentsMapRef.current[componentName];
    if (!component) {
      alert(`Component "${componentName}" not found`);
      return;
    }
    if (!isMathText(component)) {
      alert(`"${componentName}" is not a MathText component.`);
      return;
    }

    const x = parseFloat(cloneTargetX);
    const y = parseFloat(cloneTargetY);
    const index = parseInt(cloneBboxIndex);

    console.log(`Animating bbox section ${index} to (${x}, ${y}) using MathTextMoveEffect`);

    // Create the effect
    const effect = new MathTextMoveEffect(
      component,
      index,
      x,
      y,
      containerRef.current,
      { duration: 0.8 }
    );

    // Track effect for cleanup
    effectsRef.current.push(effect);

    // Play the effect (returns a Promise)
    await effect.play();

    console.log(`Animation complete for bbox section ${index}`);
  };

  return (
    <div id="robo" className="robo-compass-div">
      {/* Top Header */}
      <div className="robo-compass-header navbar navbar-inverse">
        <div className="navbar-header robo-logo">
          <a className="navbar-brand" href="/">
            <h3 style={{ margin: 0, color: 'white', display: 'inline-block' }}>Robo Math - Test Features</h3>
          </a>
        </div>
      </div>

      {/* Component Management Controls */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button onClick={() => setShowCreateModal(true)} style={{
          padding: '4px 10px',
          border: '1px solid #dc3545',
          backgroundColor: '#dc3545',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          + New
        </button>

        <select
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '12px',
            minWidth: '100px'
          }}
        >
          <option value="">-- Select --</option>
          {Object.keys(componentsMapRef.current).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <button onClick={handleWriteMathText} style={{
          padding: '4px 10px',
          border: '1px solid #007bff',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Write
        </button>
        <button onClick={handleTestPoint} style={{
          padding: '4px 10px',
          border: '1px solid #28a745',
          backgroundColor: '#28a745',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Point
        </button>
        <button onClick={handleTestLine} style={{
          padding: '4px 10px',
          border: '1px solid #17a2b8',
          backgroundColor: '#17a2b8',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Line
        </button>
        <button onClick={handleTestCircle} style={{
          padding: '4px 10px',
          border: '1px solid #fd7e14',
          backgroundColor: '#fd7e14',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Circle
        </button>
        <button onClick={handleTestVector} style={{
          padding: '4px 10px',
          border: '1px solid #20c997',
          backgroundColor: '#20c997',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Vector
        </button>
        <button onClick={handleTestPlot} style={{
          padding: '4px 10px',
          border: '1px solid #6f42c1',
          backgroundColor: '#6f42c1',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Plot
        </button>

        {/* Expression Plot Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
          <input
            type="text"
            value={expressionInput}
            onChange={(e) => setExpressionInput(e.target.value)}
            placeholder="e.g., x^2, sin(x)"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px',
              width: '100px',
              fontFamily: 'monospace'
            }}
          />
          <input
            type="text"
            value={domainMin}
            onChange={(e) => setDomainMin(e.target.value)}
            placeholder="min"
            style={{
              padding: '4px 4px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px',
              width: '35px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
          />
          <span style={{ fontSize: '12px' }}>to</span>
          <input
            type="text"
            value={domainMax}
            onChange={(e) => setDomainMax(e.target.value)}
            placeholder="max"
            style={{
              padding: '4px 4px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px',
              width: '35px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
          />
          <input
            type="text"
            value={scopeInput}
            onChange={(e) => setScopeInput(e.target.value)}
            placeholder="{a:1}"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px',
              width: '60px',
              fontFamily: 'monospace'
            }}
          />
          <button onClick={handleTestPlotExpression} style={{
            padding: '4px 10px',
            border: '1px solid #e83e8c',
            backgroundColor: '#e83e8c',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            Plot Expr
          </button>
        </div>

        {/* TextSectionManager Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
          <button onClick={handleDetectBbox} style={{
            padding: '4px 8px',
            border: '1px solid #795548',
            backgroundColor: '#795548',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            Detect
          </button>
          <span style={{ fontSize: '11px', color: '#666' }}>
            ({bboxSectionCount})
          </span>
          <input
            type="text"
            value={cloneTargetX}
            onChange={(e) => setCloneTargetX(e.target.value)}
            placeholder="X"
            title="Target X position"
            style={{
              padding: '4px 4px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '11px',
              width: '40px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
          />
          <input
            type="text"
            value={cloneTargetY}
            onChange={(e) => setCloneTargetY(e.target.value)}
            placeholder="Y"
            title="Target Y position"
            style={{
              padding: '4px 4px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '11px',
              width: '40px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
          />
          <select
            value={cloneBboxIndex}
            onChange={(e) => setCloneBboxIndex(e.target.value)}
            title="BBox section index"
            style={{
              padding: '4px 4px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '11px',
              width: '45px'
            }}
          >
            {Array.from({ length: Math.max(bboxSectionCount, 1) }, (_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <button onClick={handleCloneBbox} style={{
            padding: '4px 8px',
            border: '1px solid #009688',
            backgroundColor: '#009688',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            Clone
          </button>
          <button onClick={handleAnimateClone} style={{
            padding: '4px 8px',
            border: '1px solid #9c27b0',
            backgroundColor: '#9c27b0',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            Animate
          </button>
          <input
            type="text"
            value={cloneSpacing}
            onChange={(e) => setCloneSpacing(e.target.value)}
            placeholder="Gap"
            title="Spacing between clones"
            style={{
              padding: '4px 4px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '11px',
              width: '35px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
          />
          <button onClick={handleCloneAllBbox} style={{
            padding: '4px 8px',
            border: '1px solid #00796b',
            backgroundColor: '#00796b',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            Clone All
          </button>
          <button onClick={handleClearClones} style={{
            padding: '4px 8px',
            border: '1px solid #f44336',
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            Clear
          </button>
          <button onClick={handleDrawRects} style={{
            padding: '4px 8px',
            border: '1px solid #ff9800',
            backgroundColor: '#ff9800',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            Rect
          </button>
          <button onClick={handleAnimateRect} style={{
            padding: '4px 8px',
            border: '1px solid #e91e63',
            backgroundColor: '#e91e63',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            AnimateRect
          </button>
          <button onClick={handleClearRects} style={{
            padding: '4px 8px',
            border: '1px solid #607d8b',
            backgroundColor: '#607d8b',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            ✕
          </button>
        </div>

        <button onClick={handleClearAll} style={{
          padding: '4px 10px',
          border: '1px solid #6c757d',
          backgroundColor: '#6c757d',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}>
          Clear
        </button>
        {/* Speed Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Speed:</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={speed}
            onChange={handleSpeedChange}
            style={{ width: '100px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px', fontFamily: 'monospace', minWidth: '40px' }}>
            {speed.toFixed(1)}x
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '20px' }}>
          <span style={{ fontSize: '14px' }}>Static</span>
          <input
            type="checkbox"
            checked={isAnimated}
            onChange={handleToggleAnimated}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px' }}>Animated</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="robo-shell-main" style={{ overflow: 'auto' }}>
        <div
          ref={containerRef}
          className="robo-shell-main-playsurface"
        >
          <AnnotationLayer onLayerReady={handleAnnotationLayerReady} />
        </div>
      </div>

      {/* Create Component Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Create Component</h2>

            {/* Type Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                Component Type:
              </label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    value="graph"
                    checked={createType === 'graph'}
                    onChange={(e) => setCreateType(e.target.value)}
                  />
                  Graph Container
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    value="text"
                    checked={createType === 'text'}
                    onChange={(e) => setCreateType(e.target.value)}
                  />
                  MathText
                </label>
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Name:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., graph1, text1"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Position - Start point (row1, col1) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Row 1 (top):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newRow1}
                  onChange={(e) => setNewRow1(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Col 1 (left):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newCol1}
                  onChange={(e) => setNewCol1(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Graph-specific options - End point (row2, col2) */}
            {createType === 'graph' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Row 2 (bottom):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRow2}
                    onChange={(e) => setNewRow2(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Col 2 (right):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCol2}
                    onChange={(e) => setNewCol2(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* MathText-specific options */}
            {createType === 'text' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  LaTeX Content:
                </label>
                <textarea
                  value={newLatex}
                  onChange={(e) => setNewLatex(e.target.value)}
                  placeholder="Enter LaTeX code, e.g., x^2 + 2x + 1"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #6c757d',
                  backgroundColor: 'white',
                  color: '#6c757d',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateComponent}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #6f42c1',
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestFeatures;

import { PluginInitializer } from './src/plugins/plugin-initializer.js';
import { MathTextComponent } from './src/mathtext/components/math-text-component.js';
import { ComponentState } from './src/models/component-state.js';
import { IdUtil } from './src/shared/utils/id-util.js';
import { WriteEffect } from './src/mathtext/effects/write-effect.js';
import { PenTracerImpl } from './src/pen/pen-tracer-impl.js';
import { AnimationSpeedManager } from './src/mathtext/animation-speed-manager.js';

let leftContainerDOM = null;
let rightContainerDOM = null;
let leftMathComponent = null;
let rightMathComponent = null;
let leftDebounceTimer = null;
let rightDebounceTimer = null;
let penTracer = null;

// Set up resizable panels
function initializeResizer() {
  const resizer = document.getElementById('resizer');
  const leftPanel = document.getElementById('left-panel');
  const container = document.querySelector('.container');

  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = e.clientX - containerRect.left;
    const containerWidth = containerRect.width;

    // Limit to 20%-80% range
    const minWidth = containerWidth * 0.2;
    const maxWidth = containerWidth * 0.8;

    if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
      const percentage = (newLeftWidth / containerWidth) * 100;
      leftPanel.style.flex = `0 0 ${percentage}%`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

PluginInitializer.initialize().then(() => {
  // Initialize pen tracer
  penTracer = new PenTracerImpl(document.body);
  penTracer.init();
  console.log("Pen tracer initialized");

  // Initialize resizable divider
  initializeResizer();

  // Create left panel container
  const leftPreview = document.querySelector('#preview-left .math-content');
  leftContainerDOM = leftPreview;

  // Create right panel container
  const rightPreview = document.querySelector('#preview-right .math-content');
  rightContainerDOM = rightPreview;

  // Set up left input
  const leftInput = document.getElementById('latex-input-left');
  renderLatex(leftInput.value, leftContainerDOM, true); // true = left panel

  leftInput.addEventListener('input', (e) => {
    clearTimeout(leftDebounceTimer);
    leftDebounceTimer = setTimeout(() => {
      renderLatex(e.target.value, leftContainerDOM, true);
    }, 500);
  });

  // Set up right input
  const rightInput = document.getElementById('latex-input-right');
  renderLatex(rightInput.value, rightContainerDOM, false); // false = right panel

  rightInput.addEventListener('input', (e) => {
    clearTimeout(rightDebounceTimer);
    rightDebounceTimer = setTimeout(() => {
      renderLatex(e.target.value, rightContainerDOM, false);
    }, 500);
  });

  // Set up write with pen button
  const writePenBtn = document.getElementById('write-pen-btn');
  writePenBtn.addEventListener('click', writeWithPen);

  // Set up bbox detection button
  const detectBboxBtn = document.getElementById('detect-bbox-btn');
  detectBboxBtn.addEventListener('click', () => {
    detectAndHideBBoxContent(rightMathComponent);
  });

  // Set up write only bbox button
  const writeOnlyBtn = document.getElementById('write-only-btn');
  writeOnlyBtn.addEventListener('click', writeOnlyBBox);

  // Set up write without bbox button
  const writeWithoutBtn = document.getElementById('write-without-btn');
  writeWithoutBtn.addEventListener('click', writeWithoutBBox);

  // Set up speed sliders
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');
  const speedSliderRight = document.getElementById('speed-slider-right');
  const speedValueRight = document.getElementById('speed-value-right');

  function updateSpeed(value) {
    const speed = parseFloat(value);
    AnimationSpeedManager.setSpeedMultiplier(speed);
    const displayValue = speed.toFixed(1) + 'x';
    speedValue.textContent = displayValue;
    speedValueRight.textContent = displayValue;
    // Sync both sliders
    speedSlider.value = speed;
    speedSliderRight.value = speed;
  }

  speedSlider.addEventListener('input', (e) => {
    updateSpeed(e.target.value);
  });

  speedSliderRight.addEventListener('input', (e) => {
    updateSpeed(e.target.value);
  });
}).catch(err => {
  console.error("Error initializing:", err);
});

function renderLatex(latexContent, containerDOM, isLeftPanel = false) {
  if (!containerDOM) return;

  try {
    containerDOM.innerHTML = '';

    if (!latexContent || latexContent.trim() === '') return;

    const componentState = Object.assign(new ComponentState(), {
      componentId: `math-text-${IdUtil.getID()}`,
      content: latexContent,
      left: 10,
      top: 10
    });

    const mathComponent = new MathTextComponent(componentState, containerDOM, {
      fontSize: 40,
      stroke: '#000000'
    });
    mathComponent.show();

    // Store reference for pen writing
    if (isLeftPanel) {
      leftMathComponent = mathComponent;
    } else {
      rightMathComponent = mathComponent;
    }
  } catch (err) {
    console.error("Error rendering:", err);
  }
}

function writeWithPen() {
  if (!leftMathComponent) {
    console.warn('No math text to write');
    return;
  }

  console.log('Starting pen write animation...');
  const writeEffect = new WriteEffect(leftMathComponent);
  writeEffect.play();
}

function writeOnlyBBox() {
  if (!rightMathComponent) {
    console.warn('No math text available');
    return;
  }

  console.log('\n=== WRITE ONLY BBOX ===');
  console.log('Starting write only animation...');

  rightMathComponent.writeOnlyBBox().play();
}

function writeWithoutBBox() {
  if (!rightMathComponent) {
    console.warn('No math text available');
    return;
  }

  console.log('\n=== WRITE WITHOUT BBOX ===');
  console.log('Starting write without animation...');

  rightMathComponent.writeWithoutBBox().play();
}

function detectAndHideBBoxContent(mathComponent) {
  if (!mathComponent || !mathComponent.containerDOM) return;

  console.log('\n=== BBOX DETECTION & HIDING DEMO ===');

  // Find the SVG element
  const svg = mathComponent.containerDOM.querySelector('svg');
  if (!svg) {
    console.error('No SVG found');
    return;
  }

  // Find all mpadded elements (created by \bbox)
  const mpaddedElements = svg.querySelectorAll('g[meta="mpadded"]');
  console.log(`Found ${mpaddedElements.length} bbox regions (meta="mpadded")`);

  if (mpaddedElements.length === 0) {
    console.warn('No \\bbox[0px]{} regions found in the LaTeX!\nTry: \\bbox[0px]{a + b} = c');
    return;
  }

  mpaddedElements.forEach((mpaddedGroup, index) => {
    console.log(`\n--- Processing bbox region ${index + 1} ---`);

    // Get bounds of the mpadded group
    const bbox = mpaddedGroup.getBBox();
    const ctm = mpaddedGroup.getCTM();

    if (!ctm) {
      console.error('Could not get CTM for mpadded group');
      return;
    }

    // Transform bounds to CTM coordinates
    const x1 = bbox.x * ctm.a + bbox.y * ctm.c + ctm.e;
    const y1 = bbox.x * ctm.b + bbox.y * ctm.d + ctm.f;
    const x2 = (bbox.x + bbox.width) * ctm.a + (bbox.y + bbox.height) * ctm.c + ctm.e;
    const y2 = (bbox.x + bbox.width) * ctm.b + (bbox.y + bbox.height) * ctm.d + ctm.f;

    // Normalize bounds (ensure min < max for both axes)
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    console.log('BBox bounds in CTM (normalized):', { minX, minY, maxX, maxY });

    // Find all paths with nodepath attributes in the entire SVG
    const allPaths = svg.querySelectorAll('path[nodepath]');
    console.log(`Total paths with nodepath: ${allPaths.length}`);

    let hiddenCount = 0;

    // Check each path to see if it's within the bbox bounds
    allPaths.forEach((path) => {
      const pathBBox = path.getBBox();
      const pathCTM = path.getCTM();

      if (!pathCTM) return;

      // Transform path bounds to CTM coordinates
      const px1 = pathBBox.x * pathCTM.a + pathBBox.y * pathCTM.c + pathCTM.e;
      const py1 = pathBBox.x * pathCTM.b + pathBBox.y * pathCTM.d + pathCTM.f;
      const px2 = (pathBBox.x + pathBBox.width) * pathCTM.a + (pathBBox.y + pathBBox.height) * pathCTM.c + pathCTM.e;
      const py2 = (pathBBox.x + pathBBox.width) * pathCTM.b + (pathBBox.y + pathBBox.height) * pathCTM.d + pathCTM.f;

      // Normalize path bounds
      const pathMinX = Math.min(px1, px2);
      const pathMaxX = Math.max(px1, px2);
      const pathMinY = Math.min(py1, py2);
      const pathMaxY = Math.max(py1, py2);

      // Check if path is within bbox bounds (with some tolerance)
      const tolerance = 5;
      const isInside =
        pathMinX >= (minX - tolerance) &&
        pathMaxX <= (maxX + tolerance) &&
        pathMinY >= (minY - tolerance) &&
        pathMaxY <= (maxY + tolerance);

      if (isInside) {
        const nodepath = path.getAttribute('nodepath');
        console.log(`  ✓ Hiding path with nodepath="${nodepath}"`);

        // Hide the path using stroke-dasharray
        path.setAttribute('stroke-dasharray', '0,10000');
        path.style.strokeDasharray = '0,10000';
        path.style.opacity = '0';
        path.style.visibility = 'hidden';

        hiddenCount++;
      }
    });

    console.log(`Hidden ${hiddenCount} paths in bbox region ${index + 1}`);
  });

  console.log(`✓ Successfully hidden content in ${mpaddedElements.length} \\bbox region(s)!`);
}

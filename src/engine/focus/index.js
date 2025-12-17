/**
 * Expression Focus Module
 *
 * Standalone module for displaying visual indicators on focused shapes
 * in the command editor.
 *
 * Usage:
 *   import { ExpressionFocusManager, FOCUS_EVENT, BLUR_EVENT } from './engine/focus';
 *
 *   // Start listening
 *   const focusManager = new ExpressionFocusManager();
 *   focusManager.start();
 *
 *   // Dispatch events when input focus changes
 *   document.dispatchEvent(new CustomEvent(FOCUS_EVENT, {
 *     detail: { shape, annotationLayer, canvasSection, scene3d }
 *   }));
 *
 *   document.dispatchEvent(new CustomEvent(BLUR_EVENT));
 *
 *   // Cleanup
 *   focusManager.stop();
 */
export { ExpressionFocusManager, FOCUS_EVENT, BLUR_EVENT } from './ExpressionFocusManager.js';
export { FocusIndicator2D } from './FocusIndicator2D.js';
export { FocusIndicator3D } from './FocusIndicator3D.js';
export { ShapeAnchorAdapter } from './ShapeAnchorAdapter.js';

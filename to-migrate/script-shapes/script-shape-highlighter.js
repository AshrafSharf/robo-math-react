export class ScriptShapeHighlighter {
  constructor(baseScriptShape, objectHighlightLayer) {
    this.baseScriptShape = baseScriptShape;
    this.objectHighlightLayer = objectHighlightLayer;
    this.rectObj = null;
    this.color = null;
    this.diagramElementVarName = null;
    this.assignmentVariableName = null;
    this.ownerVariableName = null;
    this.onModelUpdate = null;
  }

  highlight(color) {
    this.color = color;
    this.highlightObject();
  }

  animateHighlight(color, callback, duration = 1.5) {
    this.color = color;
    try {
      this.highlight(color);
      callback();
    }
    catch (e) {
      callback();
    }
  }

  removeHighLight() {
    if (this.rectObj) {
      this.rectObj.remove();
      this.rectObj = null;
    }
  }

  highlightObject() {
    this.removeHighLight();
    const bounds2 = this.baseScriptShape.getScreenBounds().dilated(10); // expand the bounds a bit

    // Create rect element directly on the highlight layer
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", bounds2.x);
    rect.setAttribute("y", bounds2.y);
    rect.setAttribute("width", bounds2.width);
    rect.setAttribute("height", bounds2.height);
    rect.style.fill = 'transparent';
    rect.style.stroke = this.color;
    rect.style.strokeWidth = "2px";
    rect.classList.add('marchingant');

    if (this.objectHighlightLayer && this.objectHighlightLayer.node) {
      this.objectHighlightLayer.node.appendChild(rect);
      this.rectObj = rect;
    }
  }

  refreshModel() {
    if (this.onModelUpdate) {
      this.onModelUpdate();
    }
  }

  isDirty() {
    return false;
  }

  show() {
    // Empty - can be implemented if needed
  }

  hide() {
    // Empty - can be implemented if needed
  }

  updateDirtyModel() {
    // Empty - can be implemented if needed
  }
}
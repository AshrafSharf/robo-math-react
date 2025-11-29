export class ObjectHighlightModel {
  constructor() {
    this.assignmentVariableName = null;
    this.ownerVariableName = null;
    this.onModelUpdate = null;
  }

  highlight(color) {

  }

  animateHighlight(color, callback, duration = 1.5) {

  }

  removeHighLight() {

  }

  refreshModel() {
    if (this.onModelUpdate) {
      this.onModelUpdate();
    }
  }

  isDirty() {
    return false;
  }

  updateDirtyModel() {

  }

  show() {

  }

  hide() {

  }
}
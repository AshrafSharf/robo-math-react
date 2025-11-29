import { Point } from "./geom/Point.js";

export class PenCoordinateTracer {
  updatePenCoordinates(screenPoint) {
    throw new Error("updatePenCoordinates must be implemented");
  }
  
  getPenOffsetRestPoint(x, y) {
    throw new Error("getPenOffsetRestPoint must be implemented");
  }
  
  getCurrentPenPosition() {
    throw new Error("getCurrentPenPosition must be implemented");
  }
  
  getScaleFactor() {
    throw new Error("getScaleFactor must be implemented");
  }
}
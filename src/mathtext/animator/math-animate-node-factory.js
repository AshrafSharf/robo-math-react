import { MathNodeGraph } from './math-node-graph.js';

export class MathAnimateNodeFactory {
  static getAnimatorNode(id, cheerioElement, strokeColor) {
    const type = cheerioElement.attr('meta');
    return new MathNodeGraph(id, type, cheerioElement, this, strokeColor);
  }
}
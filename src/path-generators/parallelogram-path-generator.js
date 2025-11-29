import { BasePathGenerator } from './base-path-generator.js';
import { parallelogramFourthVertex } from '../utils/vector-math-2d.js';

/**
 * Path generator specifically for parallelograms
 * Takes 3 points (origin, v1End, v2End) and calculates the fourth
 */
export class ParallelogramPathGenerator extends BasePathGenerator {
  /**
   * Generate SVG path for a parallelogram from 3 points
   * @param {Array<number>|Object} input - Either array of 6 coords or object with points
   * @returns {string} SVG path string
   */
  generate(input) {
    let origin, v1End, v2End;
    
    // Handle both array and object input
    if (Array.isArray(input)) {
      if (input.length !== 6) {
        throw new Error('ParallelogramPathGenerator requires exactly 3 points (6 coordinates)');
      }
      origin = { x: input[0], y: input[1] };
      v1End = { x: input[2], y: input[3] };
      v2End = { x: input[4], y: input[5] };
    } else if (input && typeof input === 'object') {
      origin = input.origin || { x: 0, y: 0 };
      v1End = input.v1End || { x: 1, y: 0 };
      v2End = input.v2End || { x: 0, y: 1 };
    } else {
      throw new Error('Invalid input to ParallelogramPathGenerator');
    }
    
    // Calculate fourth vertex
    const fourthVertex = parallelogramFourthVertex(origin, v1End, v2End);
    
    // Create path
    const path = [
      `M ${origin.x} ${origin.y}`,
      `L ${v1End.x} ${v1End.y}`,
      `L ${fourthVertex.x} ${fourthVertex.y}`,
      `L ${v2End.x} ${v2End.y}`,
      'Z' // Close path
    ];
    
    return path.join(' ');
  }
  
  /**
   * Generate path with dashed edges
   * @param {Array<number>|Object} input - Input coordinates
   * @param {string} dashPattern - Dash pattern (e.g., '5,3')
   * @returns {Object} Object with main path and edge paths
   */
  generateWithDashedEdges(input, dashPattern = '5,3') {
    let origin, v1End, v2End;
    
    // Parse input
    if (Array.isArray(input)) {
      origin = { x: input[0], y: input[1] };
      v1End = { x: input[2], y: input[3] };
      v2End = { x: input[4], y: input[5] };
    } else {
      origin = input.origin;
      v1End = input.v1End;
      v2End = input.v2End;
    }
    
    const fourthVertex = parallelogramFourthVertex(origin, v1End, v2End);
    
    // Main filled path
    const mainPath = this.generate(input);
    
    // Individual edge paths for dashed rendering
    const edges = [
      `M ${origin.x} ${origin.y} L ${v1End.x} ${v1End.y}`,
      `M ${v1End.x} ${v1End.y} L ${fourthVertex.x} ${fourthVertex.y}`,
      `M ${fourthVertex.x} ${fourthVertex.y} L ${v2End.x} ${v2End.y}`,
      `M ${v2End.x} ${v2End.y} L ${origin.x} ${origin.y}`
    ];
    
    return {
      mainPath,
      edges,
      dashPattern
    };
  }
  
  /**
   * Get the vertices of the parallelogram
   * @param {Array<number>|Object} input - Input coordinates
   * @returns {Array<Object>} Array of 4 vertices
   */
  getVertices(input) {
    let origin, v1End, v2End;
    
    if (Array.isArray(input)) {
      origin = { x: input[0], y: input[1] };
      v1End = { x: input[2], y: input[3] };
      v2End = { x: input[4], y: input[5] };
    } else {
      origin = input.origin;
      v1End = input.v1End;
      v2End = input.v2End;
    }
    
    const fourthVertex = parallelogramFourthVertex(origin, v1End, v2End);
    
    return [origin, v1End, fourthVertex, v2End];
  }
  
  /**
   * Generate construction lines showing how the parallelogram is formed
   * @param {Array<number>|Object} input - Input coordinates
   * @returns {Object} Object with vector paths and parallelogram path
   */
  generateConstruction(input) {
    let origin, v1End, v2End;
    
    if (Array.isArray(input)) {
      origin = { x: input[0], y: input[1] };
      v1End = { x: input[2], y: input[3] };
      v2End = { x: input[4], y: input[5] };
    } else {
      origin = input.origin;
      v1End = input.v1End;
      v2End = input.v2End;
    }
    
    const fourthVertex = parallelogramFourthVertex(origin, v1End, v2End);
    
    return {
      // Original vectors
      vector1: `M ${origin.x} ${origin.y} L ${v1End.x} ${v1End.y}`,
      vector2: `M ${origin.x} ${origin.y} L ${v2End.x} ${v2End.y}`,
      // Translated vectors (dashed)
      vector1Translated: `M ${v2End.x} ${v2End.y} L ${fourthVertex.x} ${fourthVertex.y}`,
      vector2Translated: `M ${v1End.x} ${v1End.y} L ${fourthVertex.x} ${fourthVertex.y}`,
      // Full parallelogram
      parallelogram: this.generate(input)
    };
  }
}
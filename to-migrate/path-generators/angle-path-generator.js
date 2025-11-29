export class AnglePathGenerator {
  /**
   * Generate SVG path for an angle arc/sector
   * @param {Object} vertex - The vertex point {x, y}
   * @param {Object} startPoint - Start point of the angle {x, y}
   * @param {Object} endPoint - End point of the angle {x, y}
   * @param {number} radius - Radius of the angle arc
   * @param {boolean} fillSector - If true, creates a filled sector; if false, just an arc
   * @param {Object} options - Additional options {reflex, reverseFirst, reverseSecond}
   * @returns {string} SVG path string
   */
  static generate(vertex, startPoint, endPoint, radius, fillSector = true, options = {}) {
    const { reflex = false, reverseFirst = false, reverseSecond = false, isRightAngle = false } = options;
    
    // For right angle, generate a square indicator (no fill)
    if (isRightAngle) {
      return this.generateRightAngle(vertex, startPoint, endPoint, radius);
    }
    
    let p1 = { ...startPoint };
    let p2 = { ...endPoint };
    
    // Handle exterior angles by reversing vectors
    if (reverseFirst) {
      // Reverse first vector (extend backward from vertex)
      const dx = p1.x - vertex.x;
      const dy = p1.y - vertex.y;
      p1 = { x: vertex.x - dx, y: vertex.y - dy };
    }
    
    if (reverseSecond) {
      // Reverse second vector (extend backward from vertex)
      const dx = p2.x - vertex.x;
      const dy = p2.y - vertex.y;
      p2 = { x: vertex.x - dx, y: vertex.y - dy };
    }
    
    // Calculate angles from vertex to points
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    
    // Calculate the sweep angle (from angle1 to angle2)
    let sweepAngle = angle2 - angle1;
    
    // Normalize sweep angle to [0, 2π]
    while (sweepAngle < 0) sweepAngle += 2 * Math.PI;
    while (sweepAngle > 2 * Math.PI) sweepAngle -= 2 * Math.PI;
    
    // For reflex angle, we want the larger angle (> 180°)
    if (reflex) {
      if (sweepAngle < Math.PI) {
        // Current sweep is < 180°, so take the complement
        sweepAngle = 2 * Math.PI - sweepAngle;
        // Swap start and end to go the other way
        [p1, p2] = [p2, p1];
      }
    } else {
      // For non-reflex angles, we want the smaller angle (< 180°)
      if (sweepAngle > Math.PI) {
        // Current sweep is > 180°, so take the complement
        sweepAngle = 2 * Math.PI - sweepAngle;
        // Swap start and end to go the shorter way
        [p1, p2] = [p2, p1];
      }
    }
    
    // Recalculate angles after potential swap
    const finalAngle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const finalAngle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    
    // Calculate arc start and end points on the circle
    const arcStart = {
      x: vertex.x + radius * Math.cos(finalAngle1),
      y: vertex.y + radius * Math.sin(finalAngle1)
    };
    
    const arcEnd = {
      x: vertex.x + radius * Math.cos(finalAngle2),
      y: vertex.y + radius * Math.sin(finalAngle2)
    };
    
    // Recalculate sweep for the arc
    let arcSweep = finalAngle2 - finalAngle1;
    while (arcSweep < 0) arcSweep += 2 * Math.PI;
    while (arcSweep > 2 * Math.PI) arcSweep -= 2 * Math.PI;
    
    // Determine large arc flag (1 if sweep > 180 degrees)
    const largeArcFlag = arcSweep > Math.PI ? 1 : 0;
    
    // Sweep direction: 1 for positive (counterclockwise in standard coords)
    const sweepFlag = 1;
    
    let path;
    if (fillSector) {
      // Create a filled sector
      path = `M${vertex.x},${vertex.y} `;
      path += `L${arcStart.x},${arcStart.y} `;
      path += `A${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${arcEnd.x},${arcEnd.y} `;
      path += `Z`; // Close the path
    } else {
      // Just an arc
      path = `M${arcStart.x},${arcStart.y} `;
      path += `A${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${arcEnd.x},${arcEnd.y}`;
    }
    
    return path;
  }
  
  /**
   * Calculate the center point of an angle arc (for label positioning)
   * @param {Object} vertex - The vertex point {x, y}
   * @param {Object} startPoint - Start point of the angle {x, y}
   * @param {Object} endPoint - End point of the angle {x, y}
   * @param {number} radius - Radius of the angle arc
   * @param {Object} options - Additional options {reflex, reverseFirst, reverseSecond}
   * @returns {Object} Center point {x, y}
   */
  static getAngleCenter(vertex, startPoint, endPoint, radius, options = {}) {
    const { reflex = false, reverseFirst = false, reverseSecond = false, isRightAngle = false } = options;
    
    // For right angle, center is at the middle of the square
    if (isRightAngle) {
      const dx1 = startPoint.x - vertex.x;
      const dy1 = startPoint.y - vertex.y;
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const unit1 = { x: dx1 / len1, y: dy1 / len1 };
      
      const dx2 = endPoint.x - vertex.x;
      const dy2 = endPoint.y - vertex.y;
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const unit2 = { x: dx2 / len2, y: dy2 / len2 };
      
      return {
        x: vertex.x + radius * 0.7 * (unit1.x + unit2.x),
        y: vertex.y + radius * 0.7 * (unit1.y + unit2.y)
      };
    }
    
    let p1 = { ...startPoint };
    let p2 = { ...endPoint };
    
    // Handle exterior angles by reversing vectors
    if (reverseFirst) {
      const dx = p1.x - vertex.x;
      const dy = p1.y - vertex.y;
      p1 = { x: vertex.x - dx, y: vertex.y - dy };
    }
    
    if (reverseSecond) {
      const dx = p2.x - vertex.x;
      const dy = p2.y - vertex.y;
      p2 = { x: vertex.x - dx, y: vertex.y - dy };
    }
    
    // Calculate vector directions
    const v1x = p1.x - vertex.x;
    const v1y = p1.y - vertex.y;
    const v2x = p2.x - vertex.x;
    const v2y = p2.y - vertex.y;
    
    // Normalize vectors
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
    const n1x = v1x / len1;
    const n1y = v1y / len1;
    const n2x = v2x / len2;
    const n2y = v2y / len2;
    
    // Calculate bisector direction
    let bisectorX, bisectorY;
    if (reflex) {
      // For reflex angle, bisector points outward (opposite direction)
      bisectorX = -(n1x + n2x);
      bisectorY = -(n1y + n2y);
    } else {
      bisectorX = n1x + n2x;
      bisectorY = n1y + n2y;
    }
    
    const bisectorLen = Math.sqrt(bisectorX * bisectorX + bisectorY * bisectorY);
    
    // Handle special case when vectors are opposite (bisector length near 0)
    if (bisectorLen < 0.001) {
      // Use perpendicular to one of the vectors
      bisectorX = -n1y;
      bisectorY = n1x;
    } else {
      bisectorX /= bisectorLen;
      bisectorY /= bisectorLen;
    }
    
    // Position at 60% of radius on the bisector for good label placement
    return {
      x: vertex.x + bisectorX * radius * 0.6,
      y: vertex.y + bisectorY * radius * 0.6
    };
  }
  
  /**
   * Generate a right angle square indicator
   * @param {Object} vertex - The vertex point {x, y}
   * @param {Object} startPoint - Start point of the angle {x, y}
   * @param {Object} endPoint - End point of the angle {x, y}
   * @param {number} size - Size of the square
   * @returns {string} SVG path string for the right angle square
   */
  static generateRightAngle(vertex, startPoint, endPoint, size) {
    // Calculate angles from vertex to points (same as interior angle)
    const angle1 = Math.atan2(startPoint.y - vertex.y, startPoint.x - vertex.x);
    const angle2 = Math.atan2(endPoint.y - vertex.y, endPoint.x - vertex.x);
    
    // Calculate the sweep angle (from angle1 to angle2)
    let sweepAngle = angle2 - angle1;
    
    // Normalize sweep angle to [0, 2π]
    while (sweepAngle < 0) sweepAngle += 2 * Math.PI;
    while (sweepAngle > 2 * Math.PI) sweepAngle -= 2 * Math.PI;
    
    // We want the smaller angle (< 180°) just like interior angle
    let finalAngle1 = angle1;
    let finalAngle2 = angle2;
    if (sweepAngle > Math.PI) {
      // Current sweep is > 180°, so swap to go the shorter way
      sweepAngle = 2 * Math.PI - sweepAngle;
      [finalAngle1, finalAngle2] = [angle2, angle1];
    }
    
    // Create points along each ray at distance 'size' from vertex
    const p1 = {
      x: vertex.x + size * Math.cos(finalAngle1),
      y: vertex.y + size * Math.sin(finalAngle1)
    };
    
    const p2 = {
      x: vertex.x + size * Math.cos(finalAngle2),
      y: vertex.y + size * Math.sin(finalAngle2)
    };
    
    // The corner point
    const corner = {
      x: vertex.x + size * Math.cos(finalAngle1) + size * Math.cos(finalAngle2),
      y: vertex.y + size * Math.sin(finalAngle1) + size * Math.sin(finalAngle2)
    };
    
    // Draw continuous path for pen animation
    // The path goes: p1 → corner → p2
    let path = `M${p1.x},${p1.y} `;
    path += `L${corner.x},${corner.y} `;
    path += `L${p2.x},${p2.y}`;
    // DO NOT close the path with Z to avoid fill
    
    return path;
  }
  
  /**
   * Calculate angle value in degrees
   * @param {Object} vertex - The vertex point {x, y}
   * @param {Object} startPoint - Start point of the angle {x, y}
   * @param {Object} endPoint - End point of the angle {x, y}
   * @param {Object} options - Additional options {reflex, reverseFirst, reverseSecond}
   * @returns {number} Angle in degrees
   */
  static getAngleDegrees(vertex, startPoint, endPoint, options = {}) {
    const { reflex = false, reverseFirst = false, reverseSecond = false, isRightAngle = false } = options;
    
    // Right angles are always 90 degrees
    if (isRightAngle) {
      return 90;
    }
    
    let p1 = { ...startPoint };
    let p2 = { ...endPoint };
    
    // Handle exterior angles by reversing vectors
    if (reverseFirst) {
      const dx = p1.x - vertex.x;
      const dy = p1.y - vertex.y;
      p1 = { x: vertex.x - dx, y: vertex.y - dy };
    }
    
    if (reverseSecond) {
      const dx = p2.x - vertex.x;
      const dy = p2.y - vertex.y;
      p2 = { x: vertex.x - dx, y: vertex.y - dy };
    }
    
    // Calculate vectors
    const v1x = p1.x - vertex.x;
    const v1y = p1.y - vertex.y;
    const v2x = p2.x - vertex.x;
    const v2y = p2.y - vertex.y;
    
    // Calculate angle using dot product and cross product
    const dot = v1x * v2x + v1y * v2y;
    const cross = v1x * v2y - v1y * v2x;
    
    let angle = Math.atan2(cross, dot);
    if (angle < 0) angle += 2 * Math.PI;
    
    // For reflex angle, use the larger angle
    if (reflex && angle < Math.PI) {
      angle = 2 * Math.PI - angle;
    } else if (!reflex && angle > Math.PI) {
      angle = 2 * Math.PI - angle;
    }
    
    return angle * 180 / Math.PI;
  }
}
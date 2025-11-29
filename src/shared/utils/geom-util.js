export class GeomUtil {
  /**
   * Calculate the numerical derivative of a function at a given point
   * @param {Function} func - The function to differentiate
   * @param {number} x - The point at which to calculate the derivative
   * @param {number} h - The step size for numerical differentiation (default: 0.0001)
   * @returns {number} The derivative (slope) at x
   */
  static derivative(func, x, h = 0.0001) {
    return (func(x + h) - func(x - h)) / (2 * h);
  }
  
  /**
   * Calculate the endpoints of a tangent line segment
   * @param {Function} func - The function to find the tangent of
   * @param {number} x - The x-coordinate of the tangency point
   * @param {number} length - The total length of the tangent line segment
   * @returns {Object} An object with {x1, y1, x2, y2} representing the line endpoints
   */
  static tangentLineEndpoints(func, x, length) {
    // Calculate the function value at x
    const y = func(x);
    
    // Calculate the derivative (slope)
    const slope = this.derivative(func, x);
    
    // Calculate tangent line endpoints
    // The line extends length/2 in each direction from the point
    const halfLength = length / 2;
    const dx = halfLength / Math.sqrt(1 + slope * slope); // Horizontal component
    const dy = slope * dx; // Vertical component
    
    return {
      x1: x - dx,
      y1: y - dy,
      x2: x + dx,
      y2: y + dy
    };
  }
  
  /**
   * Calculate a normal (perpendicular) line segment to a function at a given point
   * @param {Function} func - The function to find the normal of
   * @param {number} x - The x-coordinate where to calculate the normal
   * @param {number} length - The total length of the normal line segment
   * @returns {Object} An object with {x1, y1, x2, y2} representing the line endpoints
   */
  static normalLineEndpoints(func, x, length) {
    // Calculate the function value at x
    const y = func(x);
    
    // Calculate the derivative (slope) and perpendicular slope
    const slope = this.derivative(func, x);
    const normalSlope = -1 / slope; // Perpendicular slope
    
    // Calculate normal line endpoints
    const halfLength = length / 2;
    const dx = halfLength / Math.sqrt(1 + normalSlope * normalSlope);
    const dy = normalSlope * dx;
    
    return {
      x1: x - dx,
      y1: y - dy,
      x2: x + dx,
      y2: y + dy
    };
  }
  
  /**
   * Find the x-intercept(s) of a function using the Newton-Raphson method
   * @param {Function} func - The function to find zeros of
   * @param {number} initialGuess - Starting point for iteration
   * @param {number} tolerance - Convergence tolerance (default: 1e-7)
   * @param {number} maxIterations - Maximum iterations (default: 100)
   * @returns {number|null} The x-intercept, or null if not found
   */
  static findZero(func, initialGuess, tolerance = 1e-7, maxIterations = 100) {
    let x = initialGuess;
    
    for (let i = 0; i < maxIterations; i++) {
      const fx = func(x);
      
      if (Math.abs(fx) < tolerance) {
        return x;
      }
      
      const dfx = this.derivative(func, x);
      if (Math.abs(dfx) < tolerance) {
        return null; // Derivative too small, can't continue
      }
      
      x = x - fx / dfx;
    }
    
    return null; // Failed to converge
  }
  
  /**
   * Calculate the arc length of a function between two points
   * @param {Function} func - The function
   * @param {number} a - Start x value
   * @param {number} b - End x value
   * @param {number} steps - Number of integration steps (default: 100)
   * @returns {number} Approximate arc length
   */
  static arcLength(func, a, b, steps = 100) {
    const h = (b - a) / steps;
    let length = 0;
    
    for (let i = 0; i < steps; i++) {
      const x1 = a + i * h;
      const x2 = a + (i + 1) * h;
      const y1 = func(x1);
      const y2 = func(x2);
      
      // Distance between consecutive points
      const dx = x2 - x1;
      const dy = y2 - y1;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    
    return length;
  }
}
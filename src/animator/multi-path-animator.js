import { TimelineMax, Linear } from 'gsap';
import { TweenablePath } from './tweenable-path.js';
import { RoboEventManager } from '../events/robo-event-manager.js';
import { Point } from '../geom/Point.js';
import { GeomUtil } from '../geom/GeomUtil.js';
import { PathInterpolator } from '../path-generators/path-interpolator.js';
import { MathTimeLine } from './math-time-line.js';
import { PenMovementAnimator } from './pen-movement-animator.js';

/**
 * MultiPathAnimator handles sequential animation of multiple SVG paths
 * Based on the TexSVG animation approach from pen-sequencer
 *
 * This class abstracts away all the complexity of:
 * - Sequencing multiple path animations
 * - Moving the pen between paths
 * - Calculating appropriate animation speeds
 * - Managing completion callbacks
 */
export class MultiPathAnimator {
  constructor() {
    this.maxDurationInSecs = 1.5;  // Increased from 0.5
    this.minDurationInSecs = 0.5;  // Increased from 0.15
    this.maxPathLength = 1000;
    this.minPathLength = 50;
  }

  /**
   * Animate multiple paths in sequence
   * @param {Array} pathElements - Array of SVG path elements to animate
   * @param {Point} startPenPoint - Starting position of the pen
   * @param {Function} completionHandler - Called when all paths are animated
   * @param {Object} options - Optional configuration
   */
  animatePaths(pathElements, startPenPoint, completionHandler, options = {}) {
    try {
      // Create main timeline
      const timelineMax = new TimelineMax();
      timelineMax.eventCallback('onComplete', () => {
        completionHandler();
      });

      // Create math timeline wrapper
      const mathTimeLine = new MathTimeLine(timelineMax);
      const penMovementAnimator = new PenMovementAnimator();

      // Track the current pen position
      let currentPenPosition = startPenPoint;

      // Animate each path in sequence
      const validPaths = pathElements.filter(p => p && p.ownerSVGElement);
      const pathCount = validPaths.length;
      
      validPaths.forEach((pathElement, index) => {
        // Create path interpolator for this path
        const pathInterpolator = new PathInterpolator(pathElement);
        const pathLength = pathInterpolator.getLength();
        
        // Calculate animation duration based on path length and total path count
        const duration = this.calculateDuration(pathLength, pathCount);
        
        // Get start and end points of this path
        const pathStartPoint = this.getPathPoint(pathElement, pathInterpolator, 0);
        const pathEndPoint = this.getPathPoint(pathElement, pathInterpolator, 1);

        // Move pen to start of path (if not already there)
        if (!this.pointsAreClose(currentPenPosition, pathStartPoint)) {
          penMovementAnimator.addPenTween(
            currentPenPosition, 
            pathStartPoint, 
            mathTimeLine
          );
        }

        // Initially hide the path stroke
        pathElement.setAttribute('stroke-dasharray', '0,100000');

        // Animate the path being drawn
        timelineMax.to(pathElement, duration, {
          drawSVG: true,
          ease: Linear.easeNone,
          onUpdate: function(tween) {
            const ratio = tween.ratio || 0;
            const currentPoint = this.getPathPoint(pathElement, pathInterpolator, ratio);
            mathTimeLine.updatePenCoordinates(currentPoint);
          }.bind(this),
          onUpdateParams: ["{self}"],
          onComplete: function() {
            // Ensure path is fully visible after animation
            pathElement.setAttribute('stroke-dasharray', '');
          }
        });

        // Update current pen position for next path
        currentPenPosition = pathEndPoint;
      });

      // Move pen to rest position after all paths
      const finalRestPoint = this.getRestPoint(currentPenPosition);
      penMovementAnimator.addPenTween(
        currentPenPosition,
        finalRestPoint,
        mathTimeLine
      );

      // Start the animation
      timelineMax.play();

    } catch (error) {
      console.error('Error in MultiPathAnimator:', error);
      completionHandler();
    }
  }

  /**
   * Calculate animation duration based on path length and total number of paths
   * More paths = each path animates faster to maintain reasonable total time
   */
  calculateDuration(pathLength, pathCount = 1) {
    // Base duration based on path length
    const baseDuration = GeomUtil.map(
      pathLength,
      this.minPathLength,
      this.maxPathLength,
      this.minDurationInSecs,
      this.maxDurationInSecs
    );
    
    // Scale down individual path duration if there are multiple paths
    // This keeps total animation time reasonable
    // For 3 paths: multiply by ~0.7, for 5 paths: multiply by ~0.5, etc.
    const scaleFactor = Math.max(0.3, 1.0 / Math.sqrt(pathCount));
    
    return baseDuration * scaleFactor;
  }

  /**
   * Get a point along the path at a given ratio (0-1)
   */
  getPathPoint(pathElement, pathInterpolator, ratio) {
    const svgElement = pathElement.ownerSVGElement;
    const svgPos = svgElement.getBoundingClientRect();
    const localPoint = pathInterpolator.getLocalSVGValue(ratio);
    
    // Convert to screen coordinates
    const scaleFactor = RoboEventManager.getScaleFactor();
    const x = svgPos.left + localPoint.x * scaleFactor;
    const y = svgPos.top + localPoint.y * scaleFactor;
    
    return new Point(x, y);
  }

  /**
   * Check if two points are close enough to skip pen movement
   */
  pointsAreClose(point1, point2, threshold = 5) {
    const distance = Point.distance(point1, point2);
    return distance < threshold;
  }

  /**
   * Get a rest position offset from the given point
   */
  getRestPoint(point) {
    return new Point(point.x + 20, point.y + 20);
  }

  /**
   * Simplified API for common use case: animate paths with current pen position
   */
  static animate(pathElements, completionHandler, options = {}) {
    const animator = new MultiPathAnimator();
    const startPoint = RoboEventManager.getLastVisitedPenPoint();
    animator.animatePaths(pathElements, startPoint, completionHandler, options);
  }
}
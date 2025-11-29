export class ZoomUtils {
  // Parse viewBox string to object
  static parseViewBox(viewBoxString) {
    if (!viewBoxString) return { x: 0, y: 0, width: 0, height: 0 };
    const values = viewBoxString.split(' ').map(Number);
    return { 
      x: values[0] || 0, 
      y: values[1] || 0, 
      width: values[2] || 0, 
      height: values[3] || 0 
    };
  }

  // Format viewBox object to string
  static formatViewBox(viewBox) {
    return `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
  }

  // Calculate new viewBox for zoom
  static calculateZoomedViewBox(currentViewBox, centerPoint, zoomScale, originalViewBox = null) {
    const parsed = typeof currentViewBox === 'string' ? 
      this.parseViewBox(currentViewBox) : currentViewBox;
    
    // Use original viewBox as bounds, fallback to current if not provided
    const bounds = originalViewBox ? 
      (typeof originalViewBox === 'string' ? this.parseViewBox(originalViewBox) : originalViewBox) : 
      parsed;
    
    // Calculate new dimensions with reasonable limits
    const minScale = 0.1; // Don't zoom out more than 10x
    const maxScale = 2.0;  // Don't zoom in more than 2x
    const constrainedScale = Math.max(minScale, Math.min(maxScale, zoomScale));
    
    const newWidth = parsed.width * constrainedScale;
    const newHeight = parsed.height * constrainedScale;
    
    // Calculate new position to center on the point
    let newX = centerPoint.x - newWidth / 2;
    let newY = centerPoint.y - newHeight / 2;
    
    // Constrain the viewBox to stay within original bounds
    // Don't let the zoom go beyond the original coordinate system
    const boundsMinX = bounds.x;
    const boundsMinY = bounds.y;
    const boundsMaxX = bounds.x + bounds.width;
    const boundsMaxY = bounds.y + bounds.height;
    
    // Ensure the zoomed view doesn't go outside the original bounds
    if (newX < boundsMinX) newX = boundsMinX;
    if (newY < boundsMinY) newY = boundsMinY;
    if (newX + newWidth > boundsMaxX) newX = boundsMaxX - newWidth;
    if (newY + newHeight > boundsMaxY) newY = boundsMaxY - newHeight;
    
    return { 
      x: newX, 
      y: newY, 
      width: newWidth, 
      height: newHeight 
    };
  }

  // Animate viewBox change using SVG.js (preferred), GSAP (fallback), or immediate
  static animateViewBox(svgElement, newViewBox, duration = 0.5, animate = true) {
    const viewBoxString = this.formatViewBox(newViewBox);
    
    // If animation is disabled, apply immediately
    if (!animate || duration === 0) {
      svgElement.setAttribute('viewBox', viewBoxString);
      return null;
    }
    
    // Try SVG.js first (smoother animation)
    if (typeof SVG !== 'undefined' && svgElement.__svgjs_instance) {
      const svgInstance = svgElement.__svgjs_instance;
      if (svgInstance && svgInstance.animate) {
        return svgInstance.animate(duration * 1000).viewbox(
          newViewBox.x, 
          newViewBox.y, 
          newViewBox.width, 
          newViewBox.height
        );
      }
    }
    
    // Try to find SVG.js instance by looking at parent elements
    let currentElement = svgElement;
    while (currentElement && !currentElement.__svgjs_instance) {
      currentElement = currentElement.parentElement;
      if (currentElement && currentElement.__svgjs_instance) {
        const svgInstance = currentElement.__svgjs_instance;
        if (svgInstance && svgInstance.animate) {
          return svgInstance.animate(duration * 1000).viewbox(
            newViewBox.x, 
            newViewBox.y, 
            newViewBox.width, 
            newViewBox.height
          );
        }
      }
    }
    
    // Fallback to GSAP if available
    if (typeof TweenMax !== 'undefined' && typeof Power3 !== 'undefined') {
      // Create a proxy object to animate
      const current = this.parseViewBox(svgElement.getAttribute('viewBox'));
      const target = this.parseViewBox(viewBoxString);
      
      return TweenMax.to(current, duration, {
        x: target.x,
        y: target.y,
        width: target.width,
        height: target.height,
        ease: Power3.easeInOut,
        onUpdate: function() {
          svgElement.setAttribute('viewBox', `${current.x} ${current.y} ${current.width} ${current.height}`);
        }
      });
    } 
    // Final fallback to immediate change
    else {
      svgElement.setAttribute('viewBox', viewBoxString);
      return null;
    }
  }

  // Calculate bounds for multiple points
  static calculateBounds(points) {
    if (!points || points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}
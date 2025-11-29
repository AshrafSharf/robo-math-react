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
  static calculateZoomedViewBox(currentViewBox, centerPoint, zoomScale) {
    const parsed = typeof currentViewBox === 'string' ? 
      this.parseViewBox(currentViewBox) : currentViewBox;
    
    // Calculate new dimensions
    const newWidth = parsed.width * zoomScale;
    const newHeight = parsed.height * zoomScale;
    
    // Calculate new position to center on the point
    const newX = centerPoint.x - newWidth / 2;
    const newY = centerPoint.y - newHeight / 2;
    
    return { 
      x: newX, 
      y: newY, 
      width: newWidth, 
      height: newHeight 
    };
  }

  // Animate viewBox change using GSAP (if available) or fallback
  static animateViewBox(svgElement, newViewBox, duration = 0.5) {
    const viewBoxString = this.formatViewBox(newViewBox);
    
    // Check if TweenMax is available (GSAP)
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
    // Fallback to immediate change
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
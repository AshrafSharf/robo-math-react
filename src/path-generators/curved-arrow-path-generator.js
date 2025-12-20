/**
 * CurvedArrowPathGenerator - Generates SVG path for curved arrow with inline arrowhead
 *
 * Creates a quadratic Bezier curve from start to end with arrowhead drawn as path lines
 * (no SVG defs/markers used)
 */
export class CurvedArrowPathGenerator {
    /**
     * Generate curved arrow path
     * @param {Object} start - Start point {x, y} (tail)
     * @param {Object} end - End point {x, y} (head)
     * @param {number} curvature - Perpendicular offset for control point
     * @param {Object} options - Arrow options
     * @returns {Object} { curvePath, arrowheadPath, controlPoint }
     */
    static generate(start, end, curvature = 0, options = {}) {
        const {
            headLength = 10,
            headAngle = Math.PI / 6 // 30 degrees
        } = options;

        // Calculate midpoint and perpendicular direction
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        // Direction vector from start to end
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular unit vector (rotated 90 degrees)
        const perpX = -dy / length;
        const perpY = dx / length;

        // Control point offset by curvature in perpendicular direction
        const controlPoint = {
            x: midX + perpX * curvature,
            y: midY + perpY * curvature
        };

        // Generate quadratic Bezier curve path
        const curvePath = `M ${start.x},${start.y} Q ${controlPoint.x},${controlPoint.y} ${end.x},${end.y}`;

        // Calculate tangent angle at endpoint for arrowhead direction
        // For quadratic Bezier, tangent at t=1 is direction from control to end
        const tangentAngle = Math.atan2(end.y - controlPoint.y, end.x - controlPoint.x);

        // Calculate arrowhead points
        const arrow1 = {
            x: end.x - headLength * Math.cos(tangentAngle - headAngle),
            y: end.y - headLength * Math.sin(tangentAngle - headAngle)
        };
        const arrow2 = {
            x: end.x - headLength * Math.cos(tangentAngle + headAngle),
            y: end.y - headLength * Math.sin(tangentAngle + headAngle)
        };

        // Arrowhead path: two lines meeting at the endpoint
        const arrowheadPath = `M ${arrow1.x},${arrow1.y} L ${end.x},${end.y} L ${arrow2.x},${arrow2.y}`;

        return {
            curvePath,
            arrowheadPath,
            controlPoint,
            tangentAngle
        };
    }

    /**
     * Calculate arrow endpoint from start point, direction, and length
     * @param {Object} start - Start point {x, y}
     * @param {string} direction - "N", "E", "S", "W"
     * @param {number} length - Arrow length in pixels
     * @returns {Object} End point {x, y}
     */
    static calculateEndPoint(start, direction, length) {
        switch (direction.toUpperCase()) {
            case 'N':
                return { x: start.x, y: start.y - length };
            case 'S':
                return { x: start.x, y: start.y + length };
            case 'E':
                return { x: start.x + length, y: start.y };
            case 'W':
                return { x: start.x - length, y: start.y };
            default:
                console.warn(`Unknown direction: ${direction}, defaulting to E`);
                return { x: start.x + length, y: start.y };
        }
    }

    /**
     * Calculate arrow start point from TextItem bounds and anchor position
     * @param {Bounds2} bounds - TextItem canvas bounds
     * @param {string} anchor - Anchor position: "tl", "tm", "tr", "lm", "rm", "bl", "bm", "br"
     * @param {string} direction - "N", "E", "S", "W" - used for offset direction
     * @param {number} offset - Offset from edge
     * @returns {Object} Start point {x, y}
     */
    static calculateStartPoint(bounds, anchor, direction, offset = 0) {
        // Get base anchor point
        let x, y;
        switch (anchor.toLowerCase()) {
            case 'tl': // top-left
                x = bounds.minX;
                y = bounds.minY;
                break;
            case 'tm': // top-middle
                x = bounds.centerX;
                y = bounds.minY;
                break;
            case 'tr': // top-right
                x = bounds.maxX;
                y = bounds.minY;
                break;
            case 'lm': // left-middle
                x = bounds.minX;
                y = bounds.centerY;
                break;
            case 'rm': // right-middle
                x = bounds.maxX;
                y = bounds.centerY;
                break;
            case 'bl': // bottom-left
                x = bounds.minX;
                y = bounds.maxY;
                break;
            case 'bm': // bottom-middle
                x = bounds.centerX;
                y = bounds.maxY;
                break;
            case 'br': // bottom-right
                x = bounds.maxX;
                y = bounds.maxY;
                break;
            default:
                console.warn(`Unknown anchor: ${anchor}, defaulting to rm`);
                x = bounds.maxX;
                y = bounds.centerY;
        }

        // Apply offset in the direction of the arrow
        switch (direction.toUpperCase()) {
            case 'N':
                y -= offset;
                break;
            case 'S':
                y += offset;
                break;
            case 'E':
                x += offset;
                break;
            case 'W':
                x -= offset;
                break;
        }

        return { x, y };
    }
}

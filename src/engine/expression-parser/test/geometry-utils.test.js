/**
 * Test geometry utility classes
 * Tests IntersectionUtil, LineUtil, and VectorUtil
 */

import { describe, test, assert, printSummary } from './test-framework.js';
import { IntersectionUtil } from '../../../geom/IntersectionUtil.js';
import { LineUtil } from '../../../geom/LineUtil.js';
import { VectorUtil } from '../../../geom/VectorUtil.js';

describe('IntersectionUtil', () => {

    describe('lineLineIntersection', () => {
        test('perpendicular lines at origin', () => {
            // Horizontal line y=0 and vertical line x=0
            const result = IntersectionUtil.lineLineIntersection(
                { x: -5, y: 0 }, { x: 5, y: 0 },  // horizontal
                { x: 0, y: -5 }, { x: 0, y: 5 }   // vertical
            );
            assert.ok(result !== null, 'Should find intersection');
            assert.closeTo(result.x, 0, 0.0001);
            assert.closeTo(result.y, 0, 0.0001);
        });

        test('lines intersecting at (2, 3)', () => {
            // Line through (0,0) and (4,6) intersects y=3 horizontal
            const result = IntersectionUtil.lineLineIntersection(
                { x: 0, y: 0 }, { x: 4, y: 6 },
                { x: -5, y: 3 }, { x: 5, y: 3 }
            );
            assert.ok(result !== null);
            assert.closeTo(result.x, 2, 0.0001);
            assert.closeTo(result.y, 3, 0.0001);
        });

        test('parallel lines return null', () => {
            // Two horizontal lines
            const result = IntersectionUtil.lineLineIntersection(
                { x: 0, y: 0 }, { x: 10, y: 0 },
                { x: 0, y: 5 }, { x: 10, y: 5 }
            );
            assert.equal(result, null);
        });

        test('diagonal lines', () => {
            // y = x and y = -x + 4, intersect at (2, 2)
            const result = IntersectionUtil.lineLineIntersection(
                { x: 0, y: 0 }, { x: 4, y: 4 },
                { x: 0, y: 4 }, { x: 4, y: 0 }
            );
            assert.ok(result !== null);
            assert.closeTo(result.x, 2, 0.0001);
            assert.closeTo(result.y, 2, 0.0001);
        });
    });

    describe('segmentSegmentIntersection', () => {
        test('crossing segments', () => {
            const result = IntersectionUtil.segmentSegmentIntersection(
                { x: 0, y: 0 }, { x: 4, y: 4 },
                { x: 0, y: 4 }, { x: 4, y: 0 }
            );
            assert.ok(result !== null);
            assert.closeTo(result.x, 2, 0.0001);
            assert.closeTo(result.y, 2, 0.0001);
        });

        test('non-crossing segments return null', () => {
            // Two segments that would cross if extended
            const result = IntersectionUtil.segmentSegmentIntersection(
                { x: 0, y: 0 }, { x: 1, y: 1 },
                { x: 3, y: 0 }, { x: 4, y: 1 }
            );
            assert.equal(result, null);
        });
    });

    describe('lineCircleIntersection', () => {
        test('line through circle center (2 points)', () => {
            const result = IntersectionUtil.lineCircleIntersection(
                { x: -10, y: 0 }, { x: 10, y: 0 },  // horizontal through origin
                { x: 0, y: 0 }, 5  // circle at origin, radius 5
            );
            assert.equal(result.length, 2);
            // Points should be at (-5, 0) and (5, 0)
            const xs = result.map(p => p.x).sort((a, b) => a - b);
            assert.closeTo(xs[0], -5, 0.0001);
            assert.closeTo(xs[1], 5, 0.0001);
        });

        test('line tangent to circle (1 point)', () => {
            const result = IntersectionUtil.lineCircleIntersection(
                { x: -10, y: 5 }, { x: 10, y: 5 },  // y = 5
                { x: 0, y: 0 }, 5  // circle at origin, radius 5
            );
            assert.equal(result.length, 1);
            assert.closeTo(result[0].x, 0, 0.0001);
            assert.closeTo(result[0].y, 5, 0.0001);
        });

        test('line missing circle (0 points)', () => {
            const result = IntersectionUtil.lineCircleIntersection(
                { x: -10, y: 10 }, { x: 10, y: 10 },  // y = 10
                { x: 0, y: 0 }, 5  // circle at origin, radius 5
            );
            assert.equal(result.length, 0);
        });

        test('diagonal line through circle', () => {
            const result = IntersectionUtil.lineCircleIntersection(
                { x: -10, y: -10 }, { x: 10, y: 10 },  // y = x
                { x: 0, y: 0 }, 5  // circle at origin, radius 5
            );
            assert.equal(result.length, 2);
            // Points at distance 5 from origin on y=x line
            const r = 5 / Math.sqrt(2);
            const sorted = result.sort((a, b) => a.x - b.x);
            assert.closeTo(sorted[0].x, -r, 0.001);
            assert.closeTo(sorted[1].x, r, 0.001);
        });
    });

    describe('circleCircleIntersection', () => {
        test('two circles intersecting at 2 points', () => {
            // Two circles radius 5, centers at (-2, 0) and (2, 0)
            const result = IntersectionUtil.circleCircleIntersection(
                { x: -2, y: 0 }, 5,
                { x: 2, y: 0 }, 5
            );
            assert.equal(result.length, 2);
            // Both points should have x = 0
            assert.closeTo(result[0].x, 0, 0.0001);
            assert.closeTo(result[1].x, 0, 0.0001);
        });

        test('externally tangent circles (1 point)', () => {
            // Two circles radius 5, centers 10 apart
            const result = IntersectionUtil.circleCircleIntersection(
                { x: 0, y: 0 }, 5,
                { x: 10, y: 0 }, 5
            );
            assert.equal(result.length, 1);
            assert.closeTo(result[0].x, 5, 0.0001);
            assert.closeTo(result[0].y, 0, 0.0001);
        });

        test('internally tangent circles (1 point)', () => {
            // Circle radius 10 at origin, circle radius 5 at (5, 0)
            const result = IntersectionUtil.circleCircleIntersection(
                { x: 0, y: 0 }, 10,
                { x: 5, y: 0 }, 5
            );
            assert.equal(result.length, 1);
            assert.closeTo(result[0].x, 10, 0.0001);
            assert.closeTo(result[0].y, 0, 0.0001);
        });

        test('non-intersecting circles (too far apart)', () => {
            const result = IntersectionUtil.circleCircleIntersection(
                { x: 0, y: 0 }, 5,
                { x: 20, y: 0 }, 5
            );
            assert.equal(result.length, 0);
        });

        test('non-intersecting circles (one inside other)', () => {
            const result = IntersectionUtil.circleCircleIntersection(
                { x: 0, y: 0 }, 10,
                { x: 2, y: 0 }, 3
            );
            assert.equal(result.length, 0);
        });

        test('concentric circles', () => {
            const result = IntersectionUtil.circleCircleIntersection(
                { x: 0, y: 0 }, 5,
                { x: 0, y: 0 }, 10
            );
            assert.equal(result.length, 0);
        });
    });

    describe('linePolygonIntersection', () => {
        test('line through triangle', () => {
            const triangle = [
                { x: 0, y: 3 },
                { x: -3, y: -3 },
                { x: 3, y: -3 }
            ];
            const result = IntersectionUtil.linePolygonIntersection(
                { x: -10, y: 0 }, { x: 10, y: 0 },  // horizontal line y=0
                triangle
            );
            assert.equal(result.length, 2);
        });

        test('line through square', () => {
            const square = [
                { x: -2, y: -2 },
                { x: 2, y: -2 },
                { x: 2, y: 2 },
                { x: -2, y: 2 }
            ];
            const result = IntersectionUtil.linePolygonIntersection(
                { x: -10, y: 0 }, { x: 10, y: 0 },
                square
            );
            assert.equal(result.length, 2);
            const xs = result.map(p => p.x).sort((a, b) => a - b);
            assert.closeTo(xs[0], -2, 0.0001);
            assert.closeTo(xs[1], 2, 0.0001);
        });

        test('line missing polygon', () => {
            const square = [
                { x: -2, y: -2 },
                { x: 2, y: -2 },
                { x: 2, y: 2 },
                { x: -2, y: 2 }
            ];
            const result = IntersectionUtil.linePolygonIntersection(
                { x: -10, y: 10 }, { x: 10, y: 10 },  // line above square
                square
            );
            assert.equal(result.length, 0);
        });
    });
});

describe('LineUtil', () => {

    describe('projectPoint', () => {
        test('project onto horizontal line', () => {
            const result = LineUtil.projectPoint(
                { x: 5, y: 10 },  // point above line
                { x: 0, y: 0 }, { x: 10, y: 0 }  // horizontal line y=0
            );
            assert.closeTo(result.x, 5, 0.0001);
            assert.closeTo(result.y, 0, 0.0001);
        });

        test('project onto vertical line', () => {
            const result = LineUtil.projectPoint(
                { x: 10, y: 5 },  // point to right of line
                { x: 0, y: 0 }, { x: 0, y: 10 }  // vertical line x=0
            );
            assert.closeTo(result.x, 0, 0.0001);
            assert.closeTo(result.y, 5, 0.0001);
        });

        test('project onto diagonal line', () => {
            // Line y = x, project point (0, 4)
            // Projection should be at (2, 2)
            const result = LineUtil.projectPoint(
                { x: 0, y: 4 },
                { x: 0, y: 0 }, { x: 10, y: 10 }
            );
            assert.closeTo(result.x, 2, 0.0001);
            assert.closeTo(result.y, 2, 0.0001);
        });

        test('point already on line', () => {
            const result = LineUtil.projectPoint(
                { x: 5, y: 5 },  // point on line y=x
                { x: 0, y: 0 }, { x: 10, y: 10 }
            );
            assert.closeTo(result.x, 5, 0.0001);
            assert.closeTo(result.y, 5, 0.0001);
        });

        test('project beyond line segment (infinite line)', () => {
            // Project should work for infinite line, not segment
            const result = LineUtil.projectPoint(
                { x: 20, y: 10 },
                { x: 0, y: 0 }, { x: 5, y: 0 }  // short horizontal segment
            );
            assert.closeTo(result.x, 20, 0.0001);  // x should be 20, not clamped
            assert.closeTo(result.y, 0, 0.0001);
        });
    });

    describe('reflectPoint', () => {
        test('reflect across horizontal line', () => {
            // Reflect (5, 10) across y=0
            const result = LineUtil.reflectPoint(
                { x: 5, y: 10 },
                { x: 0, y: 0 }, { x: 10, y: 0 }
            );
            assert.closeTo(result.x, 5, 0.0001);
            assert.closeTo(result.y, -10, 0.0001);
        });

        test('reflect across vertical line', () => {
            // Reflect (10, 5) across x=0
            const result = LineUtil.reflectPoint(
                { x: 10, y: 5 },
                { x: 0, y: 0 }, { x: 0, y: 10 }
            );
            assert.closeTo(result.x, -10, 0.0001);
            assert.closeTo(result.y, 5, 0.0001);
        });

        test('reflect across diagonal line y=x', () => {
            // Reflect (0, 4) across y=x, should get (4, 0)
            const result = LineUtil.reflectPoint(
                { x: 0, y: 4 },
                { x: 0, y: 0 }, { x: 10, y: 10 }
            );
            assert.closeTo(result.x, 4, 0.0001);
            assert.closeTo(result.y, 0, 0.0001);
        });

        test('point on line reflects to itself', () => {
            const result = LineUtil.reflectPoint(
                { x: 5, y: 5 },  // on y=x
                { x: 0, y: 0 }, { x: 10, y: 10 }
            );
            assert.closeTo(result.x, 5, 0.0001);
            assert.closeTo(result.y, 5, 0.0001);
        });

        test('reflect across y = -x', () => {
            // Reflect (3, 0) across y = -x, should get (0, -3)
            const result = LineUtil.reflectPoint(
                { x: 3, y: 0 },
                { x: 0, y: 0 }, { x: -5, y: 5 }
            );
            assert.closeTo(result.x, 0, 0.0001);
            assert.closeTo(result.y, -3, 0.0001);
        });
    });

    describe('distanceToPoint', () => {
        test('distance from point to horizontal line', () => {
            const dist = LineUtil.distanceToPoint(
                { x: 0, y: 0 }, { x: 10, y: 0 },  // horizontal line y=0
                { x: 5, y: 7 }  // point 7 units above
            );
            assert.closeTo(dist, 7, 0.0001);
        });

        test('distance from point on line', () => {
            const dist = LineUtil.distanceToPoint(
                { x: 0, y: 0 }, { x: 10, y: 0 },
                { x: 5, y: 0 }
            );
            assert.closeTo(dist, 0, 0.0001);
        });
    });
});

describe('VectorUtil', () => {

    describe('projectOnto', () => {
        test('project horizontal onto vertical (perpendicular)', () => {
            // Horizontal vector projected onto vertical = zero length
            const result = VectorUtil.projectOnto(
                { x: 0, y: 0 }, { x: 5, y: 0 },  // horizontal
                { x: 0, y: 0 }, { x: 0, y: 5 }   // vertical
            );
            assert.closeTo(result.magnitude, 0, 0.0001);
        });

        test('project onto parallel vector', () => {
            // Vector (0,0)->(3,0) projected onto (0,0)->(10,0)
            const result = VectorUtil.projectOnto(
                { x: 0, y: 0 }, { x: 3, y: 0 },
                { x: 0, y: 0 }, { x: 10, y: 0 }
            );
            assert.closeTo(result.end.x, 3, 0.0001);
            assert.closeTo(result.end.y, 0, 0.0001);
            assert.closeTo(result.magnitude, 3, 0.0001);
        });

        test('project diagonal onto horizontal', () => {
            // Vector (0,0)->(3,4) projected onto horizontal
            // Projection should have x=3, y=0
            const result = VectorUtil.projectOnto(
                { x: 0, y: 0 }, { x: 3, y: 4 },
                { x: 0, y: 0 }, { x: 10, y: 0 }
            );
            assert.closeTo(result.end.x, 3, 0.0001);
            assert.closeTo(result.end.y, 0, 0.0001);
        });

        test('project onto vector at 45 degrees', () => {
            // Vector (0,0)->(4,0) projected onto (0,0)->(1,1)
            // Scalar projection = 4*cos(45) = 4/sqrt(2) = 2*sqrt(2)
            const result = VectorUtil.projectOnto(
                { x: 0, y: 0 }, { x: 4, y: 0 },
                { x: 0, y: 0 }, { x: 1, y: 1 }
            );
            const expected = 4 / Math.sqrt(2);
            assert.closeTo(result.magnitude, expected, 0.0001);
        });

        test('project in opposite direction (negative)', () => {
            // Vector pointing opposite to target
            const result = VectorUtil.projectOnto(
                { x: 0, y: 0 }, { x: -5, y: 0 },
                { x: 0, y: 0 }, { x: 10, y: 0 }
            );
            assert.closeTo(result.end.x, -5, 0.0001);
            assert.closeTo(result.magnitude, -5, 0.0001);
        });
    });

    describe('decompose', () => {
        test('decompose diagonal into horizontal components', () => {
            // Vector (3, 4) decomposed relative to horizontal
            const result = VectorUtil.decompose(
                { x: 0, y: 0 }, { x: 3, y: 4 },
                { x: 0, y: 0 }, { x: 10, y: 0 }
            );
            // Parallel component should be (3, 0)
            assert.closeTo(result.parallel.end.x, 3, 0.0001);
            assert.closeTo(result.parallel.end.y, 0, 0.0001);
            // Perpendicular component should be (0, 4) from end of parallel
            assert.closeTo(result.perpendicular.end.x, 3, 0.0001);
            assert.closeTo(result.perpendicular.end.y, 4, 0.0001);
        });
    });

    describe('vector operations', () => {
        test('addVectors', () => {
            const result = VectorUtil.addVectors(
                { x: 0, y: 0 }, { x: 3, y: 0 },
                { x: 0, y: 0 }, { x: 0, y: 4 }
            );
            assert.closeTo(result.end.x, 3, 0.0001);
            assert.closeTo(result.end.y, 4, 0.0001);
        });

        test('subtractVectors', () => {
            const result = VectorUtil.subtractVectors(
                { x: 0, y: 0 }, { x: 5, y: 5 },
                { x: 0, y: 0 }, { x: 2, y: 3 }
            );
            assert.closeTo(result.end.x, 3, 0.0001);
            assert.closeTo(result.end.y, 2, 0.0001);
        });

        test('dotProduct', () => {
            // (3, 4) . (1, 0) = 3
            const dot = VectorUtil.dotProduct(
                { x: 0, y: 0 }, { x: 3, y: 4 },
                { x: 0, y: 0 }, { x: 1, y: 0 }
            );
            assert.closeTo(dot, 3, 0.0001);
        });

        test('crossProduct', () => {
            // (1, 0) x (0, 1) = 1 (CCW)
            const cross = VectorUtil.crossProduct(
                { x: 0, y: 0 }, { x: 1, y: 0 },
                { x: 0, y: 0 }, { x: 0, y: 1 }
            );
            assert.closeTo(cross, 1, 0.0001);
        });

        test('angleBetween perpendicular vectors', () => {
            const angle = VectorUtil.angleBetween(
                { x: 0, y: 0 }, { x: 1, y: 0 },
                { x: 0, y: 0 }, { x: 0, y: 1 }
            );
            assert.closeTo(angle, Math.PI / 2, 0.0001);
        });

        test('angleBetween parallel vectors', () => {
            const angle = VectorUtil.angleBetween(
                { x: 0, y: 0 }, { x: 1, y: 0 },
                { x: 0, y: 0 }, { x: 5, y: 0 }
            );
            assert.closeTo(angle, 0, 0.0001);
        });
    });
});

printSummary();

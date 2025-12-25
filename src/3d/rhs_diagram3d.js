/**
 * RHSDiagram3D - Right-Hand System 3D Diagram
 * Extends BaseDiagram3D and implements all methods using native Three.js APIs
 * Uses native RHS coordinates without transformation
 */

import * as THREE from 'three';
import { BaseDiagram3D } from './base_diagram_3d.js';
import * as native from './native/index.js';
import { clearAll, hideAll, showAll } from './lifecycle_utils.js';
import * as geoUtils from './native/geometry_utils.js';

export class RHS3DDiagram extends BaseDiagram3D {
    constructor(scene, effectsManager = null) {
        super(scene, effectsManager);
    }

    /**
     * Create a 3D point
     * @param {Object} position - Position {x, y, z}
     * @param {string} label - Optional label for the point
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Point mesh with label property
     */
    point3d(position, label = '', color = 0xff0000, options = {}) {
        const pointMesh = native.point(position, {
            color: this.parseColor(color),
            radius: options.radius || 0.15,
            ...options
        });

        // Add to scene
        this.scene.add(pointMesh);
        this.objects.push(pointMesh);

        // Add label if provided
        this._addLabel(pointMesh, position, label, {
            labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
        });

        return pointMesh;
    }

    /**
     * Create a segment between two points
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Segment group with label property
     */
    segment3dByTwoPoints(start, end, label = '', color = 0x00ff00, options = {}) {
        const segmentMesh = native.line(start, end, {
            color: this.parseColor(color),
            radius: options.radius || 0.02,
            ...options
        });

        // Add to scene
        this.scene.add(segmentMesh);
        this.objects.push(segmentMesh);

        // Add label at midpoint if provided
        if (label) {
            const midpoint = geoUtils.midPoint(start, end);
            const labelMesh = this.label(midpoint, label, {
                color: '#000000',
                offset: options.labelOffset || { x: 0, y: 0.3, z: 0 }
            });
            segmentMesh.label = labelMesh;
        }

        return segmentMesh;
    }

    /**
     * Create a vector (arrow) between two points
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Vector group with label property
     */
    vector(start, end, label = '', color = 0xff0000, options = {}) {
        const vectorGroup = native.vector(start, end, {
            color: this.parseColor(color),
            shaftRadius: options.shaftRadius || 0.05,
            headRadius: options.headRadius || 0.15,
            headLength: options.headLength || 0.3,
            ...options
        });

        // Add to scene
        this.scene.add(vectorGroup);
        this.objects.push(vectorGroup);

        // Add label if provided
        this._addLabel(vectorGroup, this._midpoint(start, end), label, {
            labelOffset: options.labelOffset,
            isLatex: options.isLatex,
            fontSize: options.fontSize,
            addAsChild: true
        });

        return vectorGroup;
    }

    /**
     * Create a dashed vector (useful for unit vectors)
     * @param {Object} start - Start position {x, y, z}
     * @param {Object} end - End position {x, y, z}
     * @param {string} label - Optional label for the vector
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Vector group
     */
    dashedVector(start, end, label = '', color = 0x00ff00, options = {}) {
        const vectorGroup = native.dashedVector(start, end, {
            color: this.parseColor(color),
            dashSize: options.dashSize || 0.2,
            gapSize: options.gapSize || 0.1,
            shaftRadius: options.shaftRadius || 0.04,
            headRadius: options.headRadius || 0.15,
            headLength: options.headLength || 0.3,
            ...options
        });

        // Add to scene
        this.scene.add(vectorGroup);
        this.objects.push(vectorGroup);

        // Add label if provided
        this._addLabel(vectorGroup, this._midpoint(start, end), label, {
            labelOffset: options.labelOffset,
            isLatex: options.isLatex !== false,
            fontSize: options.fontSize,
            addAsChild: true
        });

        return vectorGroup;
    }

    /**
     * Create a dashed line between two points
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Dashed line group with label property
     */
    dashedLine3d(start, end, label = '', color = 0xff1493, options = {}) {
        // Use dashedVector without arrowhead (by setting headLength to 0)
        const dashedLineGroup = native.dashedVector(start, end, {
            color: this.parseColor(color),
            dashSize: options.dashSize || 0.2,
            gapSize: options.gapSize || 0.1,
            shaftRadius: options.radius || 0.025,
            headRadius: 0,
            headLength: 0,
            ...options
        });

        // Add to scene
        this.scene.add(dashedLineGroup);
        this.objects.push(dashedLineGroup);

        // Add label at midpoint if provided
        if (label) {
            const midpoint = geoUtils.midPoint(start, end);
            const labelMesh = this.label(midpoint, label, {
                color: '#000000',
                offset: options.labelOffset || { x: 0, y: 0.3, z: 0 }
            });
            dashedLineGroup.label = labelMesh;
        }

        return dashedLineGroup;
    }

    /**
     * Create an infinite line through two points
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Line group with label property
     */
    lineByTwoPoints(point1, point2, label = '', color = 0x0000ff, options = {}) {
        const lineGroup = native.line(point1, point2, {
            color: this.parseColor(color),
            radius: options.radius || 0.02,
            ...options
        });

        // Add to scene
        this.scene.add(lineGroup);
        this.objects.push(lineGroup);

        // Add label if provided
        this._addLabel(lineGroup, geoUtils.midPoint(point1, point2), label, {
            labelOffset: options.labelOffset
        });

        return lineGroup;
    }

    /**
     * Create a reversed vector (pointing in opposite direction)
     * @param {Object} vector - The vector object to reverse (must have start and end properties)
     * @param {Object} options - Additional options for the reversed vector
     * @returns {Object} Reversed vector group with label property
     */
    reverseVector(vector, options = {}) {
        // Get start and end from the vector parameter
        const originalStart = vector.start;
        const originalEnd = vector.end;

        // Calculate displacement
        const displacement = {
            x: originalEnd.x - originalStart.x,
            y: originalEnd.y - originalStart.y,
            z: originalEnd.z - originalStart.z
        };

        // The reversed vector has same tail, head pointing in opposite direction
        const reversedEnd = {
            x: originalStart.x - displacement.x,
            y: originalStart.y - displacement.y,
            z: originalStart.z - displacement.z
        };

        // Create reversed vector using dashed style
        const reversedVector = native.dashedVector(originalStart, reversedEnd, {
            color: this.parseColor(options.strokeColor || options.color || 0xff0000),
            shaftRadius: options.shaftRadius || 0.04,
            headRadius: options.headRadius || 0.15,
            headLength: options.headLength || 0.3,
            dashSize: options.dash || 0.2,
            gapSize: options.gapSize || 0.1,
            ...options
        });

        // Add to scene
        this.scene.add(reversedVector);
        this.objects.push(reversedVector);

        // Add label if provided
        this._addLabel(reversedVector, this._midpoint(originalStart, reversedEnd), options.label, {
            labelOffset: options.labelOffset || { x: 0, y: 0.5, z: 0 }
        });

        return reversedVector;
    }

    /**
     * Shift a vector to a new position, preserving its direction and magnitude
     * @param {Object} vector - Object with {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} newStart - New starting position {x, y, z} for the vector's tail
     * @param {Object} options - Additional options for the vector
     * @returns {Object} The dashed vector at the new position
     */
    shiftToVector(vector, newStart, options = {}) {
        // Calculate displacement
        const displacement = {
            x: vector.end.x - vector.start.x,
            y: vector.end.y - vector.start.y,
            z: vector.end.z - vector.start.z
        };

        // Calculate new end position
        const newEnd = {
            x: newStart.x + displacement.x,
            y: newStart.y + displacement.y,
            z: newStart.z + displacement.z
        };

        // Create dashed vector at the new position
        const dashedVector = native.dashedVector(newStart, newEnd, {
            color: this.parseColor(options.color || 'red'),
            shaftRadius: options.shaftRadius || 0.04,
            headRadius: options.headRadius || 0.15,
            headLength: options.headLength || 0.3,
            dashSize: options.dash || 0.2,
            gapSize: options.gapSize || 0.1,
            ...options
        });

        // Add to scene
        this.scene.add(dashedVector);
        this.objects.push(dashedVector);

        // Add label if provided
        if (options.label) {
            this._addLabel(dashedVector, this._midpoint(newStart, newEnd), options.label, {
                labelOffset: options.labelOffset || { x: 0, y: 0.5, z: 0 }
            });
        }

        return dashedVector;
    }

    /**
     * Move a vector forward along its direction (empty stub - static diagram)
     * @param {Object} vectorObj - The vector object to move forward
     * @param {number} scalar - The scalar amount to move forward
     * @param {Object} options - Additional options
     * @returns {Object} The vector object (unchanged)
     */
    forwardVector(vectorObj, _scalar = 1, _options = {}) {
        // Empty stub - only works in AnimatedDiagram
        return vectorObj;
    }

    /**
     * Move a vector backward along its direction (empty stub - static diagram)
     * @param {Object} vectorObj - The vector object to move backward
     * @param {number} scalar - The scalar amount to move backward
     * @param {Object} options - Additional options
     * @returns {Object} The vector object (unchanged)
     */
    backwardVector(vectorObj, _scalar = 1, _options = {}) {
        // Empty stub - only works in AnimatedDiagram
        return vectorObj;
    }

    /**
     * Create a parallel vector indicator
     * @param {Object} from - Start point of the vector {x, y, z}
     * @param {Object} to - End point of the vector {x, y, z}
     * @param {Object} offset - Offset vector to position the indicator {x, y, z}
     * @param {string} label - Optional label for the indicator
     * @param {number|string} color - Color of the indicator
     * @param {Object} options - Additional options
     * @returns {Object} Parallel indicator group with label property
     */
    parallelVectorIndicator(from, to, offset, label = '', color = 0x808080, options = {}) {
        // Calculate the offset positions
        const offsetFrom = {
            x: from.x + offset.x,
            y: from.y + offset.y,
            z: from.z + offset.z
        };
        const offsetTo = {
            x: to.x + offset.x,
            y: to.y + offset.y,
            z: to.z + offset.z
        };

        // Call vector with the offset positions
        return this.vector(offsetFrom, offsetTo, label, color, {
            headPosition: 'middle',
            ...options
        });
    }

    /**
     * Create a plane from a point and normal vector
     * @param {Object} point - Point on plane {x, y, z}
     * @param {Object} normal - Normal vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Plane mesh with label property
     */
    planeByPointAndNormal(point, normal, label = '', color = 0x00ffff, options = {}) {
        const planeMesh = native.plane(point, normal, {
            color: this.parseColor(color),
            size: options.size || 12,
            opacity: options.opacity || 0.5,
            ...options
        });

        // Add to scene
        this.scene.add(planeMesh);
        this.objects.push(planeMesh);

        // Add label if provided
        this._addLabel(planeMesh, point, label, {
            labelOffset: options.labelOffset || { x: 0, y: 0.5, z: 0 }
        });

        return planeMesh;
    }

    /**
     * Create a plane from three points
     * @param {Object} p1 - First point {x, y, z}
     * @param {Object} p2 - Second point {x, y, z}
     * @param {Object} p3 - Third point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Plane mesh with label property
     */
    planeByThreePoints(p1, p2, p3, label = '', color = 0x00ffff, options = {}) {
        // Calculate normal using geometry utils
        const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
        const v2 = { x: p3.x - p1.x, y: p3.y - p1.y, z: p3.z - p1.z };
        const normal = geoUtils.crossProduct(v1, v2);

        // Use the first point as the reference point on the plane
        return this.planeByPointAndNormal(p1, normal, label, color, options);
    }

    /**
     * Create a polygon from vertices
     * @param {Array<Object>} vertices - Array of vertices {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Polygon group with label property
     */
    polygon(vertices, label = '', color = 0x4444ff, options = {}) {
        const polygonMesh = native.polygon(vertices, {
            color: this.parseColor(color),
            opacity: options.opacity || 0.7,
            showEdges: options.showEdges || false,
            edgeColor: options.edgeColor ? this.parseColor(options.edgeColor) : 0x000000,
            ...options
        });

        // Add to scene
        this.scene.add(polygonMesh);
        this.objects.push(polygonMesh);

        // Add label at centroid if provided
        if (label) {
            const centroid = geoUtils.centroid(vertices);
            const labelMesh = this.label(centroid, label, {
                color: '#000000',
                offset: options.labelOffset || { x: 0, y: 0.3, z: 0 }
            });
            polygonMesh.label = labelMesh;
        }

        return polygonMesh;
    }

    /**
     * Create a parallelogram from origin and two vector endpoints
     * @param {Object} origin - Common starting point {x, y, z}
     * @param {Object} vector1End - End point of first vector {x, y, z}
     * @param {Object} vector2End - End point of second vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Parallelogram mesh with label property
     */
    parallelogram(origin, vector1End, vector2End, label = '', color = 0x4444ff, options = {}) {
        // Calculate vector displacements
        const vector1 = {
            x: vector1End.x - origin.x,
            y: vector1End.y - origin.y,
            z: vector1End.z - origin.z
        };
        const vector2 = {
            x: vector2End.x - origin.x,
            y: vector2End.y - origin.y,
            z: vector2End.z - origin.z
        };

        const parallelogramMesh = native.parallelogram(origin, vector1, vector2, {
            color: this.parseColor(color),
            opacity: options.opacity || 0.5,
            showEdges: options.showEdges !== false,
            edgeColor: options.edgeColor ? this.parseColor(options.edgeColor) : 0x000000,
            ...options
        });

        // Add to scene
        this.scene.add(parallelogramMesh);
        this.objects.push(parallelogramMesh);

        // Add label at centroid if provided
        if (label) {
            // Calculate centroid of parallelogram
            const centroid = {
                x: (origin.x + vector1End.x + vector2End.x + origin.x + vector1.x + vector2.x) / 4,
                y: (origin.y + vector1End.y + vector2End.y + origin.y + vector1.y + vector2.y) / 4,
                z: (origin.z + vector1End.z + vector2End.z + origin.z + vector1.z + vector2.z) / 4
            };

            this._addLabel(parallelogramMesh, centroid, label, {
                labelOffset: options.labelOffset
            });
        }

        return parallelogramMesh;
    }

    /**
     * Create a box product (scalar triple product) volume visualization
     * @param {Object} vectorA - First vector {x, y, z}
     * @param {Object} vectorB - Second vector {x, y, z}
     * @param {Object} vectorC - Third vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Volume group with label property
     */
    boxProduct(vectorA, vectorB, vectorC, label = '', color = 0x4444ff, options = {}) {
        // Create the parallelepiped using cuboid-like approach
        // Build vertices for the 8 corners
        const origin = { x: 0, y: 0, z: 0 };

        // Calculate all 8 vertices
        const vertices = [
            origin,
            vectorA,
            vectorB,
            { x: vectorA.x + vectorB.x, y: vectorA.y + vectorB.y, z: vectorA.z + vectorB.z },
            vectorC,
            { x: vectorA.x + vectorC.x, y: vectorA.y + vectorC.y, z: vectorA.z + vectorC.z },
            { x: vectorB.x + vectorC.x, y: vectorB.y + vectorC.y, z: vectorB.z + vectorC.z },
            { x: vectorA.x + vectorB.x + vectorC.x, y: vectorA.y + vectorB.y + vectorC.y, z: vectorA.z + vectorB.z + vectorC.z }
        ];

        // Create 6 faces of the parallelepiped
        const volumeGroup = new THREE.Group();

        const faceColor = this.parseColor(color);
        const faceOptions = {
            color: faceColor,
            opacity: options.opacity || 0.6,
            showEdges: options.showEdges !== false,
            edgeColor: options.edgeColor ? this.parseColor(options.edgeColor) : 0x000000
        };

        // Bottom face
        const bottomFace = native.polygon([vertices[0], vertices[1], vertices[3], vertices[2]], faceOptions);
        volumeGroup.add(bottomFace);

        // Top face
        const topFace = native.polygon([vertices[4], vertices[6], vertices[7], vertices[5]], faceOptions);
        volumeGroup.add(topFace);

        // Front face
        const frontFace = native.polygon([vertices[0], vertices[4], vertices[5], vertices[1]], faceOptions);
        volumeGroup.add(frontFace);

        // Back face
        const backFace = native.polygon([vertices[2], vertices[3], vertices[7], vertices[6]], faceOptions);
        volumeGroup.add(backFace);

        // Left face
        const leftFace = native.polygon([vertices[0], vertices[2], vertices[6], vertices[4]], faceOptions);
        volumeGroup.add(leftFace);

        // Right face
        const rightFace = native.polygon([vertices[1], vertices[5], vertices[7], vertices[3]], faceOptions);
        volumeGroup.add(rightFace);

        // Add to scene
        this.scene.add(volumeGroup);
        this.objects.push(volumeGroup);

        // Add label if provided
        if (label) {
            const centroid = {
                x: (vectorA.x + vectorB.x + vectorC.x) / 2,
                y: (vectorA.y + vectorB.y + vectorC.y) / 2,
                z: (vectorA.z + vectorB.z + vectorC.z) / 2
            };

            this._addLabel(volumeGroup, centroid, label, {
                labelOffset: options.labelOffset
            });
        }

        return volumeGroup;
    }

    /**
     * Create a cuboid (box) from two corner points
     * @param {Object} corner1 - First corner {x, y, z}
     * @param {Object} corner2 - Opposite corner {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Cuboid group with label property
     */
    cuboid(corner1, corner2, label = '', color = 0x4488ff, options = {}) {
        const cuboidGroup = native.cuboid(corner1, corner2, {
            color: this.parseColor(color),
            opacity: options.opacity || 0.2,
            showEdges: options.showEdges !== false,
            edgeColor: options.edgeColor ? this.parseColor(options.edgeColor) : 0x0000ff,
            ...options
        });

        // Add to scene
        this.scene.add(cuboidGroup);
        this.objects.push(cuboidGroup);

        // Add label at center if provided
        if (label) {
            const center = {
                x: (corner1.x + corner2.x) / 2,
                y: (corner1.y + corner2.y) / 2,
                z: (corner1.z + corner2.z) / 2
            };
            const labelMesh = this.label(center, label, {
                color: '#000000',
                offset: options.labelOffset || { x: 0, y: 0, z: 0 }
            });
            cuboidGroup.label = labelMesh;
        }

        return cuboidGroup;
    }

    /**
     * Create a parametric curve
     * @param {Function} curveFunction - Function that takes t and returns {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including tMin, tMax, segments
     * @returns {Object} Curve mesh with label property
     */
    curve(curveFunction, label = '', color = 0x0000ff, options = {}) {
        const curveMesh = native.parametricCurve(curveFunction, {
            color: this.parseColor(color),
            tMin: options.tMin || 0,
            tMax: options.tMax || 1,
            segments: options.segments || 100,
            lineWidth: options.lineWidth || 2,
            ...options
        });

        // Add to scene
        this.scene.add(curveMesh);
        this.objects.push(curveMesh);

        // Add label at midpoint if provided
        if (label && options.labelPosition !== undefined) {
            const t = options.labelPosition || 0.5;
            const labelPoint = curveFunction(options.tMin + t * (options.tMax - options.tMin));
            const labelMesh = this.label(labelPoint, label, {
                color: '#000000',
                offset: options.labelOffset || { x: 0, y: 0.3, z: 0 }
            });
            curveMesh.label = labelMesh;
        }

        return curveMesh;
    }

    /**
     * Create an angle arc between two vectors
     * @param {Object} startVector - Start vector {x, y, z}
     * @param {Object} endVector - End vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including radius
     * @returns {Object} Angle arc mesh with label property
     */
    angleArc(startVector, endVector, label = '', color = 0x00ff00, options = {}) {
        const arcMesh = native.arc(startVector, endVector, {
            color: this.parseColor(color),
            radius: options.radius || 1.0,
            tubeRadius: options.tubeRadius || 0.04,
            ...options
        });

        if (arcMesh) {
            // Add to scene
            this.scene.add(arcMesh);
            this.objects.push(arcMesh);

            // Calculate and store angle center for label positioning
            const start = geoUtils.normalize(startVector);
            const end = geoUtils.normalize(endVector);
            const middle = geoUtils.normalize({
                x: start.x + end.x,
                y: start.y + end.y,
                z: start.z + end.z
            });
            const radius = options.radius || 1.0;

            // Store the angle center on the mesh object
            arcMesh.angleCenter = {
                x: middle.x * radius * 0.5,
                y: middle.y * radius * 0.5,
                z: middle.z * radius * 0.5
            };

            // Add label if provided
            const labelPosition = {
                x: middle.x * radius * 1.2,
                y: middle.y * radius * 1.2,
                z: middle.z * radius * 1.2
            };
            this._addLabel(arcMesh, labelPosition, label, {
                labelOffset: options.labelOffset || { x: 0, y: 0, z: 0 }
            });
        }

        return arcMesh;
    }

    /**
     * Create an angle sector (filled) between two vectors
     * @param {Object} startVector - Start vector {x, y, z}
     * @param {Object} endVector - End vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including radius
     * @returns {Object} Angle sector mesh with label property
     */
    angleSector(startVector, endVector, label = '', color = 0xffaa00, options = {}) {
        const sectorMesh = native.sector(startVector, endVector, {
            color: this.parseColor(color),
            radius: options.radius || 1.0,
            fillOpacity: options.opacity || 0.5,
            ...options
        });

        if (sectorMesh) {
            // Add to scene
            this.scene.add(sectorMesh);
            this.objects.push(sectorMesh);

            // Calculate and store angle center for label positioning
            const start = geoUtils.normalize(startVector);
            const end = geoUtils.normalize(endVector);
            const middle = geoUtils.normalize({
                x: start.x + end.x,
                y: start.y + end.y,
                z: start.z + end.z
            });
            const radius = options.radius || 1.0;

            // Store the angle center on the mesh object
            sectorMesh.angleCenter = {
                x: middle.x * radius * 0.5,
                y: middle.y * radius * 0.5,
                z: middle.z * radius * 0.5
            };

            // Add label if provided
            const labelPosition = {
                x: middle.x * radius * 0.6,
                y: middle.y * radius * 0.6,
                z: middle.z * radius * 0.6
            };
            this._addLabel(sectorMesh, labelPosition, label, {
                labelOffset: options.labelOffset || { x: 0, y: 0, z: 0 }
            });
        }

        return sectorMesh;
    }

    /**
     * Create an arc by three points (angle at the vertex/middle point)
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} vertex - Vertex where angle is formed {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label for the angle
     * @param {number|string} color - Color of the arc
     * @param {Object} options - Additional options
     * @returns {Object} Arc group with label property
     */
    arcByThreePoints(point1, vertex, point2, label = '', color = 0x00ff00, options = {}) {
        const arcGroup = native.arcByThreePoints(point1, vertex, point2, {
            color: this.parseColor(color),
            radius: options.radius || 1.0,
            tubeRadius: options.tubeRadius || 0.04,
            ...options
        });

        if (arcGroup) {
            // Add to scene
            this.scene.add(arcGroup);
            this.objects.push(arcGroup);

            // Add label if provided
            if (label) {
                // Calculate position for label
                const v1 = geoUtils.normalize({
                    x: point1.x - vertex.x,
                    y: point1.y - vertex.y,
                    z: point1.z - vertex.z
                });
                const v2 = geoUtils.normalize({
                    x: point2.x - vertex.x,
                    y: point2.y - vertex.y,
                    z: point2.z - vertex.z
                });
                const middle = geoUtils.normalize({
                    x: v1.x + v2.x,
                    y: v1.y + v2.y,
                    z: v1.z + v2.z
                });
                const radius = options.radius || 1.0;
                const labelPos = {
                    x: vertex.x + middle.x * radius * 0.6,
                    y: vertex.y + middle.y * radius * 0.6,
                    z: vertex.z + middle.z * radius * 0.6
                };

                this._addLabel(arcGroup, labelPos, label, {
                    labelOffset: options.labelOffset || { x: 0, y: 0, z: 0 }
                });
            }
        }

        return arcGroup;
    }

    /**
     * Create a right angle marker (square corner)
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} vertex - Vertex where the right angle is located {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color of the marker
     * @param {Object} options - Additional options
     * @returns {Object} Right angle marker group with label property
     */
    rightAngleMarker(point1, vertex, point2, label = '', color = 0xff6600, options = {}) {
        const markerGroup = native.rightAngle(point1, vertex, point2, {
            color: this.parseColor(color),
            size: options.size || 0.4,
            filled: options.filled !== false,
            outline: options.outline !== false,
            fillOpacity: options.fillOpacity || 0.7,
            tubeRadius: options.tubeRadius || 0.03,
            ...options
        });

        // Add to scene
        this.scene.add(markerGroup);
        this.objects.push(markerGroup);

        // Add label if provided
        if (label) {
            // Calculate position for label
            const v1 = geoUtils.normalize({
                x: point1.x - vertex.x,
                y: point1.y - vertex.y,
                z: point1.z - vertex.z
            });
            const v2 = geoUtils.normalize({
                x: point2.x - vertex.x,
                y: point2.y - vertex.y,
                z: point2.z - vertex.z
            });
            const size = options.size || 0.3;

            const labelPosition = {
                x: vertex.x + (v1.x + v2.x) * size * 0.7,
                y: vertex.y + (v1.y + v2.y) * size * 0.7,
                z: vertex.z + (v1.z + v2.z) * size * 0.7
            };

            const labelMesh = this.label(labelPosition, label, {
                color: '#000000',
                fontSize: options.fontSize || 20,
                offset: options.labelOffset || { x: 0, y: 0, z: 0 }
            });

            markerGroup.label = labelMesh;
        }

        return markerGroup;
    }

    /**
     * Add a label at the center of an angle arc or sector
     * @param {Object} angleObj - The angle arc or sector object
     * @param {string} label - Label text
     * @param {number|string} color - Color of the label
     * @param {Object} options - Additional label options
     * @returns {Object} Label mesh or null
     */
    angleLabel(angleObj, label = '', color = 0x000000, options = {}) {
        if (!angleObj?.angleCenter) {
            return null;
        }

        const labelMesh = this.label(angleObj.angleCenter, label, {
            color: this.parseColor(color),
            fontSize: options.fontSize || 24,
            offset: options.offset || { x: 0, y: 0, z: 0 },
            ...options
        });

        if (labelMesh) {
            angleObj.label = labelMesh;
        }

        return labelMesh;
    }

    /**
     * Create a dot projection visualization
     * @param {Object} vector - The vector to project {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} projectedOntoVector - The vector to project onto {start: {x,y,z}, end: {x,y,z}}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Group containing the projection visualization
     */
    dotProjection(vector, projectedOntoVector, label = '', color = 0xff0000, options = {}) {
        // Calculate vector components
        const v1 = {
            x: vector.end.x - vector.start.x,
            y: vector.end.y - vector.start.y,
            z: vector.end.z - vector.start.z
        };

        const v2 = {
            x: projectedOntoVector.end.x - projectedOntoVector.start.x,
            y: projectedOntoVector.end.y - projectedOntoVector.start.y,
            z: projectedOntoVector.end.z - projectedOntoVector.start.z
        };

        // Normalize v2
        const v2Length = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
        const v2Normalized = {
            x: v2.x / v2Length,
            y: v2.y / v2Length,
            z: v2.z / v2Length
        };

        // Calculate dot product
        const dotProduct = v1.x * v2Normalized.x + v1.y * v2Normalized.y + v1.z * v2Normalized.z;

        // Calculate projection point
        const projectionEnd = {
            x: projectedOntoVector.start.x + v2Normalized.x * dotProduct,
            y: projectedOntoVector.start.y + v2Normalized.y * dotProduct,
            z: projectedOntoVector.start.z + v2Normalized.z * dotProduct
        };

        // Use native measurement indicator if available, otherwise create a simple line
        const indicator = native.measurementIndicator ?
            native.measurementIndicator(projectedOntoVector.start, projectionEnd, {
                color: this.parseColor(color),
                mainRadius: options.mainRadius || 0.03,
                markerRadius: options.markerRadius || 0.02,
                markerLength: options.markerLength || 0.2,
                label: label,
                ...options
            }) :
            native.line(projectedOntoVector.start, projectionEnd, {
                color: this.parseColor(color),
                radius: options.mainRadius || 0.03,
                ...options
            });

        // Add to scene
        this.scene.add(indicator);
        this.objects.push(indicator);

        // Add label if provided
        if (label) {
            const midpoint = {
                x: (projectedOntoVector.start.x + projectionEnd.x) / 2,
                y: (projectedOntoVector.start.y + projectionEnd.y) / 2,
                z: (projectedOntoVector.start.z + projectionEnd.z) / 2
            };

            this._addLabel(indicator, midpoint, label, {
                labelOffset: options.labelOffset || { x: 0, y: 0.5, z: 0 }
            });
        }

        return indicator;
    }

    /**
     * Create a measurement indicator (dimension line) between two points
     * @param {Object} start - Start position {x, y, z}
     * @param {Object} end - End position {x, y, z}
     * @param {string} label - Optional label for the measurement
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Group containing the measurement indicator
     */
    measurementIndicator3d(start, end, label = '', color = 0xff0000, options = {}) {
        const indicator = native.measurementIndicator(start, end, {
            color: this.parseColor(color),
            mainRadius: options.mainRadius || 0.03,
            markerRadius: options.markerRadius || 0.02,
            markerLength: options.markerLength || 0.2,
            ...options
        });

        // Add to scene
        this.scene.add(indicator);
        this.objects.push(indicator);

        // Add label if provided
        if (label) {
            const midpoint = this._midpoint(start, end);
            this._addLabel(indicator, midpoint, label, {
                labelOffset: options.labelOffset || { x: 0, y: 0.3, z: 0 }
            });
        }

        return indicator;
    }

    /**
     * Internal label creation (doesn't add to objects array)
     * @private
     */
    _createLabel(position, text, options = {}) {
        const label = native.label(text, position, {
            fontSize: options.fontSize || 28,
            color: '#000000',
            scale: options.scale || 0.025,
            offset: options.offset || { x: 0.3, y: 0.3, z: 0 }
        });

        if (label && label.material) {
            label.material.depthTest = false;
            label.material.depthWrite = false;
        }

        return label;
    }

    /**
     * Add a label to the scene
     * @param {Object} position - Position {x, y, z}
     * @param {string} text - Label text
     * @param {Object} options - Label options
     * @returns {Object} Label mesh
     */
    label(position, text, options = {}) {
        const label = this._createLabel(position, text, options);
        if (label) {
            this.scene.add(label);
            this.objects.push(label);
        }
        return label;
    }

    /**
     * Helper method to add a label to an object
     * @private
     */
    _addLabel(object, position, labelText, options = {}) {
        if (!labelText) return;

        const createMethod = options.addAsChild ? '_createLabel' : 'label';

        const labelMesh = this[createMethod](position, labelText, {
            color: '#000000',
            offset: options.labelOffset || { x: 0, y: 0.3, z: 0 },
            isLatex: options.isLatex !== false ?
                (labelText.includes('$') || labelText.includes('\\')) : false,
            fontSize: options.fontSize || 16,
            addAsChild: options.addAsChild
        });

        if (labelMesh && options.addAsChild) {
            object.add(labelMesh);
        }

        object.label = labelMesh;
        return labelMesh;
    }

    /**
     * Clear all objects from the scene
     */
    clearAll() {
        clearAll(this.scene, this.objects);
    }

    /**
     * Hide all objects
     */
    hideAll() {
        hideAll(this.objects);
    }

    /**
     * Show all objects
     */
    showAll() {
        showAll(this.objects);
    }

    /**
     * Focus on specific objects (empty stub - static diagram)
     * @param {Array} objectsToFocus - Array of objects to focus on
     * @param {number} unfocusedOpacity - Opacity for unfocused objects
     * @param {number} duration - Animation duration
     */
    focus(_objectsToFocus, _unfocusedOpacity, _duration) {
        // Empty stub - only works in AnimatedDiagram
    }

    /**
     * Restore all objects from any active effects (empty stub - static diagram)
     */
    restore() {
        // Empty stub - only works in AnimatedDiagram
    }

    /**
     * Trace vector path (empty stub - static diagram)
     * @param {Object} directPath - Direct path from start to end
     * @param {Array} vectorPairs - Array of vector pairs
     * @param {Object} options - Animation options
     * @returns {null}
     */
    traceVectorPath(_directPath, _vectorPairs, _options = {}) {
        // No-op in base Diagram class - only AnimatedDiagram implements this
        return null;
    }

    // ===========================================
    // 3D SOLID PRIMITIVES
    // ===========================================

    /**
     * Create a 3D sphere
     * @param {Object} center - Center position {x, y, z}
     * @param {number} radius - Radius of the sphere
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Sphere mesh with label property
     */
    sphere3d(center, radius, label = '', color = 0x4444ff, options = {}) {
        const sphereMesh = native.sphere(center, radius, {
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(sphereMesh);
        this.objects.push(sphereMesh);

        if (label) {
            this._addLabel(sphereMesh, center, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return sphereMesh;
    }

    /**
     * Create a 3D cylinder
     * @param {Object} center - Center position {x, y, z}
     * @param {number} radius - Radius of the cylinder
     * @param {number} height - Height of the cylinder
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Cylinder mesh with label property
     */
    cylinder3d(center, radius, height, label = '', color = 0x44ff44, options = {}) {
        // Calculate base and top centers from center and height
        // In RHS: Y is up
        const baseCenter = { x: center.x, y: center.y - height / 2, z: center.z };
        const topCenter = { x: center.x, y: center.y + height / 2, z: center.z };

        const cylinderMesh = native.cylinder(baseCenter, topCenter, radius, {
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(cylinderMesh);
        this.objects.push(cylinderMesh);

        if (label) {
            this._addLabel(cylinderMesh, center, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return cylinderMesh;
    }

    /**
     * Create a 3D cylinder between two points
     * @param {Object} baseCenter - Base center position {x, y, z}
     * @param {Object} topCenter - Top center position {x, y, z}
     * @param {number} radius - Radius of the cylinder
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Cylinder mesh with label property
     */
    cylinder3dByTwoPoints(baseCenter, topCenter, radius, label = '', color = 0x44ff44, options = {}) {
        const cylinderMesh = native.cylinder(baseCenter, topCenter, radius, {
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(cylinderMesh);
        this.objects.push(cylinderMesh);

        if (label) {
            const midpoint = this._midpoint(baseCenter, topCenter);
            this._addLabel(cylinderMesh, midpoint, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return cylinderMesh;
    }

    /**
     * Create a 3D cube/box
     * @param {Object} center - Center position {x, y, z}
     * @param {number} size - Size of the cube
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Cube mesh with label property
     */
    cube3d(center, size, label = '', color = 0xff4444, options = {}) {
        const cubeMesh = native.cube(center, size, {
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(cubeMesh);
        this.objects.push(cubeMesh);

        if (label) {
            this._addLabel(cubeMesh, center, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return cubeMesh;
    }

    /**
     * Create a 3D cone
     * @param {Object} apex - Apex position {x, y, z}
     * @param {Object} baseCenter - Base center position {x, y, z}
     * @param {number} radius - Radius of the base
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Cone mesh with label property
     */
    cone3d(apex, baseCenter, radius, label = '', color = 0x44ff44, options = {}) {
        const coneMesh = native.cone(apex, baseCenter, radius, {
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(coneMesh);
        this.objects.push(coneMesh);

        if (label) {
            const midpoint = this._midpoint(apex, baseCenter);
            this._addLabel(coneMesh, midpoint, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return coneMesh;
    }

    /**
     * Create a 3D torus
     * @param {Object} center - Center position {x, y, z}
     * @param {number} radius - Main radius (distance from center to tube center)
     * @param {number} tubeRadius - Radius of the tube
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Torus mesh with label property
     */
    torus3d(center, radius, tubeRadius, label = '', color = 0xffaa00, options = {}) {
        const torusMesh = native.torus(center, radius, tubeRadius, {
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(torusMesh);
        this.objects.push(torusMesh);

        if (label) {
            this._addLabel(torusMesh, center, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return torusMesh;
    }

    /**
     * Create a 3D prism
     * @param {Object} baseCenter - Base center position {x, y, z}
     * @param {number} sides - Number of sides (3=triangular, 4=square, 6=hexagonal, etc.)
     * @param {number} height - Height of the prism
     * @param {number} baseRadius - Radius of the base
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Prism mesh with label property
     */
    prism3d(baseCenter, sides, height, baseRadius, label = '', color = 0x44ff88, options = {}) {
        const prismMesh = native.prism(baseCenter, sides, height, {
            baseRadius: baseRadius,
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(prismMesh);
        this.objects.push(prismMesh);

        if (label) {
            const labelPos = {
                x: baseCenter.x,
                y: baseCenter.y + height / 2,  // RHS: Y is up
                z: baseCenter.z
            };
            this._addLabel(prismMesh, labelPos, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return prismMesh;
    }

    /**
     * Create a 3D frustum (truncated pyramid/cone)
     * @param {Object} baseCenter - Base center position {x, y, z}
     * @param {Object} topCenter - Top center position {x, y, z}
     * @param {number} baseRadius - Radius of the base
     * @param {number} topRadius - Radius of the top
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Frustum mesh with label property
     */
    frustum3d(baseCenter, topCenter, baseRadius, topRadius, label = '', color = 0xff8844, options = {}) {
        const frustumMesh = native.frustum(baseCenter, topCenter, baseRadius, topRadius, {
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(frustumMesh);
        this.objects.push(frustumMesh);

        if (label) {
            const midpoint = this._midpoint(baseCenter, topCenter);
            this._addLabel(frustumMesh, midpoint, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return frustumMesh;
    }

    /**
     * Create a 3D pyramid
     * @param {Object} position - Base center position {x, y, z}
     * @param {number} sides - Number of sides (3=triangular, 4=square, etc.)
     * @param {number} height - Height of the pyramid
     * @param {number} size - Base size/radius
     * @param {string} label - Optional label
     * @param {number|string} color - Color (hex or string)
     * @param {Object} options - Additional options
     * @returns {Object} Pyramid mesh with label property
     */
    pyramid3d(position, sides, height, size, label = '', color = 0xffaa44, options = {}) {
        // Default orientation is upward (Y axis in RHS coordinates)
        const orientation = options.orientation || { x: 0, y: 1, z: 0 };

        const pyramidMesh = native.pyramid(position, sides, height, size, orientation, {
            color: this.parseColor(color),
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        });

        this.scene.add(pyramidMesh);
        this.objects.push(pyramidMesh);

        if (label) {
            const labelPos = {
                x: position.x,
                y: position.y + height / 2,  // RHS: Y is up
                z: position.z
            };
            this._addLabel(pyramidMesh, labelPos, label, {
                labelOffset: options.labelOffset || { x: 0.3, y: 0.3, z: 0 }
            });
        }

        return pyramidMesh;
    }
}

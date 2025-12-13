/**
 * LHS3DDiagram - Left-Hand System 3D Diagram
 * Provides a clean API using {x, y, z} objects while delegating to lhs files
 * Uses LHS coordinate convention: X right, Y forward, Z up
 */
import { BaseDiagram3D } from './base_diagram_3d.js';
import { point as lhsPoint } from './lhs/lhs_point.js';
import { vector as lhsVector, dashedVector as lhsDashedVector, unitVector as lhsUnitVector } from './lhs/lhs_vector.js';
import { line as lhsLine } from './lhs/lhs_line.js';
import { plane as lhsPlane } from './lhs/lhs_plane.js';
import { polygon as lhsPolygon } from './lhs/lhs_polygon.js';
import { parallelogram as lhsParallelogram } from './lhs/lhs_parallelogram.js';
import { parametricCurve as lhsCurve } from './lhs/lhs_curve.js';
import { cuboid as lhsCuboid } from './lhs/lhs_cuboid.js';
import { boxProduct as lhsBoxProduct } from './lhs/lhs_extrude.js';
import { arc as lhsAngleArc, arcByThreePoints as lhsArcByThreePoints } from './lhs/lhs_angle_arc.js';
import { sector as lhsAngleSector } from './lhs/lhs_angle_sector.js';
import { rightAngle as lhsRightAngle } from './lhs/lhs_right_angle.js';
import { label as createTextLabel } from './lhs/lhs_label.js';
import { dashedThickLine as lhsDashedLine } from './lhs/lhs_line.js';
import { measurementIndicator as lhsMeasurementIndicator } from './lhs/lhs_measurement_indicator.js';
import * as geoUtils from './geo3d_utils.js';
import { clearAll, hideAll, showAll } from './lifecycle_utils.js';

export class LHS3DDiagram extends BaseDiagram3D {
    constructor(scene, effectsManager = null) {
        super(scene, effectsManager);
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
        const vectorGroup = lhsDashedVector(start, end, {
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
     * Create a 3D point
     * @param {Object} position - Position {x, y, z}
     * @param {string} label - Optional label for the point
     * @param {number|string} color - Color (hex or string like 'red')
     * @param {Object} options - Additional options
     * @returns {Object} Point mesh with label property
     */
    point3d(position, label = '', color = 0xff0000, options = {}) {
        const pointMesh = lhsPoint(position, {
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
        const segmentGroup = lhsLine(start, end, {
            color: this.parseColor(color),
            radius: options.radius || 0.02,
            ...options
        });
        
        // Add to scene
        this.scene.add(segmentGroup);
        this.objects.push(segmentGroup);
        
        // Add label at midpoint if provided
        if (label) {
            const midpoint = geoUtils.midpoint(start, end);
            const labelMesh = this.label(midpoint, label, {
                color: '#000000',
                offset: options.labelOffset || { x: 0, y: 0.3, z: 0 }
            });
            segmentGroup.label = labelMesh;
        }
        
        return segmentGroup;
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
        const vectorGroup = lhsVector(start, end, {
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
            addAsChild: true  // Vector labels are added as children
        });
        
        return vectorGroup;
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
        const lineGroup = lhsLine(point1, point2, {
            color: this.parseColor(color),
            length: options.length || 20,
            radius: options.radius || 0.02,
            ...options
        });
        
        // Add to scene
        this.scene.add(lineGroup);
        this.objects.push(lineGroup);
        
        // Add label if provided
        this._addLabel(lineGroup, geoUtils.midpoint(point1, point2), label, {
            labelOffset: options.labelOffset
        });
        
        return lineGroup;
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
        const planeMesh = lhsPlane(point, normal, {
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
        // Calculate normal using geo_utils
        const normal = geoUtils.planeNormalFromThreePoints(p1, p2, p3);
        
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
        const polygonMesh = lhsPolygon(vertices, {
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
     * Create a parallelogram from two coterminal vectors
     * @param {Object} origin - Common starting point {x, y, z}
     * @param {Object} vector1End - End point of first vector {x, y, z}
     * @param {Object} vector2End - End point of second vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Parallelogram mesh with label property
     */
    parallelogram(origin, vector1End, vector2End, label = '', color = 0x4444ff, options = {}) {
        const parallelogramMesh = lhsParallelogram(origin, vector1End, vector2End, {
            color: this.parseColor(color),
            opacity: options.opacity || 0.5,
            showEdges: options.showEdges !== false, // Default true
            edgeColor: options.edgeColor ? this.parseColor(options.edgeColor) : 0x000000,
            ...options
        });
        
        // Add to scene
        this.scene.add(parallelogramMesh);
        this.objects.push(parallelogramMesh);
        
        // Add label at centroid if provided
        if (label) {
            // Use utility function for cleaner centroid calculation
            const centroid = geoUtils.parallelogramCentroid(origin, vector1End, vector2End);
            
            this._addLabel(parallelogramMesh, centroid, label, {
                labelOffset: options.labelOffset
            });
        }
        
        return parallelogramMesh;
    }
    
    /**
     * Create a box product (scalar triple product) volume visualization
     * Volume = |a · (b × c)|
     * @param {Object} vectorA - First vector {x, y, z}
     * @param {Object} vectorB - Second vector {x, y, z}
     * @param {Object} vectorC - Third vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Volume group with label property
     */
    boxProduct(vectorA, vectorB, vectorC, label = '', color = 0x4444ff, options = {}) {
        const volumeGroup = lhsBoxProduct(vectorA, vectorB, vectorC, {
            color: this.parseColor(color),
            opacity: options.opacity || 0.6,
            showEdges: options.showEdges !== false,
            edgeColor: options.edgeColor ? this.parseColor(options.edgeColor) : 0x000000,
            ...options
        });
        
        // Add to scene
        this.scene.add(volumeGroup);
        this.objects.push(volumeGroup);
        
        // Add label if provided
        if (label) {
            // Calculate centroid of the parallelepiped
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
     * Create a parametric curve
     * @param {Function} curveFunction - Function that takes t and returns {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including tMin, tMax, segments
     * @returns {Object} Curve mesh with label property
     */
    curve(curveFunction, label = '', color = 0x0000ff, options = {}) {
        const curveMesh = lhsCurve(curveFunction, {
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
     * Create a cuboid (box) from two corner points
     * @param {Object} corner1 - First corner {x, y, z}
     * @param {Object} corner2 - Opposite corner {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options
     * @returns {Object} Cuboid group with label property
     */
    cuboid(corner1, corner2, label = '', color = 0x4488ff, options = {}) {
        const cuboidGroup = lhsCuboid(corner1, corner2, {
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
     * Create an angle arc between two vectors
     * @param {Object} startVector - Start vector {x, y, z}
     * @param {Object} endVector - End vector {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including radius
     * @returns {Object} Angle arc mesh with label property
     */
    angleArc(startVector, endVector, label = '', color = 0x00ff00, options = {}) {
        const arcMesh = lhsAngleArc(startVector, endVector, {
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
            const middle = geoUtils.normalize(geoUtils.addVectors(start, end));
            const radius = options.radius || 1.0;
            
            // Store the angle center on the mesh object
            arcMesh.angleCenter = geoUtils.scaleVector(middle, radius * 0.5);
            
            // Add label if provided
            const labelPosition = geoUtils.scaleVector(middle, radius * 1.2);
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
        const sectorMesh = lhsAngleSector(startVector, endVector, {
            color: this.parseColor(color),
            radius: options.radius || 1.0,
            opacity: options.opacity || 0.5,
            ...options
        });
        
        if (sectorMesh) {
            // Add to scene
            this.scene.add(sectorMesh);
            this.objects.push(sectorMesh);
            
            // Calculate and store angle center for label positioning
            const start = geoUtils.normalize(startVector);
            const end = geoUtils.normalize(endVector);
            const middle = geoUtils.normalize(geoUtils.addVectors(start, end));
            const radius = options.radius || 1.0;
            
            // Store the angle center on the mesh object
            sectorMesh.angleCenter = geoUtils.scaleVector(middle, radius * 0.5);
            
            // Add label if provided
            const labelPosition = geoUtils.scaleVector(middle, radius * 0.6);
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
        const arcGroup = lhsArcByThreePoints(point1, vertex, point2, {
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
                const v1 = geoUtils.normalize(geoUtils.subtractVectors(point1, vertex));
                const v2 = geoUtils.normalize(geoUtils.subtractVectors(point2, vertex));
                const middle = geoUtils.normalize(geoUtils.addVectors(v1, v2));
                const radius = options.radius || 1.0;
                const labelPos = geoUtils.addVectors(vertex, geoUtils.scaleVector(middle, radius * 0.6));
                
                this._addLabel(arcGroup, labelPos, label, {
                    labelOffset: options.labelOffset || { x: 0, y: 0, z: 0 }
                });
            }
        }
        
        return arcGroup;
    }
    
    /**
     * Add a label at the center of an angle arc or sector
     * @param {Object} angleObj - The angle arc or sector object
     * @param {string} label - Label text
     * @param {number|string} color - Color of the label
     * @param {Object} options - Additional label options
     * @returns {Object} Label mesh or null if angleObj has no angleCenter
     */
    angleLabel(angleObj, label = '', color = 0x000000, options = {}) {
        // If no angleCenter, return null silently (angleObj might not be an angle object)
        if (!angleObj?.angleCenter) {
            return null;
        }
        
        // Use the stored angle center position
        const labelMesh = this.label(angleObj.angleCenter, label, {
            color: this.parseColor(color),
            fontSize: options.fontSize || 24,
            offset: options.offset || { x: 0, y: 0, z: 0 },
            ...options
        });
        
        // Store label reference on angle object
        if (labelMesh) {
            angleObj.label = labelMesh;
        }
        
        return labelMesh;
    }
    
    /**
     * Create a right angle marker (square corner) between two perpendicular lines
     * @param {Object} point1 - First point {x, y, z}
     * @param {Object} vertex - Vertex where the right angle is located {x, y, z}
     * @param {Object} point2 - Second point {x, y, z}
     * @param {string} label - Optional label (typically empty or '90°')
     * @param {number|string} color - Color of the marker
     * @param {Object} options - Additional options
     * @returns {Object} Right angle marker group with label property
     */
    rightAngleMarker(point1, vertex, point2, label = '', color = 0xff6600, options = {}) {
        const markerGroup = lhsRightAngle(point1, vertex, point2, {
            color: this.parseColor(color),
            size: options.size || 0.4,  // Smaller, more reasonable size
            filled: options.filled !== false,
            outline: options.outline !== false,
            fillOpacity: options.fillOpacity || 0.7,  // Less transparent, more solid
            tubeRadius: options.tubeRadius || 0.03,  // Thinner but still visible
            ...options
        });
        
        // Add to scene
        this.scene.add(markerGroup);
        this.objects.push(markerGroup);
        
        // Add label if provided (positioned at the corner of the square)
        if (label) {
            // Calculate position for label - slightly offset from the right angle corner
            const v1 = geoUtils.normalize(geoUtils.vectorFromPoints(vertex, point1));
            const v2 = geoUtils.normalize(geoUtils.vectorFromPoints(vertex, point2));
            const size = options.size || 0.3;
            
            // Position at the diagonal of the square
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
     * Create a dashed line between two points
     * @param {Object} start - Start point {x, y, z}
     * @param {Object} end - End point {x, y, z}
     * @param {string} label - Optional label
     * @param {number|string} color - Color
     * @param {Object} options - Additional options including dash size, gap size, etc.
     * @returns {Object} Dashed line group with label property
     */
    dashedLine3d(start, end, label = '', color = 0xff1493, options = {}) {
        const dashedLineGroup = lhsDashedLine(start, end, {
            color: this.parseColor(color),
            dashSize: options.dashSize || 0.2,
            gapSize: options.gapSize || 0.1,
            radius: options.radius || 0.025,
            ...options
        });
        
        // Add to scene
        this.scene.add(dashedLineGroup);
        this.objects.push(dashedLineGroup);
        
        // Add label at midpoint if provided
        if (label) {
            const midpoint = geoUtils.midpoint(start, end);
            const labelMesh = this.label(midpoint, label, {
                color: '#000000',
                offset: options.labelOffset || { x: 0, y: 0.3, z: 0 }
            });
            dashedLineGroup.label = labelMesh;
        }
        
        return dashedLineGroup;
    }
    
    /**
     * Create a parallel vector indicator showing two vectors are parallel
     * @param {Object} from - Start point of the vector {x, y, z}
     * @param {Object} to - End point of the vector {x, y, z}
     * @param {Object} offset - Offset vector to position the indicator parallel to original {x, y, z}
     * @param {string} label - Optional label for the indicator
     * @param {number|string} color - Color of the indicator
     * @param {Object} options - Additional options
     * @returns {Object} Parallel indicator group with label property
     */
    parallelVectorIndicator(from, to, offset, label = '', color = 0x808080, options = {}) {
        // Calculate the offset positions
        const offsetFrom = geoUtils.addVectors(from, offset);
        const offsetTo = geoUtils.addVectors(to, offset);
        
        // Just call vector with the offset positions - no special handling needed
        return this.vector(offsetFrom, offsetTo, label, color, {
            headPosition: 'middle',  // Arrow at middle for parallel indicator
            ...options
        });
    }
    
    /**
     * Internal label creation (doesn't add to objects array)
     * @private
     */
    _createLabel(position, text, options = {}) {
        // Pass position and offset separately to the label function
        const label = createTextLabel(text, position, {
            fontSize: options.fontSize || 28,
            color: '#000000',  // ALWAYS black, no exceptions
            scale: options.scale || 0.025,  // Use the same default as lhs_label.js
            isLatex: options.isLatex || false,  // Pass through isLatex option
            offset: options.offset || { x: 0.3, y: 0.3, z: 0 }  // Default offset
        });
        
        if (label) {
            // Check if it's a Sprite (has material) or CSS2DObject (doesn't have material)
            if (label.material) {
                // It's a Sprite - make label always visible through geometry
                label.material.depthTest = false;   // Don't test depth (always visible)
                label.material.depthWrite = false;  // Don't write to depth buffer
            }
            // Don't add to any group here - let the caller handle it
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
            this.scene.add(label);  // Add directly to scene for standalone labels
            this.objects.push(label);
        }
        return label;
    }
    
    // parseColor() is inherited from BaseDiagram3D

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

    // getObjects() is inherited from BaseDiagram3D

    /**
     * Trace vector path - empty implementation in base Diagram class
     * (Static traces don't make sense - animation only)
     * @param {Object} directPath - Direct path from start to end {start: {x,y,z}, end: {x,y,z}}
     * @param {Array} vectorPairs - Array of vector pairs [{start: {x,y,z}, end: {x,y,z}}, ...]
     * @param {Object} options - Animation options (ignored in base class)
     * @returns {null} Returns null in base implementation
     */
    traceVectorPath(_directPath, _vectorPairs, _options = {}) {
        // No-op in base Diagram class - only AnimatedDiagram implements this
    }
    
    /**
     * Helper method to add a label to an object
     * @private
     * @param {Object} object - The object to add label to
     * @param {Object} position - Label position {x, y, z}
     * @param {string} labelText - The label text
     * @param {Object} options - Additional options
     */
    _addLabel(object, position, labelText, options = {}) {
        if (!labelText) return;
        
        // Determine if we should use _createLabel (for adding as child) or label (for scene)
        const createMethod = options.addAsChild ? '_createLabel' : 'label';
        
        const labelMesh = this[createMethod](position, labelText, {
            // ALWAYS use black for labels - no exceptions
            color: '#000000',
            offset: options.labelOffset || { x: 0, y: 0.3, z: 0 },
            isLatex: options.isLatex !== false ? 
                (labelText.includes('$') || labelText.includes('\\')) : false,
            fontSize: options.fontSize || 16,
            addAsChild: options.addAsChild
        });
        
        if (labelMesh && options.addAsChild) {
            object.add(labelMesh);  // Add as child to the object
        }
        
        object.label = labelMesh;
        return labelMesh;
    }
    
    // _midpoint() is inherited from BaseDiagram3D

    /**
     * Create a reversed vector (pointing in opposite direction)
     * @param {Object} vectorObj - The vector object to reverse (must have start and end properties)
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
        
        // The reversed vector has:
        // - Same tail (start point) as original
        // - Head pointing in opposite direction
        const reversedEnd = {
            x: originalStart.x - displacement.x,
            y: originalStart.y - displacement.y,
            z: originalStart.z - displacement.z
        };
        
        // Create reversed vector using dashed style
        const reversedVector = lhsDashedVector(originalStart, reversedEnd, {
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
     * Creates a dashed vector at a new position (non-animated version)
     * @param {Object} vector - Object with {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} newStart - New starting position {x, y, z}
     * @param {Object} options - Additional options for the vector
     * @returns {Object} The dashed vector at the new position
     */
    moveVector(vector, newStart, options = {}) {
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
        const dashedVector = lhsDashedVector(newStart, newEnd, {
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
     * Move a vector forward along its direction (empty stub - implemented in AnimatedDiagram)
     * @param {Object} vectorObj - The vector object to move forward
     * @param {number} scalar - The scalar amount to move forward (default 1 = one vector length)
     * @param {Object} options - Additional options for the animation
     * @returns {Object} The vector object (unchanged in base implementation)
     */
    forwardVector(vectorObj, _scalar = 1, _options = {}) {
        // Empty stub - only works in AnimatedDiagram
        // Static diagrams don't animate vectors
        return vectorObj;
    }

    /**
     * Move a vector backward along its direction (empty stub - implemented in AnimatedDiagram)
     * @param {Object} vectorObj - The vector object to move backward
     * @param {number} scalar - The scalar amount to move backward (default 1 = one vector length)
     * @param {Object} options - Additional options for the animation
     * @returns {Object} The vector object (unchanged in base implementation)
     */
    backwardVector(vectorObj, _scalar = 1, _options = {}) {
        // Empty stub - only works in AnimatedDiagram
        // Static diagrams don't animate vectors
        return vectorObj;
    }
    
    /**
     * Create a dot projection visualization showing the projection of one vector onto another
     * @param {Object} vector - The vector to project {start: {x,y,z}, end: {x,y,z}}
     * @param {Object} projectedOntoVector - The vector to project onto {start: {x,y,z}, end: {x,y,z}}
     * @param {string} label - Optional label for the projection distance
     * @param {number|string} color - Color for the projection indicator
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
        
        // Normalize v2 (the vector we're projecting onto)
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
        
        // Calculate offset perpendicular to the projection direction
        // The offset should be away from vector v to avoid overlap
        
        // First, get the perpendicular to the projection plane formed by v1 and v2
        // This is the cross product of v1 and v2
        const crossProduct = {
            x: v1.y * v2Normalized.z - v1.z * v2Normalized.y,
            y: v1.z * v2Normalized.x - v1.x * v2Normalized.z,
            z: v1.x * v2Normalized.y - v1.y * v2Normalized.x
        };
        
        // Now find a perpendicular to v2 that lies in the plane of v1 and v2
        // This is the cross product of the above cross product with v2
        let offsetVector = {
            x: crossProduct.y * v2Normalized.z - crossProduct.z * v2Normalized.y,
            y: crossProduct.z * v2Normalized.x - crossProduct.x * v2Normalized.z,
            z: crossProduct.x * v2Normalized.y - crossProduct.y * v2Normalized.x
        };
        
        // If the cross product is too small (vectors are parallel), use a default perpendicular
        const offsetLength = Math.sqrt(offsetVector.x * offsetVector.x + 
                                      offsetVector.y * offsetVector.y + 
                                      offsetVector.z * offsetVector.z);
        
        if (offsetLength < 0.001) {
            // Vectors are nearly parallel, find any perpendicular
            if (Math.abs(v2Normalized.y) < 0.9) {
                offsetVector = {
                    x: -v2Normalized.z,
                    y: 0,
                    z: v2Normalized.x
                };
            } else {
                offsetVector = {
                    x: 0,
                    y: -v2Normalized.z,
                    z: v2Normalized.y
                };
            }
        }
        
        // Normalize the offset vector
        const newOffsetLength = Math.sqrt(offsetVector.x * offsetVector.x + 
                                         offsetVector.y * offsetVector.y + 
                                         offsetVector.z * offsetVector.z);
        if (newOffsetLength > 0.001) {
            const offsetScale = (options.offsetDistance || 0.2) / newOffsetLength;
            offsetVector.x *= offsetScale;
            offsetVector.y *= offsetScale;
            offsetVector.z *= offsetScale;
        }
        
        // Check if we need to flip the offset direction
        // The offset should point away from v1 to avoid overlap
        const dotWithV1 = offsetVector.x * v1.x + offsetVector.y * v1.y + offsetVector.z * v1.z;
        if (dotWithV1 > 0) {
            // Flip the offset to point away from v1
            offsetVector.x = -offsetVector.x;
            offsetVector.y = -offsetVector.y;
            offsetVector.z = -offsetVector.z;
        }
        
        // Create measurement indicator with offset
        const indicator = lhsMeasurementIndicator(
            projectedOntoVector.start,
            projectionEnd,
            {
                color: this.parseColor(color),
                mainRadius: options.mainRadius || 0.03,
                markerRadius: options.markerRadius || 0.02,
                markerLength: options.markerLength || 0.2,
                label: label,
                offset: offsetVector,
                ...options
            }
        );
        
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
     * Focus on specific objects (empty stub - implemented in AnimatedDiagram)
     * @param {Array} objectsToFocus - Array of objects to focus on
     * @param {number} unfocusedOpacity - Opacity for unfocused objects
     * @param {number} duration - Animation duration
     */
    focus(_objectsToFocus, _unfocusedOpacity, _duration) {
        // Empty stub - only works in AnimatedDiagram
        // Static diagrams don't need focus effects
        // Parameters are here for API compatibility with AnimatedDiagram
    }
    
    
    /**
     * Restore all objects from any active effects (empty stub - implemented in AnimatedDiagram)
     */
    restore() {
        // Empty stub - only works in AnimatedDiagram
        // Static diagrams don't need restore effects
    }
}
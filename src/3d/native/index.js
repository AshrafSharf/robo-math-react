/**
 * Native 3D API - Barrel Export
 * Consolidates all native Three.js-based 3D shape creation functions
 * Uses Right-Hand System (RHS) coordinates natively
 */

// Point
export { point } from './point.js';

// Lines
export { line, thinLine } from './line.js';

// Vectors
export { vector, dashedVector, positionVector, unitVector } from './vector.js';

// Plane
export { plane } from './plane.js';

// Polygons
export { polygon, parallelogram } from './polygon.js';

// Cuboid
export { cuboid, wireframeCuboid, boundingBoxCuboid } from './cuboid.js';

// Curves
export { parametricCurve, parametricTube } from './curve.js';

// Surface
export { surface, parametricSurface } from './surface.js';

// Angles - Arcs
export { arc, arcByThreePoints } from './angle_arc.js';

// Angles - Sectors
export { sector, sectorByThreePoints } from './angle_sector.js';

// Right Angle
export { rightAngle } from './right_angle.js';

// Labels
export { label } from './label.js';

// 3D Primitives
export {
    sphere,
    cylinder,
    cube,
    cone,
    torus,
    prism,
    frustum,
    disk,
    pyramid
} from './3d_primitives.js';

// Geometry Utilities
export * from './geometry_utils.js';

// Materials
export * from './materials.js';

// Coordinate System
export { coordinateSystem } from './coordinate_system.js';

// Point Projection
export { pointProjection } from './point_projection.js';

// Tangent Plane
export { tangentPlane } from './tangent_plane.js';

// Disk Stack
export { diskStack } from './disk_stack.js';

// Shaded Region
export { shadedRegion } from './shaded_region.js';

// Shell Region
export { shellRegion } from './shell_region.js';

// Solid of Revolution
export { solidOfRevolution } from './solid_of_revolution.js';

// X-Axis Lathe
export { xAxisLathe } from './x_axis_lathe.js';

// Washer Lathe
export { createWasherSolid, singleWasher, washerStack, extractedWasher } from './washer_lathe.js';

// Measurement Indicator
export { measurementIndicator } from './measurement_indicator.js';

// Cleanup utilities
export { cleanupObjects, removeSingleObject } from './cleanup.js';

// Inspect utilities
export { getDiskFromStack, getDiskMetadata } from './inspect_3d.js';
export { inspectDisk, inspectDiskFromStack } from './inspect_disk.js';

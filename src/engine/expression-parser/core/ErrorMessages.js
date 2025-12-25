/**
 * User-friendly error messages for expressions
 *
 * Format: Max 2 lines, ~5 words per line
 * Use template functions for parameterized values
 */

// ============= Common Error Messages =============

export const common_error_messages = {
  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,

  GRAPH_NOT_FOUND: (varName) =>
    `Graph '${varName}' not found.\nCreate graph with g2d() first.`,

  GRAPH_REQUIRED: (funcName) =>
    `${funcName}() needs a graph.\nFirst argument must be graph.`,

  INVALID_GRAPH_TYPE: (varName) =>
    `'${varName}' is not a graph.\nFirst arg needs g2d() variable.`,

  GRAPH_NOT_INITIALIZED: (varName) =>
    `'${varName}' is not a graph.\nFirst arg needs g2d() variable.`,
};

// ============= Line Error Messages =============

export const line_error_messages = {
  MISSING_ARGS: () =>
    `line() needs 5 arguments.\nUsage: line(g, x1, y1, x2, y2)`,

  WRONG_COORD_COUNT: (count) =>
    `line() got ${count} coordinates.\nNeed exactly 4: x1, y1, x2, y2`,

  INVALID_GRAPH: (varName) =>
    `'${varName}' is not a graph.\nline(graph, x1, y1, x2, y2)`,
};

// ============= Point Error Messages =============

export const point_error_messages = {
  MISSING_ARGS: () =>
    `point() needs 3 arguments.\nUsage: point(g, x, y)`,

  WRONG_COORD_COUNT: (count) =>
    `point() got ${count} coordinates.\nNeed exactly 2: x, y`,

  INVALID_GRAPH: (varName) =>
    `'${varName}' is not a graph.\npoint(graph, x, y)`,

  DIVIDE_BY_POINT: () =>
    `Cannot divide point by point.\nUse a number instead.`,

  MULTIPLY_BY_POINT: () =>
    `Cannot multiply point by point.\nUse a number instead.`,

  POWER_NOT_SUPPORTED: () =>
    `Power not supported for points.\nUse multiply instead.`,
};

// ============= Point3D Error Messages =============

export const point3d_error_messages = {
  MISSING_ARGS: () =>
    `point3d() needs 4 arguments.\nUsage: point3d(g, x, y, z)`,

  WRONG_COORD_COUNT: (count) =>
    `point3d() got ${count} coordinates.\nNeed exactly 3: x, y, z`,

  GRAPH_REQUIRED: () =>
    `point3d() needs a g3d graph.\nFirst argument must be g3d.`,

  DIVIDE_BY_POINT: () =>
    `Cannot divide point3d by point3d.\nUse a number instead.`,

  MULTIPLY_BY_POINT: () =>
    `Cannot multiply point3d by point3d.\nUse a number instead.`,

  POWER_NOT_SUPPORTED: () =>
    `Power not supported for point3d.\nUse multiply instead.`,
};

// ============= Line3D Error Messages =============

export const line3d_error_messages = {
  MISSING_ARGS: () =>
    `line3d() needs 7 arguments.\nUsage: line3d(g, x1,y1,z1, x2,y2,z2)`,

  WRONG_COORD_COUNT: (count) =>
    `line3d() got ${count} coordinates.\nNeed exactly 6: x1,y1,z1,x2,y2,z2`,

  GRAPH_REQUIRED: () =>
    `line3d() needs a g3d graph.\nFirst argument must be g3d.`,
};

// ============= Vector3D Error Messages =============

export const vector3d_error_messages = {
  MISSING_ARGS: () =>
    `vector3d() needs 7 arguments.\nUsage: vector3d(g, x1,y1,z1, x2,y2,z2)`,

  WRONG_COORD_COUNT: (count) =>
    `vector3d() got ${count} coordinates.\nNeed exactly 6: x1,y1,z1,x2,y2,z2`,

  GRAPH_REQUIRED: () =>
    `vector3d() needs a g3d graph.\nFirst argument must be g3d.`,
};

// ============= Sphere3D Error Messages =============

export const sphere3d_error_messages = {
  MISSING_ARGS: () =>
    `sphere3d() needs 5 arguments.\nUsage: sphere3d(g, radius, x, y, z)`,

  WRONG_COORD_COUNT: (count) =>
    `sphere3d() got ${count} coordinates.\nNeed exactly 3: x, y, z`,

  GRAPH_REQUIRED: () =>
    `sphere3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_RADIUS: () =>
    `sphere3d() radius must be a single number.`,
};

// ============= Cylinder3D Error Messages =============

export const cylinder3d_error_messages = {
  MISSING_ARGS: () =>
    `cylinder() needs at least 4 arguments.\nUsage: cylinder(g, r, h, x,y,z) or cylinder(g, r, x1,y1,z1, x2,y2,z2)`,

  WRONG_COORD_COUNT: (count) =>
    `cylinder() got ${count} values after radius.\nNeed 4 (height + center) or 6 (two points).`,

  GRAPH_REQUIRED: () =>
    `cylinder() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_RADIUS: () =>
    `cylinder() radius must be a single number.`,

  INVALID_HEIGHT: () =>
    `cylinder() height must be a single number.`,
};

// ============= Cube3D Error Messages =============

export const cube3d_error_messages = {
  MISSING_ARGS: () =>
    `cube3d() needs 5 arguments.\nUsage: cube3d(g, size, x, y, z)`,

  WRONG_COORD_COUNT: (count) =>
    `cube3d() got ${count} coordinates.\nNeed exactly 3: x, y, z`,

  GRAPH_REQUIRED: () =>
    `cube3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_SIZE: () =>
    `cube3d() size must be a single number.`,
};

// ============= Cone3D Error Messages =============

export const cone3d_error_messages = {
  MISSING_ARGS: () =>
    `cone3d() needs 8 arguments.\nUsage: cone3d(g, radius, ax,ay,az, bx,by,bz)`,

  WRONG_COORD_COUNT: (count) =>
    `cone3d() got ${count} coordinates.\nNeed exactly 6: apex(3) + base(3)`,

  GRAPH_REQUIRED: () =>
    `cone3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_RADIUS: () =>
    `cone3d() radius must be a single number.`,
};

// ============= Torus3D Error Messages =============

export const torus3d_error_messages = {
  MISSING_ARGS: () =>
    `torus3d() needs 6 arguments.\nUsage: torus3d(g, radius, tubeRadius, x, y, z)`,

  WRONG_COORD_COUNT: (count) =>
    `torus3d() got ${count} coordinates.\nNeed exactly 3: x, y, z`,

  GRAPH_REQUIRED: () =>
    `torus3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_RADIUS: () =>
    `torus3d() radius must be a single number.`,

  INVALID_TUBE_RADIUS: () =>
    `torus3d() tubeRadius must be a single number.`,
};

// ============= Prism3D Error Messages =============

export const prism3d_error_messages = {
  MISSING_ARGS: () =>
    `prism3d() needs 8 arguments.\nUsage: prism3d(g, sides, height, baseRadius, x, y, z)`,

  WRONG_COORD_COUNT: (count) =>
    `prism3d() got ${count} coordinates.\nNeed exactly 3: x, y, z`,

  GRAPH_REQUIRED: () =>
    `prism3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_SIDES: () =>
    `prism3d() sides must be a single number.`,

  INVALID_HEIGHT: () =>
    `prism3d() height must be a single number.`,

  INVALID_RADIUS: () =>
    `prism3d() baseRadius must be a single number.`,
};

// ============= Frustum3D Error Messages =============

export const frustum3d_error_messages = {
  MISSING_ARGS: () =>
    `frustum3d() needs 9 arguments.\nUsage: frustum3d(g, baseR, topR, x1,y1,z1, x2,y2,z2)`,

  WRONG_COORD_COUNT: (count) =>
    `frustum3d() got ${count} coordinates.\nNeed exactly 6: base(3) + top(3)`,

  GRAPH_REQUIRED: () =>
    `frustum3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_BASE_RADIUS: () =>
    `frustum3d() baseRadius must be a single number.`,

  INVALID_TOP_RADIUS: () =>
    `frustum3d() topRadius must be a single number.`,
};

// ============= Pyramid3D Error Messages =============

export const pyramid3d_error_messages = {
  MISSING_ARGS: () =>
    `pyramid3d() needs 8 arguments.\nUsage: pyramid3d(g, sides, height, size, x, y, z)`,

  WRONG_COORD_COUNT: (count) =>
    `pyramid3d() got ${count} coordinates.\nNeed exactly 3: x, y, z`,

  GRAPH_REQUIRED: () =>
    `pyramid3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_SIDES: () =>
    `pyramid3d() sides must be a single number.`,

  INVALID_HEIGHT: () =>
    `pyramid3d() height must be a single number.`,

  INVALID_SIZE: () =>
    `pyramid3d() size must be a single number.`,
};

// ============= Plane3D Error Messages =============

export const plane3d_error_messages = {
  MISSING_ARGS: () =>
    `plane3d() needs at least 2 arguments.\nUsage: plane3d(g, point, normal) or plane3d(g, p1, p2, p3) or plane3d(g, a, b, c, d) or plane3d(g, "equation")`,

  GRAPH_REQUIRED: () =>
    `plane3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_SYNTAX: () =>
    `plane3d() unrecognized argument pattern.\nUse: point+normal, 3 points, 4 coefficients, 2 vectors+point, or equation string.`,

  INVALID_EQUATION: (eq) =>
    `Cannot parse plane equation: "${eq}".\nUse format "x + 2y - z = 5" or "1, 2, -1, 5"`,

  COLLINEAR_POINTS: () =>
    `Three points are collinear - cannot form a unique plane.`,

  PARALLEL_VECTORS: () =>
    `Two vectors are parallel - cannot form a unique plane.`,

  ZERO_NORMAL: () =>
    `Normal vector cannot be zero.`,
};

// ============= Polygon3D Error Messages =============

export const polygon3d_error_messages = {
  MISSING_ARGS: () =>
    `polygon3d() needs at least 4 arguments.\nUsage: polygon3d(g, p1, p2, p3, ...)`,

  GRAPH_REQUIRED: () =>
    `polygon3d() needs a g3d graph.\nFirst argument must be g3d.`,

  INVALID_VERTEX: (index) =>
    `polygon3d() argument ${index + 1} must be a point3d.`,

  MIN_VERTICES: () =>
    `polygon3d() needs at least 3 vertices to form a polygon.`,
};

// ============= Circle Error Messages =============

export const circle_error_messages = {
  MISSING_ARGS: () =>
    `circle() needs at least radius.\nUsage: circle(r) or circle(r, x, y) or circle(r, point)`,

  WRONG_COORD_COUNT: (count) =>
    `circle() got ${count} values.\nNeed 1 (radius) or 3 (radius, x, y)`,

  INVALID_GRAPH: (varName) =>
    `'${varName}' is not a graph.\ncircle(g, r) or circle(g, r, x, y)`,
};

// ============= Vector Error Messages =============

export const vector_error_messages = {
  MISSING_ARGS: () =>
    `vector() needs 5 arguments.\nUsage: vector(g, x1, y1, x2, y2)`,

  WRONG_COORD_COUNT: (count) =>
    `vector() got ${count} coordinates.\nNeed exactly 4: x1, y1, x2, y2`,

  GRAPH_REQUIRED: () =>
    `vector() needs a graph.\nFirst argument must be graph.`,

  INVALID_GRAPH: (varName) =>
    `'${varName}' is not a graph.\nvector(graph, x1, y1, x2, y2)`,
};

// ============= Polygon Error Messages =============

export const polygon_error_messages = {
  MISSING_ARGS: () =>
    `polygon() needs more points.\nAt least 3 points required.`,

  WRONG_COORD_COUNT: (count) =>
    `polygon() got ${count} values.\nNeed pairs: x1,y1, x2,y2, ...`,

  ODD_COORDINATES: (count) =>
    `polygon() got odd count: ${count}.\nCoordinates must be in pairs.`,

  INVALID_GRAPH: (varName) =>
    `'${varName}' is not a graph.\npolygon(graph, x1,y1, x2,y2, ...)`,
};

// ============= Arc Error Messages =============

export const arc_error_messages = {
  MISSING_ARGS: () =>
    `arc() needs more arguments.\narc(g, cx, cy, r, start, sweep)`,

  WRONG_COORD_COUNT: (count) =>
    `arc() got ${count} values.\nNeed 5: cx, cy, r, start, sweep`,

  INVALID_GRAPH: (varName) =>
    `'${varName}' is not a graph.\narc(graph, cx, cy, r, start, sweep)`,
};

// ============= Angle Error Messages =============

export const angle_error_messages = {
  MISSING_ARGS: (name) =>
    `${name}() needs more arguments.\n${name}(g, vx, vy, p1x, p1y, p2x, p2y)`,

  WRONG_COORD_COUNT: (name, count) =>
    `${name}() got ${count} coordinates.\nNeed 6: vertex(2) + p1(2) + p2(2)`,

  INVALID_GRAPH: (name, varName) =>
    `'${varName}' is not a graph.\n${name}(graph, vertex, p1, p2)`,

  GRAPH_REQUIRED: (name) =>
    `${name}() requires a g2d graph.\n${name}(g, vertex, p1, p2)`,
};

// ============= Angle3D Error Messages =============

export const angle3d_error_messages = {
  MISSING_ARGS: (name) =>
    `${name}() needs more arguments.\n${name}(g, vertex, point1, point2)`,

  WRONG_COORD_COUNT: (name, count) =>
    `${name}() got ${count} coordinates.\nNeed 9: vertex(3) + p1(3) + p2(3)\nOr 12: vector1(6) + vector2(6)`,

  GRAPH_REQUIRED: (name) =>
    `${name}() requires a g3d graph.\n${name}(g3d, vertex, p1, p2)`,

  INVALID_GRAPH: (name, varName) =>
    `'${varName}' is not a 3D graph.\n${name}(g3d, vertex, p1, p2)`,
};

// ============= Plot Error Messages =============

export const plot_error_messages = {
  MISSING_ARGS: () =>
    `plot() needs 2 arguments.\nUsage: plot(g, expression)`,

  INVALID_EXPRESSION: () =>
    `Invalid plot expression.\nUse x-based expression like x^2`,

  INVALID_GRAPH: (varName) =>
    `'${varName}' is not a graph.\nplot(graph, expression)`,
};

// ============= Graph2D Error Messages =============

export const g2d_error_messages = {
  INVALID_DIMENSIONS: () =>
    `g2d() needs 4 numbers.\nUsage: g2d(x, y, width, height)`,

  INVALID_POSITION: () =>
    `Invalid position values.\nUse numbers for x, y.`,

  INVALID_SIZE: () =>
    `Invalid size values.\nWidth and height must be positive.`,
};

// ============= Intersect Error Messages =============

export const intersect_error_messages = {
  WRONG_ARG_COUNT: (count) =>
    `intersect() needs 2-3 arguments.\nGot ${count}. Usage: intersect(obj1, obj2)`,

  INDEX_NOT_NUMBER: () =>
    `Index must be a number.\nintersect(obj1, obj2, index)`,

  INDEX_LESS_THAN_ONE: () =>
    `Index must be >= 1.\nIntersection indices are 1-based.`,

  INVALID_COMBINATION: (type1, type2) =>
    `Cannot intersect ${type1} with ${type2}.\nUse line, circle, or polygon.`,

  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,
};

// ============= Project Error Messages =============

export const project_error_messages = {
  WRONG_ARG_COUNT: (count) =>
    `project() needs 3 arguments.\nGot ${count}. Usage: project(g, line, point)`,

  GRAPH_REQUIRED: () =>
    `project() needs a graph.\nFirst argument must be graph.`,

  FIRST_ARG_NOT_LINE: (type) =>
    `Second arg must be line/vec.\nGot ${type} instead.`,

  SECOND_ARG_NOT_POINT: (type) =>
    `Third arg must be a point.\nGot ${type} instead.`,

  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,
};

// ============= Reflect Error Messages =============

export const reflect_error_messages = {
  WRONG_ARG_COUNT: (count) =>
    `reflect() needs 3 arguments.\nGot ${count}. Usage: reflect(g, line, shape)`,

  GRAPH_REQUIRED: () =>
    `reflect() needs a graph.\nFirst argument must be graph.`,

  FIRST_ARG_NOT_LINE: (type) =>
    `Second arg must be line/vec.\nGot ${type} instead.`,

  INVALID_SHAPE: (type) =>
    `Cannot reflect ${type}.\nUse point, line, vec, circle, polygon.`,

  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,
};

// ============= Rotate Error Messages =============

export const rotate_error_messages = {
  WRONG_ARG_COUNT: (count) =>
    `rotate() needs at least 3 args.\nGot ${count}. rotate(g, shape, angle) or rotate(g, s1, s2, ..., angle)`,

  GRAPH_REQUIRED: () =>
    `rotate() needs a graph.\nFirst argument must be graph.`,

  INVALID_SHAPE: (type) =>
    `Cannot rotate ${type}.\nUse point, line, vec, circle, polygon.`,

  ANGLE_NOT_NUMBER: () =>
    `Angle must be a number.\nrotate(g, shape, degrees)`,

  INVALID_CENTER: () =>
    `Invalid rotation center.\nUse point or (cx, cy) coords.`,

  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,
};

// ============= Translate Error Messages =============

export const translate_error_messages = {
  WRONG_ARG_COUNT: (count) =>
    `translate() needs at least 4 args.\nGot ${count}. translate(g, shape, dx, dy) or translate(g, s1, s2, ..., dx, dy)`,

  GRAPH_REQUIRED: () =>
    `translate() needs a graph.\nFirst argument must be graph.`,

  INVALID_SHAPE: (type) =>
    `Cannot translate ${type}.\nUse point, line, vec, circle, polygon, plot.`,

  DX_NOT_NUMBER: () =>
    `dx must be a number.\ntranslate(g, shape, dx, dy)`,

  DY_NOT_NUMBER: () =>
    `dy must be a number.\ntranslate(g, shape, dx, dy)`,

  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,
};

// ============= Scale Error Messages =============

export const scale_error_messages = {
  WRONG_ARG_COUNT: (count) =>
    `scale() needs at least 3 args.\nGot ${count}. scale(g, shape, factor) or scale(g, s1, s2, ..., factor)`,

  GRAPH_REQUIRED: () =>
    `scale() needs a graph.\nFirst argument must be graph.`,

  INVALID_SHAPE: (type) =>
    `Cannot scale ${type}.\nUse point, line, vec, circle, polygon.`,

  FACTOR_NOT_NUMBER: () =>
    `Scale factor must be a number.\nscale(g, shape, factor)`,

  INVALID_CENTER: () =>
    `Invalid scale center.\nUse point or (cx, cy) coords.`,

  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,
};

// ============= Label Error Messages =============

export const label_error_messages = {
  MISSING_ARGS: () =>
    `label() needs 3+ arguments.\nUsage: label(g, "text", x, y)`,

  STRING_REQUIRED: () =>
    `label() needs a string.\nSecond arg must be "quoted".`,

  WRONG_COORD_COUNT: (count) =>
    `label() got ${count} coordinates.\nNeed exactly 2: x, y`,

  GRAPH_REQUIRED: () =>
    `label() needs a graph.\nFirst argument must be graph.`,
};

// ============= Distance Marker Error Messages =============

export const dm_error_messages = {
  MISSING_ARGS: () =>
    `dm() needs graph, coords, text.\nUsage: dm(g, x1,y1,x2,y2, "text")`,

  GRAPH_REQUIRED: () =>
    `dm() needs a graph.\nFirst argument must be graph.`,

  TEXT_REQUIRED: () =>
    `dm() needs a text label.\nUse quoted string: "text"`,

  WRONG_COORD_COUNT: (count) =>
    `dm() got ${count} coordinates.\nNeed exactly 4: x1, y1, x2, y2`,
};

// ============= Measure3D Error Messages =============

export const measure3d_error_messages = {
  MISSING_ARGS: () =>
    `measure3d() needs graph, coords, text.\nUsage: measure3d(g, p1, p2, "text")`,

  GRAPH_REQUIRED: () =>
    `measure3d() needs a 3D graph.\nFirst argument must be g3d.`,

  TEXT_REQUIRED: () =>
    `measure3d() needs a text label.\nUse quoted string: "text"`,

  WRONG_COORD_COUNT: (count) =>
    `measure3d() got ${count} coordinates.\nNeed exactly 6: x1, y1, z1, x2, y2, z2`,
};

// ============= Assignment Error Messages =============

export const assignment_error_messages = {
  INVALID_LHS: () =>
    `Invalid assignment target.\nLeft side must be variable.`,

  RESERVED_NAME: (name) =>
    `'${name}' is reserved.\nUse a different name.`,
};

// ============= Arithmetic Error Messages =============

export const arithmetic_error_messages = {
  INVALID_ADDITION: () =>
    `Cannot add these values.\nBoth must be numbers.`,

  INVALID_SUBTRACTION: () =>
    `Cannot subtract these values.\nBoth must be numbers.`,

  INVALID_MULTIPLICATION: () =>
    `Cannot multiply these values.\nBoth must be numbers.`,

  INVALID_DIVISION: () =>
    `Cannot divide these values.\nBoth must be numbers.`,

  DIVISION_BY_ZERO: () =>
    `Cannot divide by zero.\nCheck your divisor.`,
};

// ============= Helper to get message by shape type =============

const messagesByType = {
  line: line_error_messages,
  point: point_error_messages,
  point3d: point3d_error_messages,
  line3d: line3d_error_messages,
  vector3d: vector3d_error_messages,
  sphere: sphere3d_error_messages,
  cylinder: cylinder3d_error_messages,
  cube: cube3d_error_messages,
  cone: cone3d_error_messages,
  torus: torus3d_error_messages,
  prism: prism3d_error_messages,
  frustum: frustum3d_error_messages,
  pyramid: pyramid3d_error_messages,
  plane3d: plane3d_error_messages,
  polygon3d: polygon3d_error_messages,
  circle: circle_error_messages,
  vector: vector_error_messages,
  polygon: polygon_error_messages,
  arc: arc_error_messages,
  angle: angle_error_messages,
  plot: plot_error_messages,
  g2d: g2d_error_messages,
  intersect: intersect_error_messages,
  project: project_error_messages,
  reflect: reflect_error_messages,
  rotate: rotate_error_messages,
  translate: translate_error_messages,
  scale: scale_error_messages,
  label: label_error_messages,
  dm: dm_error_messages,
  measure3d: measure3d_error_messages,
  assignment: assignment_error_messages,
};

/**
 * Get error message for a specific shape type
 * @param {string} shapeType - The shape type (line, point, circle, etc.)
 * @param {string} errorKey - The error key (MISSING_ARGS, WRONG_COORD_COUNT, etc.)
 * @param {...any} params - Parameters for the message template
 * @returns {string} The formatted error message
 */
export function getErrorMessage(shapeType, errorKey, ...params) {
  const messages = messagesByType[shapeType];
  if (!messages || !messages[errorKey]) {
    return `Error in ${shapeType}().\nCheck your arguments.`;
  }
  return messages[errorKey](...params);
}

/**
 * Get common error message
 * @param {string} errorKey - The error key
 * @param {...any} params - Parameters for the message template
 * @returns {string} The formatted error message
 */
export function getCommonError(errorKey, ...params) {
  if (!common_error_messages[errorKey]) {
    return `Expression error occurred.\nCheck your syntax.`;
  }
  return common_error_messages[errorKey](...params);
}

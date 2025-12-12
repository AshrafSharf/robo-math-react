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

export const vec_error_messages = {
  MISSING_ARGS: () =>
    `vec() needs 5 arguments.\nUsage: vec(g, x1, y1, x2, y2)`,

  WRONG_COORD_COUNT: (count) =>
    `vec() got ${count} coordinates.\nNeed exactly 4: x1, y1, x2, y2`,

  INVALID_GRAPH: (varName) =>
    `'${varName}' is not a graph.\nvec(graph, x1, y1, x2, y2)`,
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
    `project() needs 2 arguments.\nGot ${count}. Usage: project(line, point)`,

  FIRST_ARG_NOT_LINE: (type) =>
    `First arg must be line/vec.\nGot ${type} instead.`,

  SECOND_ARG_NOT_POINT: (type) =>
    `Second arg must be a point.\nGot ${type} instead.`,

  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,
};

// ============= Reflect Error Messages =============

export const reflect_error_messages = {
  WRONG_ARG_COUNT: (count) =>
    `reflect() needs 2 arguments.\nGot ${count}. Usage: reflect(line, point)`,

  FIRST_ARG_NOT_LINE: (type) =>
    `First arg must be line/vec.\nGot ${type} instead.`,

  SECOND_ARG_NOT_POINT: (type) =>
    `Second arg must be a point.\nGot ${type} instead.`,

  VARIABLE_NOT_FOUND: (varName) =>
    `Variable '${varName}' not defined.\nDefine it before using.`,
};

// ============= Rotate Error Messages =============

export const rotate_error_messages = {
  WRONG_ARG_COUNT: (count) =>
    `rotate() needs 3-5 args.\nGot ${count}. rotate(g, shape, angle)`,

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
    `translate() needs 4 args.\nGot ${count}. translate(g, shape, dx, dy)`,

  GRAPH_REQUIRED: () =>
    `translate() needs a graph.\nFirst argument must be graph.`,

  INVALID_SHAPE: (type) =>
    `Cannot translate ${type}.\nUse point, line, vec, circle, polygon.`,

  DX_NOT_NUMBER: () =>
    `dx must be a number.\ntranslate(g, shape, dx, dy)`,

  DY_NOT_NUMBER: () =>
    `dy must be a number.\ntranslate(g, shape, dx, dy)`,

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
  circle: circle_error_messages,
  vec: vec_error_messages,
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
  label: label_error_messages,
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

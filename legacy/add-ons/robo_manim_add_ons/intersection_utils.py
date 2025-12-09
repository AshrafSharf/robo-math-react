"""
Intersection utility functions for Manim objects.

Provides helper functions for finding intersections between geometric objects.
"""

import numpy as np
from manim import Line, Dot, VGroup, Circle, Polygon, rotate_vector
from typing import Union


def intersect_lines(line1: Line, line2: Line) -> Union[Dot, VGroup]:
    """
    Find the intersection point of two lines (extended infinitely).

    Args:
        line1: The first Line object
        line2: The second Line object

    Returns:
        Dot at the intersection point if lines intersect,
        Empty VGroup if lines are parallel or don't intersect

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import intersect_lines
        >>>
        >>> line1 = Line(LEFT, RIGHT)  # Horizontal line
        >>> line2 = Line(DOWN, UP)     # Vertical line
        >>> intersection = intersect_lines(line1, line2)
        >>> # Returns Dot at ORIGIN
        >>>
        >>> # Parallel lines
        >>> line3 = Line(LEFT + UP, RIGHT + UP)
        >>> line4 = Line(LEFT, RIGHT)
        >>> intersection2 = intersect_lines(line3, line4)
        >>> # Returns empty VGroup
    """
    # Get endpoints of both lines
    p1 = line1.get_start()
    p2 = line1.get_end()
    p3 = line2.get_start()
    p4 = line2.get_end()

    # Direction vectors
    d1 = p2 - p1  # Direction of line1
    d2 = p4 - p3  # Direction of line2

    # Vector from line1 start to line2 start
    p1_to_p3 = p3 - p1

    # Calculate the cross product in 2D (ignoring z-component)
    # For 3D vectors [x, y, z], we use the z-component of the cross product
    cross_d1_d2 = d1[0] * d2[1] - d1[1] * d2[0]

    # If cross product is zero, lines are parallel or coincident
    if np.abs(cross_d1_d2) < 1e-10:
        return VGroup()  # Empty VGroup for parallel/coincident lines

    # Calculate parameter t for line1
    # Using the formula from line intersection:
    # t = ((p3 - p1) × d2) / (d1 × d2)
    cross_p1p3_d2 = p1_to_p3[0] * d2[1] - p1_to_p3[1] * d2[0]
    t = cross_p1p3_d2 / cross_d1_d2

    # Calculate intersection point
    # P = p1 + t * d1
    intersection_point = p1 + t * d1

    return Dot(intersection_point)


def intersect_line_circle(line: Line, circle: Circle) -> VGroup:
    """
    Find the intersection points of a line (extended infinitely) and a circle.

    Args:
        line: The Line object (treated as infinite)
        circle: The Circle object

    Returns:
        VGroup containing:
        - 2 Dots if line intersects circle at two points
        - 1 Dot if line is tangent to circle
        - Empty VGroup if line doesn't intersect circle

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import intersect_line_circle
        >>>
        >>> line = Line(LEFT * 3, RIGHT * 3)
        >>> circle = Circle(radius=2)
        >>> intersections = intersect_line_circle(line, circle)
        >>> # Returns VGroup with 2 Dots
        >>>
        >>> # Line missing the circle
        >>> line2 = Line(LEFT * 3 + UP * 5, RIGHT * 3 + UP * 5)
        >>> intersections2 = intersect_line_circle(line2, circle)
        >>> # Returns empty VGroup
    """
    # Get line parameters
    p1 = line.get_start()
    p2 = line.get_end()
    direction = p2 - p1

    # Normalize direction vector
    d = direction / np.linalg.norm(direction)

    # Get circle parameters
    center = circle.get_center()
    # Calculate radius from the circle's width
    radius = circle.width / 2

    # Vector from line start to circle center
    f = p1 - center

    # Solve quadratic equation: |p1 + t*d - center|² = radius²
    # Expanding: (f + t*d)·(f + t*d) = r²
    # t²(d·d) + 2t(f·d) + (f·f - r²) = 0
    # Since d is normalized, d·d = 1
    a = np.dot(d, d)  # Should be 1 for normalized vector
    b = 2 * np.dot(f, d)
    c = np.dot(f, f) - radius * radius

    # Calculate discriminant
    discriminant = b * b - 4 * a * c

    # No intersection if discriminant is negative
    if discriminant < -1e-10:
        return VGroup()

    # Tangent case (one intersection point)
    if abs(discriminant) < 1e-10:
        t = -b / (2 * a)
        intersection_point = p1 + t * d
        return VGroup(Dot(intersection_point))

    # Two intersection points
    sqrt_discriminant = np.sqrt(discriminant)
    t1 = (-b - sqrt_discriminant) / (2 * a)
    t2 = (-b + sqrt_discriminant) / (2 * a)

    point1 = p1 + t1 * d
    point2 = p1 + t2 * d

    return VGroup(Dot(point1), Dot(point2))


def _point_on_segment(point: np.ndarray, start: np.ndarray, end: np.ndarray, tolerance: float = 1e-10) -> bool:
    """
    Check if a point lies on a line segment between start and end.

    Args:
        point: The point to check
        start: Start point of the segment
        end: End point of the segment
        tolerance: Numerical tolerance for comparison

    Returns:
        True if point lies on the segment, False otherwise
    """
    d_total = np.linalg.norm(end - start)
    if d_total < tolerance:
        # Degenerate segment (start == end)
        return np.linalg.norm(point - start) < tolerance
    d1 = np.linalg.norm(point - start)
    d2 = np.linalg.norm(end - point)
    return abs(d1 + d2 - d_total) < tolerance


def icc(c1: Circle, c2: Circle) -> VGroup:
    """
    Find intersection points of two circles.

    Uses the law of cosines to calculate the intersection angle, then
    rotates the direction vector between centers to find intersection points.

    Args:
        c1: First Circle object
        c2: Second Circle object

    Returns:
        VGroup containing:
        - 2 Dots if circles intersect at two points
        - 1 Dot if circles are tangent (internally or externally)
        - Empty VGroup if circles don't intersect (too far apart or one inside other)

    Example:
        >>> from manim import Circle
        >>> from robo_manim_add_ons import icc
        >>>
        >>> # Two intersecting circles
        >>> c1 = Circle(radius=2).shift(LEFT)
        >>> c2 = Circle(radius=2).shift(RIGHT)
        >>> points = icc(c1, c2)
        >>> len(points)  # Returns 2
        >>>
        >>> # Tangent circles
        >>> c3 = Circle(radius=1)
        >>> c4 = Circle(radius=1).shift(RIGHT * 2)
        >>> points = icc(c3, c4)  # Returns VGroup with 1 Dot
        >>>
        >>> # Non-intersecting circles
        >>> c5 = Circle(radius=1)
        >>> c6 = Circle(radius=1).shift(RIGHT * 5)
        >>> points = icc(c5, c6)  # Returns empty VGroup
    """
    # Get centers and radii
    o1 = c1.get_center()
    o2 = c2.get_center()
    r1 = c1.width / 2
    r2 = c2.width / 2

    # Distance between centers
    d = np.linalg.norm(o2 - o1)

    # Handle edge case: centers are the same
    if d < 1e-10:
        if abs(r1 - r2) < 1e-10:
            # Identical circles - infinite intersections, return empty
            return VGroup()
        else:
            # Concentric circles with different radii - no intersection
            return VGroup()

    # No intersection cases
    if d > r1 + r2 + 1e-10:  # Circles too far apart
        return VGroup()
    if d < abs(r1 - r2) - 1e-10:  # One circle inside other
        return VGroup()

    # Direction from o1 to o2
    direction = (o2 - o1) / d

    # Tangent case: external tangent
    if abs(d - (r1 + r2)) < 1e-10:
        point = o1 + r1 * direction
        return VGroup(Dot(point))

    # Tangent case: internal tangent
    if abs(d - abs(r1 - r2)) < 1e-10:
        if r1 > r2:
            point = o1 + r1 * direction
        else:
            point = o1 - r1 * direction
        return VGroup(Dot(point))

    # Calculate intersection using law of cosines
    # cos(α) = (r1² + d² - r2²) / (2 * r1 * d)
    cos_alpha = (r1**2 + d**2 - r2**2) / (2 * r1 * d)
    cos_alpha = np.clip(cos_alpha, -1, 1)  # Handle floating point errors
    alpha = np.arccos(cos_alpha)

    # Two intersection points: rotate direction by ±alpha
    p1 = o1 + r1 * rotate_vector(direction, alpha)
    p2 = o1 + r1 * rotate_vector(direction, -alpha)

    return VGroup(Dot(p1), Dot(p2))


def ilp(line: Line, polygon: Polygon) -> VGroup:
    """
    Find all intersection points between a line (extended infinitely) and a polygon.

    Iterates through all edges of the polygon and finds intersections with the line,
    checking that each intersection point actually lies within the polygon edge.

    Args:
        line: Line object (treated as infinite line)
        polygon: Polygon object

    Returns:
        VGroup containing Dots at all intersection points

    Example:
        >>> from manim import Line, Polygon
        >>> from robo_manim_add_ons import ilp
        >>>
        >>> # Triangle and a horizontal line
        >>> triangle = Polygon([0, 2, 0], [-2, -1, 0], [2, -1, 0])
        >>> line = Line(LEFT * 3, RIGHT * 3)
        >>> points = ilp(line, triangle)
        >>> len(points)  # Returns 2 (line crosses two edges)
        >>>
        >>> # Square and diagonal line
        >>> square = Polygon([-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0])
        >>> diag = Line([-2, -2, 0], [2, 2, 0])
        >>> points = ilp(diag, square)  # Returns VGroup with 2 Dots
    """
    vertices = polygon.get_vertices()
    n = len(vertices)
    intersections = VGroup()

    for i in range(n):
        # Get edge from vertex[i] to vertex[(i+1) % n]
        edge_start = vertices[i]
        edge_end = vertices[(i + 1) % n]
        edge = Line(edge_start, edge_end)

        # Find intersection of infinite line with this edge (treated as infinite)
        intersection = intersect_lines(line, edge)

        if len(intersection) > 0:
            # Check if intersection is within the edge segment
            point = intersection.get_center()
            if _point_on_segment(point, edge_start, edge_end):
                intersections.add(Dot(point))

    return intersections


# ============================================================================
# Aliases
# ============================================================================

def ill(line1: Line, line2: Line) -> Union[Dot, VGroup]:
    """Alias for intersect_lines(). See intersect_lines() for full documentation."""
    return intersect_lines(line1, line2)


def ilc(line: Line, circle: Circle) -> VGroup:
    """Alias for intersect_line_circle(). See intersect_line_circle() for full documentation."""
    return intersect_line_circle(line, circle)

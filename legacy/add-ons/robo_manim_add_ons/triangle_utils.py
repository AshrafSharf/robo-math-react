"""
Triangle geometry utilities for Manim.

Provides helper functions for computing triangle centers (centroid, circumcenter,
orthocenter, incenter) and altitude lines.
"""

import numpy as np
from manim import Line, Dot
from typing import Union


def _extract_position(obj):
    """Extract position from Dot/object or np.array."""
    if hasattr(obj, 'get_center'):
        return obj.get_center()
    elif isinstance(obj, np.ndarray):
        return obj
    elif isinstance(obj, (list, tuple)):
        return np.array(obj if len(obj) == 3 else list(obj) + [0])
    else:
        raise TypeError(f"Expected Dot, np.array, or list, got {type(obj).__name__}")


def centroid(A, B, C) -> Dot:
    """
    Calculate the centroid of a triangle.

    The centroid is the average of the three vertices, where the three medians intersect.

    Args:
        A: First vertex (Dot, np.array, or list)
        B: Second vertex (Dot, np.array, or list)
        C: Third vertex (Dot, np.array, or list)

    Returns:
        Dot at the centroid position

    Example:
        >>> from robo_manim_add_ons import centroid
        >>>
        >>> G = centroid([0, 0, 0], [3, 0, 0], [1.5, 2, 0])
    """
    a = _extract_position(A)
    b = _extract_position(B)
    c = _extract_position(C)

    center = (a + b + c) / 3
    return Dot(center)


def circumcenter(A, B, C) -> Dot:
    """
    Calculate the circumcenter of a triangle.

    The circumcenter is the center of the circumscribed circle (passing through all vertices).
    It is the intersection of the perpendicular bisectors of the sides.

    Args:
        A: First vertex (Dot, np.array, or list)
        B: Second vertex (Dot, np.array, or list)
        C: Third vertex (Dot, np.array, or list)

    Returns:
        Dot at the circumcenter position

    Example:
        >>> from robo_manim_add_ons import circumcenter
        >>>
        >>> O = circumcenter([0, 0, 0], [4, 0, 0], [2, 3, 0])
    """
    a = _extract_position(A)
    b = _extract_position(B)
    c = _extract_position(C)

    # Midpoints of AB and BC
    mid_AB = (a + b) / 2
    mid_BC = (b + c) / 2

    # Perpendicular directions to AB and BC
    AB = b - a
    BC = c - b
    perp_AB = np.array([-AB[1], AB[0], 0])
    perp_BC = np.array([-BC[1], BC[0], 0])

    # Solve for intersection of perpendicular bisectors
    # Line 1: mid_AB + t * perp_AB
    # Line 2: mid_BC + s * perp_BC
    mat = np.array([
        [perp_AB[0], -perp_BC[0]],
        [perp_AB[1], -perp_BC[1]]
    ])
    rhs = np.array([
        mid_BC[0] - mid_AB[0],
        mid_BC[1] - mid_AB[1]
    ])

    try:
        t, _ = np.linalg.solve(mat, rhs)
        center = mid_AB + t * perp_AB
        return Dot(center)
    except np.linalg.LinAlgError:
        # Degenerate triangle (collinear points), return centroid as fallback
        return centroid(A, B, C)


def orthocenter(A, B, C) -> Dot:
    """
    Calculate the orthocenter of a triangle.

    The orthocenter is the intersection of the three altitudes.

    Args:
        A: First vertex (Dot, np.array, or list)
        B: Second vertex (Dot, np.array, or list)
        C: Third vertex (Dot, np.array, or list)

    Returns:
        Dot at the orthocenter position

    Example:
        >>> from robo_manim_add_ons import orthocenter
        >>>
        >>> H = orthocenter([0, 0, 0], [4, 0, 0], [2, 3, 0])
    """
    a = _extract_position(A)
    b = _extract_position(B)
    c = _extract_position(C)

    # Altitude from A perpendicular to BC
    BC = c - b
    perp_BC = np.array([-BC[1], BC[0], 0])

    # Altitude from B perpendicular to AC
    AC = c - a
    perp_AC = np.array([-AC[1], AC[0], 0])

    # Solve for intersection
    # Line 1: A + t * perp_BC
    # Line 2: B + s * perp_AC
    mat = np.array([
        [perp_BC[0], -perp_AC[0]],
        [perp_BC[1], -perp_AC[1]]
    ])
    rhs = np.array([
        b[0] - a[0],
        b[1] - a[1]
    ])

    try:
        t, _ = np.linalg.solve(mat, rhs)
        center = a + t * perp_BC
        return Dot(center)
    except np.linalg.LinAlgError:
        # Degenerate triangle, return centroid as fallback
        return centroid(A, B, C)


def incenter(A, B, C) -> Dot:
    """
    Calculate the incenter of a triangle.

    The incenter is the center of the inscribed circle (tangent to all three sides).
    It is the intersection of the angle bisectors, equidistant from all sides.

    Args:
        A: First vertex (Dot, np.array, or list)
        B: Second vertex (Dot, np.array, or list)
        C: Third vertex (Dot, np.array, or list)

    Returns:
        Dot at the incenter position

    Example:
        >>> from robo_manim_add_ons import incenter
        >>>
        >>> I = incenter([0, 0, 0], [4, 0, 0], [2, 3, 0])
    """
    a = _extract_position(A)
    b = _extract_position(B)
    c = _extract_position(C)

    # Side lengths
    len_a = np.linalg.norm(c - b)  # opposite to A
    len_b = np.linalg.norm(c - a)  # opposite to B
    len_c = np.linalg.norm(b - a)  # opposite to C

    # Incenter formula: weighted average by opposite side lengths
    total = len_a + len_b + len_c
    if total == 0:
        return centroid(A, B, C)

    center = (len_a * a + len_b * b + len_c * c) / total
    return Dot(center)


def altitude(vertex, *args) -> Line:
    """
    Create an altitude line from a vertex perpendicular to the opposite side.

    Args:
        vertex: The vertex point (Dot, np.array, or list)
        *args: Either:
            - One Line object: altitude(A, line_BC)
            - Two points: altitude(A, B, C)

    Returns:
        Line from vertex to foot of altitude (perpendicular to opposite side)

    Example:
        >>> from manim import Line
        >>> from robo_manim_add_ons import altitude
        >>>
        >>> # With Line
        >>> side_BC = Line([3, 0, 0], [1, 2, 0])
        >>> alt = altitude([0, 0, 0], side_BC)
        >>>
        >>> # With two points
        >>> alt = altitude([0, 0, 0], [3, 0, 0], [1, 2, 0])
    """
    v = _extract_position(vertex)

    if len(args) == 1:
        # Single argument: Line object
        opposite_side = args[0]
        line_start = opposite_side.get_start()
        line_end = opposite_side.get_end()
    elif len(args) == 2:
        # Two arguments: two points
        line_start = _extract_position(args[0])
        line_end = _extract_position(args[1])
    else:
        raise ValueError("altitude() takes 2 or 3 arguments: (vertex, line) or (vertex, p1, p2)")

    # Direction vector of the line
    line_vec = line_end - line_start

    # Vector from line start to vertex
    to_vertex = v - line_start

    # Project vertex onto line to find foot
    line_length_sq = np.dot(line_vec, line_vec)
    if line_length_sq == 0:
        # Degenerate line
        return Line(v, line_start)

    t = np.dot(to_vertex, line_vec) / line_length_sq
    foot = line_start + t * line_vec

    return Line(v, foot)

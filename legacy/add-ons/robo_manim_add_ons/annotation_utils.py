"""
Annotation utility functions for Manim diagrams.

This module provides utilities to create annotations like distance markers.
"""

import numpy as np
from manim import DoubleArrow, Line, MathTex, VGroup, Polygon, Intersection


def distance_marker(point1, point2=None, color="#1e40af", stroke_width=2, tick_size=0.25, text="", label_offset=0.3, marker_offset=0):
    """
    Create a distance marker with double arrow and perpendicular ticks.

    Args:
        point1: Either a line object OR the starting point
                - Line object: Any Mobject with get_start() and get_end() methods (Line, Arrow, etc.)
                - Starting point: List/tuple [x, y, z], numpy array, or Dot (with get_center())
        point2: Ending point (optional if point1 is a line object) - can be:
                - List/tuple: [x, y, z]
                - numpy array
                - Manim Dot or any Mobject with get_center() method
        color: Color of the marker (default "#1e40af")
        stroke_width: Width of the marker lines (default 2)
        tick_size: Size of perpendicular tick marks (default 0.25)
        text: Optional label text to display at midpoint (default "")
        label_offset: Distance to offset label perpendicular to line (default 0.3)
                     Positive values offset in one direction, negative in the other
        marker_offset: Distance to offset entire marker perpendicular to line (default 0)
                      Positive values offset in one direction, negative in the other
                      Useful for showing markers away from overlapping geometry

    Returns:
        VGroup containing the marker (arrow, ticks, and optional label)

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import distance_marker
        >>>
        >>> # Using two points (Dots, arrays, or lists)
        >>> marker1 = distance_marker(
        ...     [0, 0, 0],
        ...     [3, 0, 0],
        ...     text="3",
        ...     color=BLUE
        ... )
        >>>
        >>> # Using a line object
        >>> line = Line(LEFT, RIGHT)
        >>> marker2 = distance_marker(line, text="d", marker_offset=0.5)
        >>>
        >>> # Using Dot objects
        >>> dot_a = Dot(ORIGIN)
        >>> dot_b = Dot(RIGHT * 2)
        >>> marker3 = distance_marker(dot_a, dot_b, text="2")
    """
    # Detect if point1 is a line object (has get_start and get_end methods)
    if point2 is None and hasattr(point1, 'get_start') and hasattr(point1, 'get_end'):
        # point1 is a line object
        start_pt = point1.get_start()
        end_pt = point1.get_end()
    else:
        # Two separate points provided
        # Extract coordinates from point1
        if hasattr(point1, 'get_center'):
            start_pt = point1.get_center()
        else:
            start_pt = np.array(point1)

        # Extract coordinates from point2
        if hasattr(point2, 'get_center'):
            end_pt = point2.get_center()
        else:
            end_pt = np.array(point2)

    # Calculate direction and perpendicular
    direction = end_pt - start_pt
    perpendicular = np.array([-direction[1], direction[0], 0])

    # Normalize perpendicular (with safety check)
    if np.linalg.norm(perpendicular) > 0.001:
        perpendicular_normalized = perpendicular / np.linalg.norm(perpendicular)
    else:
        perpendicular_normalized = np.array([0, 1, 0])

    # Apply marker offset to shift entire marker perpendicular to line
    if marker_offset != 0:
        offset_vector = perpendicular_normalized * marker_offset
        start_pt = start_pt + offset_vector
        end_pt = end_pt + offset_vector

    # Create double arrow
    arrow = DoubleArrow(start_pt, end_pt, color=color, buff=0, stroke_width=stroke_width)

    tick_offset = perpendicular_normalized * tick_size
    tick_start = Line(start_pt - tick_offset, start_pt + tick_offset, color=color, stroke_width=stroke_width)
    tick_end = Line(end_pt - tick_offset, end_pt + tick_offset, color=color, stroke_width=stroke_width)

    # Create VGroup with or without label
    if text:
        marker_label = MathTex(text).set_color(color)
        # Position label at midpoint + perpendicular offset
        midpoint = (start_pt + end_pt) / 2
        label_position = midpoint + perpendicular_normalized * label_offset
        marker_label.move_to(label_position)
        angle = np.arctan2(direction[1], direction[0])
        marker_label.rotate(angle)
        marker_obj = VGroup(arrow, tick_start, tick_end, marker_label)
    else:
        marker_obj = VGroup(arrow, tick_start, tick_end)

    return marker_obj


def label(latex_text, point1, point2, buff=0.5, alpha=0.5, auto_rotate=True):
    """
    Create and position a MathTex label between two points with perpendicular offset.

    Args:
        latex_text: LaTeX string for the label (e.g., "AB", r"\\theta", "x^2")
        point1: Starting point - can be:
                - List/tuple: [x, y, z]
                - numpy array
                - Manim Dot or any Mobject with get_center() method
        point2: Ending point - can be:
                - List/tuple: [x, y, z]
                - numpy array
                - Manim Dot or any Mobject with get_center() method
        buff: Perpendicular offset distance from the line (default 0.5)
              Positive values offset in one direction, negative in the other
        alpha: Position along the line from point1 to point2 (default 0.5)
               0.0 = at point1, 0.5 = midpoint, 1.0 = at point2
        auto_rotate: If True, rotate label to align with the line direction (default True)

    Returns:
        MathTex: The positioned label object

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import label
        >>>
        >>> # Create label at midpoint with offset
        >>> ab_label = label("AB", [0, 0, 0], [3, 0, 0], buff=0.5)
        >>>
        >>> # Create label 1/4 along the line with Dot objects
        >>> dot_a = Dot([0, 0, 0])
        >>> dot_b = Dot([3, 0, 0])
        >>> theta_label = label(r"\\theta", dot_a, dot_b, alpha=0.25, buff=0.3)
    """
    # Create MathTex label
    label_obj = MathTex(latex_text)

    # Extract coordinates from point1
    if hasattr(point1, 'get_center'):
        start_pt = point1.get_center()
    else:
        start_pt = np.array(point1)

    # Extract coordinates from point2
    if hasattr(point2, 'get_center'):
        end_pt = point2.get_center()
    else:
        end_pt = np.array(point2)

    # Position along the line (alpha=0.5 is midpoint)
    position = start_pt + alpha * (end_pt - start_pt)

    # Calculate perpendicular direction
    direction = end_pt - start_pt
    perpendicular = np.array([-direction[1], direction[0], 0])

    # Normalize perpendicular (with safety check)
    if np.linalg.norm(perpendicular) > 0.001:
        perpendicular_normalized = perpendicular / np.linalg.norm(perpendicular)
    else:
        perpendicular_normalized = np.array([0, 1, 0])

    # Final position with perpendicular offset
    final_position = position + buff * perpendicular_normalized
    label_obj.move_to(final_position)

    # Auto-rotate to align with line direction
    if auto_rotate:
        angle = np.arctan2(direction[1], direction[0])
        label_obj.rotate(angle)

    return label_obj


def hatched_region(axes, vertices, spacing=0.2, direction="/", color="#808080", stroke_width=2):
    """
    Creates a textbook-style shaded (hatched) region inside a polygon.

    Args:
        axes: Manim Axes object for coordinate transformation
        vertices: List of (x, y) tuples defining polygon vertices in axes coordinates
        spacing: Distance between hatch lines (default 0.2)
        direction: Direction of hatching - "/" (default), "\\", "|" (vertical), "-" (horizontal)
        color: Color of hatch lines (default GRAY)
        stroke_width: Width of hatch lines (default 2)

    Returns:
        tuple: (hatched_lines VGroup, boundary_polygon Polygon)

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import hatched_region
        >>>
        >>> axes = Axes(x_range=[0, 10], y_range=[0, 10])
        >>> vertices = [(2, 2), (8, 2), (8, 6), (2, 6)]
        >>> hatched, boundary = hatched_region(axes, vertices, spacing=0.3, direction="/")
        >>>
        >>> self.add(axes, boundary, hatched)
    """
    from shapely.geometry import Polygon as ShapelyPolygon, LineString
    from shapely.ops import unary_union

    boundary_polygon = Polygon(*[axes.c2p(x, y) for x, y in vertices], fill_opacity=0)

    # Create shapely polygon for clipping
    shapely_poly = ShapelyPolygon([(x, y) for x, y in vertices])

    # Create a large group of parallel lines covering the plotting area
    x_min, x_max = axes.x_range[0], axes.x_range[1]
    y_min, y_max = axes.y_range[0], axes.y_range[1]

    hatched = VGroup()

    # Generate hatch lines depending on the direction
    if direction == "/":
        # slope = +1
        for b in np.arange(y_min - (x_max - x_min), y_max, spacing):
            line_shapely = LineString([(x_min, b + x_min), (x_max, b + x_max)])
            intersection = shapely_poly.intersection(line_shapely)
            if not intersection.is_empty:
                if hasattr(intersection, 'coords'):
                    coords = list(intersection.coords)
                    if len(coords) >= 2:
                        start = axes.c2p(coords[0][0], coords[0][1])
                        end = axes.c2p(coords[-1][0], coords[-1][1])
                        hatched.add(Line(start, end, color=color, stroke_width=stroke_width))

    elif direction == "\\":
        # slope = -1
        for b in np.arange(y_min, y_max + (x_max - x_min), spacing):
            line_shapely = LineString([(x_min, b - x_min), (x_max, b - x_max)])
            intersection = shapely_poly.intersection(line_shapely)
            if not intersection.is_empty:
                if hasattr(intersection, 'coords'):
                    coords = list(intersection.coords)
                    if len(coords) >= 2:
                        start = axes.c2p(coords[0][0], coords[0][1])
                        end = axes.c2p(coords[-1][0], coords[-1][1])
                        hatched.add(Line(start, end, color=color, stroke_width=stroke_width))

    elif direction == "|":   # vertical stripes
        for x in np.arange(x_min, x_max, spacing):
            line_shapely = LineString([(x, y_min), (x, y_max)])
            intersection = shapely_poly.intersection(line_shapely)
            if not intersection.is_empty:
                if hasattr(intersection, 'coords'):
                    coords = list(intersection.coords)
                    if len(coords) >= 2:
                        start = axes.c2p(coords[0][0], coords[0][1])
                        end = axes.c2p(coords[-1][0], coords[-1][1])
                        hatched.add(Line(start, end, color=color, stroke_width=stroke_width))

    elif direction == "-":   # horizontal stripes
        for y in np.arange(y_min, y_max, spacing):
            line_shapely = LineString([(x_min, y), (x_max, y)])
            intersection = shapely_poly.intersection(line_shapely)
            if not intersection.is_empty:
                if hasattr(intersection, 'coords'):
                    coords = list(intersection.coords)
                    if len(coords) >= 2:
                        start = axes.c2p(coords[0][0], coords[0][1])
                        end = axes.c2p(coords[-1][0], coords[-1][1])
                        hatched.add(Line(start, end, color=color, stroke_width=stroke_width))

    return hatched, boundary_polygon


# ============================================================================
# Aliases
# ============================================================================

def dm(point1, point2=None, **kwargs):
    """
    Alias for distance_marker().

    Accepts either a line object OR two points (Dots, arrays, or lists).
    See distance_marker() for full documentation.

    Examples:
        dm(line, text="d")
        dm([0, 0, 0], [3, 0, 0], text="3")
        dm(dot_a, dot_b, text="AB")
    """
    return distance_marker(point1, point2, **kwargs)


def hatch(axes, vertices, **kwargs):
    """Alias for hatched_region(). See hatched_region() for full documentation."""
    return hatched_region(axes, vertices, **kwargs)

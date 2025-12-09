"""
Circle geometry utilities for Manim.

Provides helper functions for creating tangent lines, normal lines,
chords, and sectors on circles. All angles are in degrees.
"""

import numpy as np
from manim import Line, Circle, Dot, DEGREES, TangentLine, Sector
from typing import Union


def _extract_position(obj):
    """Extract position from Dot/object or np.array."""
    if hasattr(obj, 'get_center'):
        return obj.get_center()
    elif isinstance(obj, np.ndarray):
        return obj
    elif isinstance(obj, (list, tuple)):
        return np.array(obj)
    else:
        raise TypeError(f"Expected Dot, np.array, or list, got {type(obj).__name__}")


def tangentc(circle: Circle, angle: Union[float, Dot, np.ndarray], length: float = 3) -> TangentLine:
    """
    Create a tangent line at a point on the circle.

    Wraps Manim's TangentLine with degree-to-alpha conversion.

    Args:
        circle: Circle object
        angle: Angle in degrees (0° = right, counterclockwise) OR Dot/np.array point
        length: Length of the tangent line (default: 3)

    Returns:
        TangentLine object

    Example:
        >>> from manim import Circle
        >>> from robo_manim_add_ons import tangentc
        >>>
        >>> circle = Circle(radius=2)
        >>> tan = tangentc(circle, 45)              # Tangent at 45°
        >>> tan = tangentc(circle, 45, length=5)    # Longer tangent
        >>> tan = tangentc(circle, my_dot)          # Tangent at point
    """
    if isinstance(angle, (int, float)):
        # Convert degrees to alpha (0-1 proportion)
        alpha = (angle % 360) / 360
    else:
        # Point given - find the angle
        point = _extract_position(angle)
        center = circle.get_center()
        vec = point - center
        angle_rad = np.arctan2(vec[1], vec[0])
        # Convert radians to alpha, handling negative angles
        alpha = (angle_rad / (2 * np.pi)) % 1

    return TangentLine(circle, alpha=alpha, length=length)


def chord(circle: Circle, angle1: float, angle2: float) -> Line:
    """
    Create a chord (line) between two points on the circle.

    Args:
        circle: Circle object
        angle1: First angle in degrees
        angle2: Second angle in degrees

    Returns:
        Line object connecting the two points

    Note:
        When |angle2 - angle1| == 180, this creates a diameter.

    Example:
        >>> from manim import Circle
        >>> from robo_manim_add_ons import chord
        >>>
        >>> circle = Circle(radius=2)
        >>> ch = chord(circle, 30, 150)       # Chord between 30° and 150°
        >>> diameter = chord(circle, 0, 180)  # Diameter
    """
    p1 = circle.point_at_angle(angle1 * DEGREES)
    p2 = circle.point_at_angle(angle2 * DEGREES)
    return Line(p1, p2)


def normal(circle: Circle, angle: Union[float, Dot, np.ndarray], length: float = 3, placement: str = "mid") -> Line:
    """
    Create a normal (radius) line at a point on the circle, extending beyond the circle.

    Args:
        circle: Circle object
        angle: Angle in degrees (0° = right, counterclockwise) OR Dot/np.array point
        length: Total length of the normal line (default: 3)
        placement: Where the point on circle sits on the line:
                  "start" - line extends outward from point
                  "mid" - point is at center of line (default)
                  "end" - line extends inward from point

    Returns:
        Line object

    Example:
        >>> from manim import Circle
        >>> from robo_manim_add_ons import normal
        >>>
        >>> circle = Circle(radius=2)
        >>> norm = normal(circle, 90)                      # Normal at 90°
        >>> norm = normal(circle, 90, length=4)            # Longer normal
        >>> norm = normal(circle, 90, placement="start")   # Extends outward only
    """
    if placement not in ("start", "mid", "end"):
        raise ValueError(f"placement must be 'start', 'mid', or 'end', got '{placement}'")

    center = circle.get_center()

    # Get point on circle
    if isinstance(angle, (int, float)):
        point = circle.point_at_angle(angle * DEGREES)
    else:
        point = _extract_position(angle)

    # Normal direction is from center through point
    normal_dir = point - center
    norm = np.linalg.norm(normal_dir)
    if norm == 0:
        raise ValueError("Point is at center of circle, cannot compute normal direction")
    normal_dir = normal_dir / norm

    # Create line based on placement
    if placement == "mid":
        start = point - (length / 2) * normal_dir
        end = point + (length / 2) * normal_dir
    elif placement == "start":
        start = point
        end = point + length * normal_dir
    else:  # "end"
        start = point - length * normal_dir
        end = point

    return Line(start, end)


def sector(circle: Circle, start: float, end: float, **kwargs) -> Sector:
    """
    Create a filled sector (pie slice) between two angles on a circle.

    Wraps Manim's Sector with degree conversion.

    Args:
        circle: Circle object (to get center and radius)
        start: Start angle in degrees
        end: End angle in degrees
        **kwargs: Additional styling (color, fill_opacity, stroke_width, etc.)

    Returns:
        Sector object

    Example:
        >>> from manim import Circle, BLUE
        >>> from robo_manim_add_ons import sector
        >>>
        >>> circle = Circle(radius=2)
        >>> sec = sector(circle, 0, 90)                       # Quarter circle
        >>> sec = sector(circle, 0, 90, fill_opacity=0.5)     # Semi-transparent
        >>> sec = sector(circle, 45, 135, color=BLUE)         # Blue sector
    """
    return Sector(
        arc_center=circle.get_center(),
        outer_radius=circle.radius,
        start_angle=start * DEGREES,
        angle=(end - start) * DEGREES,
        **kwargs
    )

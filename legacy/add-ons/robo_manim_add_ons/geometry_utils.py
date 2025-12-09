"""
Geometry utilities for Manim objects.

Provides helper functions for creating perpendicular and parallel lines,
as well as projection and reflection operations.
"""

import numpy as np
from manim import Line, Dot
from typing import Union


def perp(line: Line, dot: Dot, length: float, placement: str = "mid") -> Line:
    """
    Create a perpendicular line to a given line, passing through a dot.

    Args:
        line: The reference Line object
        dot: The Dot object through which the perpendicular line passes
        length: The length of the perpendicular line
        placement: Where the dot is positioned on the new line.
                  Options: "start", "mid", "end". Default: "mid"

    Returns:
        A new Line object perpendicular to the input line

    Raises:
        ValueError: If placement is not one of "start", "mid", "end"

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons.geometry_utils import perp
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> dot = Dot(ORIGIN)
        >>> perp_line = perp(line, dot, 2.0, placement="mid")
        >>> # Creates a vertical line of length 2 centered at dot
    """
    if placement not in ("start", "mid", "end"):
        raise ValueError(f"placement must be 'start', 'mid', or 'end', got '{placement}'")

    # Get the direction vector of the line
    start = line.get_start()
    end = line.get_end()
    direction = end - start

    # Calculate perpendicular vector by rotating 90 degrees
    # For 3D vector [x, y, z], perpendicular in xy-plane is [-y, x, z]
    perp_direction = np.array([-direction[1], direction[0], direction[2]])

    # Normalize and scale to desired length
    perp_normalized = perp_direction / np.linalg.norm(perp_direction)
    perp_scaled = perp_normalized * length

    # Get dot position
    dot_pos = dot.get_center()

    # Calculate start and end points based on placement
    if placement == "mid":
        # Dot at midpoint of the new line
        new_start = dot_pos - perp_scaled / 2
        new_end = dot_pos + perp_scaled / 2
    elif placement == "start":
        # Dot at start of the new line
        new_start = dot_pos
        new_end = dot_pos + perp_scaled
    else:  # placement == "end"
        # Dot at end of the new line
        new_start = dot_pos - perp_scaled
        new_end = dot_pos

    return Line(new_start, new_end)


def parallel(line: Line, dot: Dot, length: float, placement: str = "mid") -> Line:
    """
    Create a parallel line to a given line, passing through a dot.

    Args:
        line: The reference Line object
        dot: The Dot object through which the parallel line passes
        length: The length of the parallel line
        placement: Where the dot is positioned on the new line.
                  Options: "start", "mid", "end". Default: "mid"

    Returns:
        A new Line object parallel to the input line

    Raises:
        ValueError: If placement is not one of "start", "mid", "end"

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons.geometry_utils import parallel
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> dot = Dot(UP)
        >>> parallel_line = parallel(line, dot, 3.0, placement="mid")
        >>> # Creates a horizontal line of length 3 centered at dot
    """
    if placement not in ("start", "mid", "end"):
        raise ValueError(f"placement must be 'start', 'mid', or 'end', got '{placement}'")

    # Get the direction vector of the line
    start = line.get_start()
    end = line.get_end()
    direction = end - start

    # Normalize and scale to desired length
    direction_normalized = direction / np.linalg.norm(direction)
    direction_scaled = direction_normalized * length

    # Get dot position
    dot_pos = dot.get_center()

    # Calculate start and end points based on placement
    if placement == "mid":
        # Dot at midpoint of the new line
        new_start = dot_pos - direction_scaled / 2
        new_end = dot_pos + direction_scaled / 2
    elif placement == "start":
        # Dot at start of the new line
        new_start = dot_pos
        new_end = dot_pos + direction_scaled
    else:  # placement == "end"
        # Dot at end of the new line
        new_start = dot_pos - direction_scaled
        new_end = dot_pos

    return Line(new_start, new_end)


def project(line: Line, point: Union[np.ndarray, Dot]) -> Dot:
    """
    Project a point onto a line (extended infinitely).

    Args:
        line: The reference Line object
        point: The point to project (Dot object or numpy array)

    Returns:
        Dot at the projected position on the line (extended infinitely)

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import project
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> point = Dot(UP)
        >>> projection = project(line, point)
        >>> # Returns Dot at ORIGIN (projection of UP onto horizontal line)
    """
    # Get point coordinates
    if isinstance(point, Dot):
        point_pos = point.get_center()
    else:
        point_pos = np.array(point)

    # Get line endpoints
    line_start = line.get_start()
    line_end = line.get_end()

    # Direction vector of the line
    line_vec = line_end - line_start

    # Vector from line start to point
    point_vec = point_pos - line_start

    # Calculate projection parameter t
    # t = (point_vec · line_vec) / (line_vec · line_vec)
    line_length_sq = np.dot(line_vec, line_vec)

    if line_length_sq == 0:
        # Degenerate line (start == end), return point at line start
        return Dot(line_start)

    t = np.dot(point_vec, line_vec) / line_length_sq

    # Calculate projected point (can be outside the line segment)
    projected_point = line_start + t * line_vec

    return Dot(projected_point)


def reflect(line: Line, point: Union[np.ndarray, Dot]) -> Dot:
    """
    Reflect a point across a line (extended infinitely).

    Args:
        line: The reference Line object
        point: The point to reflect (Dot object or numpy array)

    Returns:
        Dot at the reflected position

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import reflect
        >>>
        >>> line = Line(LEFT, RIGHT)  # Horizontal line through origin
        >>> point = Dot(UP)
        >>> reflected = reflect(line, point)
        >>> # Returns Dot at DOWN (reflection of UP across horizontal line)
    """
    # Get point coordinates
    if isinstance(point, Dot):
        point_pos = point.get_center()
    else:
        point_pos = np.array(point)

    # Get line endpoints
    line_start = line.get_start()
    line_end = line.get_end()

    # Direction vector of the line
    line_vec = line_end - line_start

    # Vector from line start to point
    point_vec = point_pos - line_start

    # Calculate projection parameter t (not limited to [0, 1] for reflection)
    # t = (point_vec · line_vec) / (line_vec · line_vec)
    line_length_sq = np.dot(line_vec, line_vec)

    if line_length_sq == 0:
        # Degenerate line (start == end), return point at same position
        return Dot(point_pos)

    t = np.dot(point_vec, line_vec) / line_length_sq

    # Calculate projected point
    projected_point = line_start + t * line_vec

    # Reflection formula: reflected = 2 * projection - point
    reflected_point = 2 * projected_point - point_pos

    return Dot(reflected_point)


def extended_line(line: Line, proportion: float, length: float) -> Line:
    """
    Create a line extending from a point on an existing line.

    The new line starts at a point determined by the proportion parameter
    (0 = start of line, 1 = end of line) and extends in the same direction
    as the original line for the specified length.

    Args:
        line: The reference Line object
        proportion: Position on the line where the new line starts (0 to 1)
        length: Length of the new line extending from that point

    Returns:
        A new Line object extending from the specified point

    Raises:
        ValueError: If proportion is not between 0 and 1

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import extended_line
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> # Create a line from the endpoint extending right by 2 units
        >>> ext_line = extended_line(line, proportion=1.0, length=2.0)
        >>> # Create a line from midpoint extending right by 1 unit
        >>> mid_ext = extended_line(line, proportion=0.5, length=1.0)
    """
    if not 0 <= proportion <= 1:
        raise ValueError(f"proportion must be between 0 and 1, got {proportion}")

    # Get line endpoints
    start = line.get_start()
    end = line.get_end()

    # Calculate point at proportion t along the line
    point_on_line = start + proportion * (end - start)

    # Get direction vector and normalize
    direction = end - start
    direction_normalized = direction / np.linalg.norm(direction)

    # Create new line from that point, extending in the same direction
    new_start = point_on_line
    new_end = point_on_line + direction_normalized * length

    return Line(new_start, new_end)


# ============================================================================
# Aliases
# ============================================================================

def pll(line: Line, dot: Dot, length: float, placement: str = "mid") -> Line:
    """Alias for parallel(). See parallel() for full documentation."""
    return parallel(line, dot, length, placement)


def xl(line: Line, proportion: float, length: float) -> Line:
    """Alias for extended_line(). See extended_line() for full documentation."""
    return extended_line(line, proportion, length)

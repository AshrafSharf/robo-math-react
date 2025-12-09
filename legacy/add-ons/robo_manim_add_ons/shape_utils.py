"""
Shape utilities for creating Manim shapes with flexible inputs.

Provides helper functions for creating shapes like rectangles and triangles with various input formats.
"""

import numpy as np
from manim import Rectangle, Polygon, RED
from typing import Union


def rect(*args, **kwargs) -> Rectangle:
    """
    Create a Rectangle with flexible arguments.

    Args can be:
        - 2 args (numbers): (width, height)
        - 2 args (points): (left_bottom, top_right) where each is Dot/np.array/list
        - 4 args (points): (left_bottom, left_top, right_top, right_bottom)

    Additional args:
        **kwargs: Additional styling arguments (color, fill_opacity, etc.)

    Returns:
        A Rectangle object

    Raises:
        TypeError: If arguments don't match expected patterns
        ValueError: If wrong number of arguments provided

    Example:
        >>> from manim import Dot, ORIGIN
        >>> from robo_manim_add_ons import rect
        >>>
        >>> # From width and height
        >>> rectangle = rect(4, 3)  # Rectangle with width=4, height=3 centered at origin
        >>>
        >>> # From two corners (left-bottom and top-right)
        >>> lb = Dot([-2, -1, 0])
        >>> tr = Dot([2, 2, 0])
        >>> rectangle = rect(lb, tr)
        >>>
        >>> # From two arrays
        >>> rectangle = rect([-2, -1, 0], [2, 2, 0])
        >>>
        >>> # From four corners (left-bottom, left-top, right-top, right-bottom)
        >>> lb = [-2, -1.5, 0]
        >>> lt = [-2, 1.5, 0]
        >>> rt = [2, 1.5, 0]
        >>> rb = [2, -1.5, 0]
        >>> rectangle = rect(lb, lt, rt, rb)
    """
    def _is_number(arg):
        """Check if arg is a number"""
        return isinstance(arg, (int, float))

    def _is_point(arg):
        """Check if arg is a Dot/object or np.array"""
        return hasattr(arg, 'get_center') or isinstance(arg, (np.ndarray, list, tuple))

    def _extract_position(obj):
        """Extract position from Dot/object or np.array/list"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        elif isinstance(obj, (list, tuple)):
            return np.array(obj)
        else:
            raise TypeError(f"Expected Dot, np.array, or list, got {type(obj).__name__}")

    if len(args) == 2:
        # Could be: (width, height) OR (left_bottom, top_right)
        if _is_number(args[0]) and _is_number(args[1]):
            # Pattern: (width, height)
            width = args[0]
            height = args[1]

            rectangle = Rectangle(width=width, height=height, **kwargs)
            return rectangle

        elif _is_point(args[0]) and _is_point(args[1]):
            # Pattern: (left_bottom, top_right)
            lb_pos = _extract_position(args[0])
            tr_pos = _extract_position(args[1])

            # Calculate width, height, and center
            width = abs(tr_pos[0] - lb_pos[0])
            height = abs(tr_pos[1] - lb_pos[1])
            center_x = (lb_pos[0] + tr_pos[0]) / 2
            center_y = (lb_pos[1] + tr_pos[1]) / 2
            center = np.array([center_x, center_y, 0])

            rectangle = Rectangle(width=width, height=height, **kwargs)
            rectangle.move_to(center)
            return rectangle

        else:
            raise TypeError("For 2 arguments, expected (width, height) or (left_bottom, top_right)")

    elif len(args) == 4:
        # Pattern: (left_bottom, left_top, right_top, right_bottom)
        if not all(_is_point(arg) for arg in args):
            raise TypeError("For 4 arguments, all must be Dot objects, np.arrays, or lists")

        lb_pos = _extract_position(args[0])  # left-bottom
        lt_pos = _extract_position(args[1])  # left-top
        rt_pos = _extract_position(args[2])  # right-top
        rb_pos = _extract_position(args[3])  # right-bottom

        # Calculate width and height
        # Width: distance between left and right sides
        # Height: distance between top and bottom sides
        width = abs(rt_pos[0] - lt_pos[0])
        height = abs(lt_pos[1] - lb_pos[1])

        # Calculate center
        center_x = (lb_pos[0] + rt_pos[0]) / 2
        center_y = (lb_pos[1] + rt_pos[1]) / 2
        center = np.array([center_x, center_y, 0])

        rectangle = Rectangle(width=width, height=height, **kwargs)
        rectangle.move_to(center)
        return rectangle

    else:
        raise ValueError(f"rect() takes 2 or 4 arguments, got {len(args)}")


def tri_sss(a: float, b: float = None, c: float = None, **kwargs) -> Polygon:
    """
    Create a triangle using SSS (Side-Side-Side) construction.

    Given three side lengths, constructs a triangle. The first vertex is placed
    at the origin, the second vertex is placed at distance 'c' along the positive
    x-axis, and the third vertex is calculated using the law of cosines.

    Args:
        a: Length of side opposite to vertex A (between vertices B and C)
        b: Length of side opposite to vertex B (optional, defaults to 'a' for equilateral)
        c: Length of side opposite to vertex C (optional, defaults to 'a' for equilateral)
        **kwargs: Additional styling arguments (color, fill_opacity, etc.)

    Returns:
        A Polygon (triangle) object

    Raises:
        ValueError: If the three sides cannot form a valid triangle (triangle inequality)

    Example:
        >>> from robo_manim_add_ons import tri_sss
        >>>
        >>> # Create an equilateral triangle with side length 5
        >>> triangle = tri_sss(5)
        >>>
        >>> # Create a 3-4-5 right triangle
        >>> triangle = tri_sss(3, 4, 5)
        >>>
        >>> # Create an isosceles triangle
        >>> triangle = tri_sss(3, 3, 4)
    """
    # If b and c are not provided, create equilateral triangle
    if b is None and c is None:
        b = a
        c = a
    elif b is None or c is None:
        raise ValueError("Either provide 1 argument (equilateral) or 3 arguments (a, b, c)")
    # Check triangle inequality: sum of any two sides must be greater than the third
    if a + b <= c or a + c <= b or b + c <= a:
        raise ValueError(
            f"Invalid triangle sides: {a}, {b}, {c}. "
            "The sum of any two sides must be greater than the third side."
        )

    # Set default color to RED if not provided
    if 'color' not in kwargs:
        kwargs['color'] = RED

    # Place first vertex at origin
    A = np.array([0, 0, 0])

    # Place second vertex at distance c along x-axis
    B = np.array([c, 0, 0])

    # Calculate third vertex using law of cosines
    # Using cosine formula: c² = a² + b² - 2ab·cos(C)
    # Solving for angle at A: cos(A) = (b² + c² - a²) / (2bc)
    cos_A = (b**2 + c**2 - a**2) / (2 * b * c)

    # Clamp to [-1, 1] to handle floating point errors
    cos_A = max(-1, min(1, cos_A))

    angle_A = np.arccos(cos_A)

    # Third vertex C is at distance b from A at angle angle_A
    C = np.array([b * np.cos(angle_A), b * np.sin(angle_A), 0])

    return Polygon(A, B, C, **kwargs)


def tri_sas(a: float, angle_deg: float, b: float, **kwargs) -> Polygon:
    """
    Create a triangle using SAS (Side-Angle-Side) construction.

    Given two sides and the included angle between them, constructs a triangle.
    The first vertex is placed at the origin, the second side extends along the
    positive x-axis, and the angle is measured counterclockwise from the second side.

    Args:
        a: Length of the first side
        angle_deg: The included angle between the two sides (in degrees)
        b: Length of the second side
        **kwargs: Additional styling arguments (color, fill_opacity, etc.)

    Returns:
        A Polygon (triangle) object

    Raises:
        ValueError: If angle is not between 0 and 180 degrees
        ValueError: If side lengths are not positive

    Example:
        >>> from robo_manim_add_ons import tri_sas
        >>>
        >>> # Create a right triangle with sides 3 and 4 and 90° angle
        >>> triangle = tri_sas(3, 90, 4)
        >>>
        >>> # Create a triangle with sides 2 and 3 and 60° angle
        >>> triangle = tri_sas(2, 60, 3, color=BLUE)
        >>>
        >>> # Create an isosceles triangle with two sides of 3 and 45° angle
        >>> triangle = tri_sas(3, 45, 3)
    """
    # Validate inputs
    if a <= 0 or b <= 0:
        raise ValueError(f"Side lengths must be positive, got a={a}, b={b}")

    if not (0 < angle_deg < 180):
        raise ValueError(
            f"Angle must be between 0 and 180 degrees, got {angle_deg}"
        )

    # Set default color to RED if not provided
    if 'color' not in kwargs:
        kwargs['color'] = RED

    # Convert angle to radians
    angle_rad = np.radians(angle_deg)

    # Place first vertex at origin
    A = np.array([0, 0, 0])

    # Place second vertex at distance 'a' along x-axis
    B = np.array([a, 0, 0])

    # Place third vertex at distance 'b' from A at the given angle
    # Angle is measured counterclockwise from the positive x-axis
    C = np.array([b * np.cos(angle_rad), b * np.sin(angle_rad), 0])

    return Polygon(A, B, C, **kwargs)


def tri_ssa(a: float, b: float, angle_deg: float, **kwargs) -> Polygon:
    """
    Create a triangle using SSA (Side-Side-Angle) construction.

    Given two sides and an angle opposite to one of them. This is the ambiguous case
    that may have 0, 1, or 2 solutions. This function returns the first valid solution.

    Args:
        a: Length of the first side
        b: Length of the second side
        angle_deg: Angle opposite to side 'a' (in degrees)
        **kwargs: Additional styling arguments (color, fill_opacity, etc.)

    Returns:
        A Polygon (triangle) object

    Raises:
        ValueError: If no valid triangle can be formed

    Example:
        >>> from robo_manim_add_ons import tri_ssa
        >>>
        >>> # Create a triangle with sides 3, 5 and angle 30° opposite to side 3
        >>> triangle = tri_ssa(3, 5, 30)
    """
    # Validate inputs
    if a <= 0 or b <= 0:
        raise ValueError(f"Side lengths must be positive, got a={a}, b={b}")

    if not (0 < angle_deg < 180):
        raise ValueError(
            f"Angle must be between 0 and 180 degrees, got {angle_deg}"
        )

    # Set default color to RED if not provided
    if 'color' not in kwargs:
        kwargs['color'] = RED

    # Convert angle to radians
    angle_A = np.radians(angle_deg)

    # Use law of sines: a/sin(A) = b/sin(B)
    # sin(B) = b * sin(A) / a
    sin_B = b * np.sin(angle_A) / a

    # Check if solution exists
    if sin_B > 1:
        raise ValueError(
            f"No valid triangle with a={a}, b={b}, angle={angle_deg}°. "
            "The given values do not satisfy the law of sines."
        )

    # Calculate angle B (take the first solution)
    angle_B = np.arcsin(sin_B)

    # Calculate angle C
    angle_C = np.pi - angle_A - angle_B

    # Check if angle C is valid
    if angle_C <= 0:
        raise ValueError(
            f"No valid triangle with a={a}, b={b}, angle={angle_deg}°"
        )

    # Calculate side c using law of sines
    c = a * np.sin(angle_C) / np.sin(angle_A)

    # Use SAS to construct the triangle
    # Place vertices: A at origin, B at distance c along x-axis, C calculated
    A = np.array([0, 0, 0])
    B = np.array([c, 0, 0])

    # C is at distance b from A at angle (pi - angle_B)
    C = np.array([b * np.cos(angle_A), b * np.sin(angle_A), 0])

    return Polygon(A, B, C, **kwargs)

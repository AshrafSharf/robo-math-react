"""
Expression utilities for extracting coordinates from various object types.

Provides functions for extracting x and y coordinates from Manim objects,
numpy arrays, or lists.
"""

import numpy as np
from typing import Union
from manim import Line, Arrow, Dot, Polygon, Arc, Angle, Circle, Rectangle, RED, RightAngle
from .graph_utils import GraphUtils
from .shape_utils import rect as _rect, tri_sss as _sss, tri_sas as _sas, tri_ssa as _ssa


def x(obj: Union[object, np.ndarray, list]) -> float:
    """
    Extract the x-coordinate from various object types.

    Args:
        obj: Can be:
            - A Manim object with get_center() method (e.g., Dot, VMobject)
            - A NumPy array [x, y] or [x, y, z]
            - A Python list [x, y] or [x, y, z]

    Returns:
        The x-coordinate (first element) as a float

    Raises:
        TypeError: If the object type is not supported
        IndexError: If the array/list is empty

    Example:
        >>> from manim import Dot, ORIGIN
        >>> from robo_manim_add_ons import x
        >>>
        >>> dot = Dot(ORIGIN)
        >>> x_val = x(dot)  # Returns 0.0
        >>>
        >>> arr = np.array([1.5, 2.0, 0.0])
        >>> x_val = x(arr)  # Returns 1.5
        >>>
        >>> lst = [3.0, 4.0]
        >>> x_val = x(lst)  # Returns 3.0
    """
    # Check if object has get_center method (Manim object like Dot, VMobject, etc.)
    if hasattr(obj, 'get_center'):
        return obj.get_center()[0]
    # Check if it's a numpy array
    elif isinstance(obj, np.ndarray):
        return float(obj[0])
    # Check if it's a list
    elif isinstance(obj, (list, tuple)):
        return float(obj[0])
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_center(), numpy array, or list."
        )


def y(obj: Union[object, np.ndarray, list]) -> float:
    """
    Extract the y-coordinate from various object types.

    Args:
        obj: Can be:
            - A Manim object with get_center() method (e.g., Dot, VMobject)
            - A NumPy array [x, y] or [x, y, z]
            - A Python list [x, y] or [x, y, z]

    Returns:
        The y-coordinate (second element) as a float

    Raises:
        TypeError: If the object type is not supported
        IndexError: If the array/list has less than 2 elements

    Example:
        >>> from manim import Dot, UP
        >>> from robo_manim_add_ons import y
        >>>
        >>> dot = Dot(UP)
        >>> y_val = y(dot)  # Returns 1.0
        >>>
        >>> arr = np.array([1.5, 2.5, 0.0])
        >>> y_val = y(arr)  # Returns 2.5
        >>>
        >>> lst = [3.0, 4.0]
        >>> y_val = y(lst)  # Returns 4.0
    """
    # Check if object has get_center method (Manim object like Dot, VMobject, etc.)
    if hasattr(obj, 'get_center'):
        return obj.get_center()[1]
    # Check if it's a numpy array
    elif isinstance(obj, np.ndarray):
        return float(obj[1])
    # Check if it's a list
    elif isinstance(obj, (list, tuple)):
        return float(obj[1])
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_center(), numpy array, or list."
        )


def st(obj: Union[object, np.ndarray, list]) -> Dot:
    """
    Get the start point from various object types as a Dot.

    Args:
        obj: Can be:
            - A Manim object with get_start() method (e.g., Line, Arc, etc.)
            - A NumPy array [x, y] or [x, y, z]
            - A Python list [x, y] or [x, y, z]

    Returns:
        A Dot at the start point

    Raises:
        TypeError: If the object type is not supported

    Example:
        >>> from manim import Line, LEFT, RIGHT
        >>> from robo_manim_add_ons import st
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> dot = st(line)  # Dot at start of line
        >>>
        >>> arr = np.array([1.5, 2.0, 0.0])
        >>> dot = st(arr)  # Dot at [1.5, 2.0, 0.0]
        >>>
        >>> lst = [3.0, 4.0, 0.0]
        >>> dot = st(lst)  # Dot at [3.0, 4.0, 0.0]
    """
    # Check if object has get_start method (Manim object like Line, Arc, etc.)
    if hasattr(obj, 'get_start'):
        return Dot(obj.get_start())
    # Check if it's a numpy array
    elif isinstance(obj, np.ndarray):
        return Dot(obj)
    # Check if it's a list
    elif isinstance(obj, (list, tuple)):
        return Dot(np.array(obj))
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_start(), numpy array, or list."
        )


def ed(obj: Union[object, np.ndarray, list]) -> Dot:
    """
    Get the end point from various object types as a Dot.

    Args:
        obj: Can be:
            - A Manim object with get_end() method (e.g., Line, Arc, etc.)
            - A NumPy array [x, y] or [x, y, z]
            - A Python list [x, y] or [x, y, z]

    Returns:
        A Dot at the end point

    Raises:
        TypeError: If the object type is not supported

    Example:
        >>> from manim import Line, LEFT, RIGHT
        >>> from robo_manim_add_ons import ed
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> dot = ed(line)  # Dot at end of line
        >>>
        >>> arr = np.array([1.5, 2.0, 0.0])
        >>> dot = ed(arr)  # Dot at [1.5, 2.0, 0.0]
        >>>
        >>> lst = [3.0, 4.0, 0.0]
        >>> dot = ed(lst)  # Dot at [3.0, 4.0, 0.0]
    """
    # Check if object has get_end method (Manim object like Line, Arc, etc.)
    if hasattr(obj, 'get_end'):
        return Dot(obj.get_end())
    # Check if it's a numpy array
    elif isinstance(obj, np.ndarray):
        return Dot(obj)
    # Check if it's a list
    elif isinstance(obj, (list, tuple)):
        return Dot(np.array(obj))
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_end(), numpy array, or list."
        )


def mid(*args) -> Dot:
    """
    Get a Dot at the midpoint of an object or between two points.

    Args can be:
        - 1 arg: A Manim object with get_center() method (e.g., Line, Circle, VMobject, etc.)
        - 2 args: Two points (Dot objects, np.arrays, or lists) - returns midpoint between them

    Returns:
        A Dot at the midpoint

    Raises:
        TypeError: If the object type is not supported
        ValueError: If wrong number of arguments

    Example:
        >>> from manim import Line, Circle, Dot, LEFT, RIGHT, ORIGIN, UP
        >>> from robo_manim_add_ons import mid
        >>>
        >>> # Single argument - midpoint of object
        >>> line = Line(LEFT, RIGHT)
        >>> dot = mid(line)  # Dot at center of line
        >>>
        >>> circle = Circle(radius=2)
        >>> dot = mid(circle)  # Dot at center of circle
        >>>
        >>> # Two arguments - midpoint between two points
        >>> dot1 = Dot(ORIGIN)
        >>> dot2 = Dot(UP * 2)
        >>> midpoint = mid(dot1, dot2)  # Dot at (0, 1, 0)
        >>>
        >>> arr1 = np.array([0, 0, 0])
        >>> arr2 = np.array([4, 0, 0])
        >>> midpoint = mid(arr1, arr2)  # Dot at (2, 0, 0)
        >>>
        >>> # Mixed types
        >>> midpoint = mid(Dot(LEFT), np.array([1, 1, 0]))  # Dot at (0, 0.5, 0)
    """
    def _extract_position(obj):
        """Extract position from Dot/object or np.array"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        elif isinstance(obj, (list, tuple)):
            return np.array(obj)
        else:
            raise TypeError(f"Expected Dot, np.array, or list, got {type(obj).__name__}")

    if len(args) == 1:
        # Single argument - get center of object
        obj = args[0]
        if hasattr(obj, 'get_center'):
            return Dot(obj.get_center())
        else:
            raise TypeError(
                f"Unsupported type {type(obj).__name__}. "
                "Expected object with get_center() method."
            )

    elif len(args) == 2:
        # Two arguments - calculate midpoint between two points
        pos1 = _extract_position(args[0])
        pos2 = _extract_position(args[1])

        # Calculate midpoint
        midpoint = (pos1 + pos2) / 2
        return Dot(midpoint)

    else:
        raise ValueError(
            f"mid() takes 1 or 2 arguments, got {len(args)}"
        )


def mag(*args) -> float:
    """
    Get the magnitude/length from various object types, or distance between two points.

    Args can be:
        - 1 arg: Can be:
            - A Manim object with get_length() method (e.g., Line, Arc, etc.)
            - A NumPy array (calculates magnitude using np.linalg.norm)
            - A Python list (calculates magnitude after converting to array)
        - 2 args: Two points (Dot objects or np.arrays) - calculates distance between them

    Returns:
        The magnitude/length or distance as a float

    Raises:
        TypeError: If the object type is not supported
        ValueError: If wrong number of arguments

    Example:
        >>> from manim import Line, Dot, LEFT, RIGHT, ORIGIN, UP
        >>> from robo_manim_add_ons import mag
        >>>
        >>> # Single argument - magnitude of vector
        >>> line = Line(LEFT, RIGHT)
        >>> length = mag(line)  # Returns 2.0
        >>>
        >>> arr = np.array([3.0, 4.0, 0.0])
        >>> magnitude = mag(arr)  # Returns 5.0
        >>>
        >>> lst = [1.0, 0.0, 0.0]
        >>> magnitude = mag(lst)  # Returns 1.0
        >>>
        >>> # Two arguments - distance between points
        >>> dot1 = Dot(ORIGIN)
        >>> dot2 = Dot(UP * 3)
        >>> distance = mag(dot1, dot2)  # Returns 3.0
        >>>
        >>> arr1 = np.array([0.0, 0.0, 0.0])
        >>> arr2 = np.array([3.0, 4.0, 0.0])
        >>> distance = mag(arr1, arr2)  # Returns 5.0
    """
    def _extract_position(obj):
        """Extract position from Dot/object or np.array"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        elif isinstance(obj, (list, tuple)):
            return np.array(obj)
        else:
            raise TypeError(f"Expected Dot or np.array, got {type(obj).__name__}")

    if len(args) == 1:
        # Single argument - calculate magnitude
        obj = args[0]

        # Check if object has get_length method (Manim object like Line, Arc, etc.)
        if hasattr(obj, 'get_length'):
            return obj.get_length()
        # Check if it's a numpy array
        elif isinstance(obj, np.ndarray):
            return float(np.linalg.norm(obj))
        # Check if it's a list
        elif isinstance(obj, (list, tuple)):
            return float(np.linalg.norm(np.array(obj)))
        else:
            raise TypeError(
                f"Unsupported type {type(obj).__name__}. "
                "Expected object with get_length(), numpy array, or list."
            )

    elif len(args) == 2:
        # Two arguments - calculate distance between points
        pos1 = _extract_position(args[0])
        pos2 = _extract_position(args[1])

        # Calculate distance
        return float(np.linalg.norm(pos2 - pos1))

    else:
        raise ValueError(
            f"mag() takes 1 or 2 arguments, got {len(args)}"
        )


def uv(obj: Union[object, np.ndarray, list]) -> np.ndarray:
    """
    Get the unit vector from various object types.

    Args:
        obj: Can be:
            - A Manim object with get_unit_vector() method (e.g., Line, Vector, etc.)
            - A NumPy array (normalizes the vector)
            - A Python list (converts to array and normalizes)

    Returns:
        The unit vector as a numpy array

    Raises:
        TypeError: If the object type is not supported
        ValueError: If the vector has zero magnitude

    Example:
        >>> from manim import Line, LEFT, RIGHT
        >>> from robo_manim_add_ons import uv
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> unit = uv(line)  # Returns np.array([1., 0., 0.])
        >>>
        >>> arr = np.array([3.0, 4.0, 0.0])
        >>> unit = uv(arr)  # Returns np.array([0.6, 0.8, 0.])
        >>>
        >>> lst = [0.0, 5.0, 0.0]
        >>> unit = uv(lst)  # Returns np.array([0., 1., 0.])
    """
    # Check if object has get_unit_vector method (Manim object like Line, Vector, etc.)
    if hasattr(obj, 'get_unit_vector'):
        return obj.get_unit_vector()
    # Check if it's a numpy array
    elif isinstance(obj, np.ndarray):
        magnitude = np.linalg.norm(obj)
        if magnitude == 0:
            raise ValueError("Cannot compute unit vector of zero-magnitude vector")
        return obj / magnitude
    # Check if it's a list
    elif isinstance(obj, (list, tuple)):
        arr = np.array(obj)
        magnitude = np.linalg.norm(arr)
        if magnitude == 0:
            raise ValueError("Cannot compute unit vector of zero-magnitude vector")
        return arr / magnitude
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_unit_vector(), numpy array, or list."
        )


def vec(obj: Union[object, np.ndarray, list]) -> np.ndarray:
    """
    Get the vector from various object types.

    Args:
        obj: Can be:
            - A Manim object with get_vector() method (e.g., Line - returns end - start)
            - A NumPy array (returned as-is)
            - A Python list (converted to numpy array)

    Returns:
        The vector as a numpy array

    Raises:
        TypeError: If the object type is not supported

    Example:
        >>> from manim import Line, LEFT, RIGHT
        >>> from robo_manim_add_ons import vec
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> vector = vec(line)  # Returns np.array([2., 0., 0.])
        >>>
        >>> arr = np.array([1.5, 2.0, 0.0])
        >>> vector = vec(arr)  # Returns np.array([1.5, 2.0, 0.0])
        >>>
        >>> lst = [3.0, 4.0, 0.0]
        >>> vector = vec(lst)  # Returns np.array([3.0, 4.0, 0.0])
    """
    # Check if object has get_vector method (Manim object like Line, etc.)
    if hasattr(obj, 'get_vector'):
        return obj.get_vector()
    # Check if it's a numpy array
    elif isinstance(obj, np.ndarray):
        return obj
    # Check if it's a list
    elif isinstance(obj, (list, tuple)):
        return np.array(obj)
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_vector(), numpy array, or list."
        )


def ang(obj: Union[object, np.ndarray, list]) -> float:
    """
    Get the angle from various object types.

    Args:
        obj: Can be:
            - A Manim object with get_angle() method (e.g., Line)
            - A NumPy array (calculates angle using np.arctan2(y, x))
            - A Python list (calculates angle after converting to array)

    Returns:
        The angle in radians as a float

    Raises:
        TypeError: If the object type is not supported

    Example:
        >>> from manim import Line, LEFT, RIGHT, UP
        >>> from robo_manim_add_ons import ang
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> angle = ang(line)  # Returns 0.0 (horizontal line)
        >>>
        >>> arr = np.array([1.0, 1.0, 0.0])
        >>> angle = ang(arr)  # Returns π/4 (45 degrees)
        >>>
        >>> lst = [0.0, 1.0, 0.0]
        >>> angle = ang(lst)  # Returns π/2 (90 degrees)
    """
    # Check if object has get_angle method (Manim object like Line, etc.)
    if hasattr(obj, 'get_angle'):
        return obj.get_angle()
    # Check if it's a numpy array
    elif isinstance(obj, np.ndarray):
        return float(np.arctan2(obj[1], obj[0]))
    # Check if it's a list
    elif isinstance(obj, (list, tuple)):
        arr = np.array(obj)
        return float(np.arctan2(arr[1], arr[0]))
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_angle(), numpy array, or list."
        )


def slope(obj: Union[object, np.ndarray, list]) -> float:
    """
    Get the slope from various object types.

    Args:
        obj: Can be:
            - A Manim object with get_slope() method (e.g., Line)
            - A NumPy array (calculates slope as y/x)
            - A Python list (calculates slope after converting to array)

    Returns:
        The slope as a float

    Raises:
        TypeError: If the object type is not supported
        ValueError: If x-component is zero (vertical line)

    Example:
        >>> from manim import Line, ORIGIN, UP + RIGHT
        >>> from robo_manim_add_ons import slope
        >>>
        >>> line = Line(ORIGIN, UP + RIGHT)
        >>> slp = slope(line)  # Returns 1.0 (45 degree line)
        >>>
        >>> arr = np.array([2.0, 4.0, 0.0])
        >>> slp = slope(arr)  # Returns 2.0
        >>>
        >>> lst = [1.0, 3.0, 0.0]
        >>> slp = slope(lst)  # Returns 3.0
    """
    # Check if object has get_slope method (Manim object like Line, etc.)
    if hasattr(obj, 'get_slope'):
        return obj.get_slope()
    # Check if it's a numpy array
    elif isinstance(obj, np.ndarray):
        if obj[0] == 0:
            return float('inf') if obj[1] > 0 else float('-inf')
        return float(obj[1] / obj[0])
    # Check if it's a list
    elif isinstance(obj, (list, tuple)):
        arr = np.array(obj)
        if arr[0] == 0:
            return float('inf') if arr[1] > 0 else float('-inf')
        return float(arr[1] / arr[0])
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_slope(), numpy array, or list."
        )


def val(obj: Union[object, float, int]) -> float:
    """
    Get the value from various object types.

    Args:
        obj: Can be:
            - A Manim object with get_value() method (e.g., ValueTracker, Variable)
            - A numeric value (int or float, returned as-is)

    Returns:
        The value as a float

    Raises:
        TypeError: If the object type is not supported

    Example:
        >>> from manim import ValueTracker
        >>> from robo_manim_add_ons import val
        >>>
        >>> tracker = ValueTracker(5.0)
        >>> value = val(tracker)  # Returns 5.0
        >>>
        >>> num = 3.14
        >>> value = val(num)  # Returns 3.14
        >>>
        >>> integer = 42
        >>> value = val(integer)  # Returns 42.0
    """
    # Check if object has get_value method (Manim object like ValueTracker, Variable, etc.)
    if hasattr(obj, 'get_value'):
        return obj.get_value()
    # Check if it's already a numeric value
    elif isinstance(obj, (int, float)):
        return float(obj)
    else:
        raise TypeError(
            f"Unsupported type {type(obj).__name__}. "
            "Expected object with get_value() or numeric value."
        )


def pt(x: float, y: float, z: float = 0) -> Dot:
    """
    Create a Dot at the specified coordinates.

    Args:
        x: The x-coordinate
        y: The y-coordinate
        z: The z-coordinate (default: 0)

    Returns:
        A Dot at position [x, y, z]

    Example:
        >>> from robo_manim_add_ons import pt
        >>>
        >>> dot = pt(1, 2)  # Dot at [1, 2, 0]
        >>>
        >>> dot = pt(3.5, 4.5)  # Dot at [3.5, 4.5, 0]
        >>>
        >>> dot = pt(1, 2, 3)  # Dot at [1, 2, 3]
    """
    return Dot(np.array([x, y, z]))


def m2v(axes, x: float, y: float) -> Dot:
    """
    Convert model coordinates to view coordinates and return as a Dot.

    Args:
        axes: The Axes object with c2p method
        x: The x-coordinate in model space
        y: The y-coordinate in model space

    Returns:
        A Dot at the screen point corresponding to the model coordinates

    Example:
        >>> from manim import Axes
        >>> from robo_manim_add_ons import m2v
        >>>
        >>> axes = Axes(x_range=[-5, 5], y_range=[-5, 5])
        >>> dot = m2v(axes, 2, 3)  # Dot at screen coordinates for (2, 3) in model space
    """
    return Dot(axes.c2p(x, y))


def v2m(axes, x: float, y: float) -> Dot:
    """
    Convert view coordinates (screen point) to model coordinates and return as a Dot.

    Args:
        axes: The Axes object with p2c method
        x: The x-coordinate in screen space
        y: The y-coordinate in screen space

    Returns:
        A Dot at the model coordinates corresponding to the screen point

    Example:
        >>> from manim import Axes
        >>> from robo_manim_add_ons import v2m
        >>>
        >>> axes = Axes(x_range=[-5, 5], y_range=[-5, 5])
        >>> dot = v2m(axes, 1.5, 2.0)  # Dot at model coordinates for screen point (1.5, 2.0)
    """
    return Dot(axes.p2c(np.array([x, y, 0])))


def x2v(axes, graph, x: float) -> Dot:
    """
    Get a Dot on a graph at a given x-value.

    This is a wrapper for axes.i2gp(x, graph) that returns a Dot.

    Args:
        axes: The Axes object with i2gp method
        graph: The ParametricFunction (graph) object
        x: The x-value on the graph

    Returns:
        A Dot at the point on the graph corresponding to the x-value

    Example:
        >>> from manim import Axes
        >>> from robo_manim_add_ons import x2v
        >>>
        >>> axes = Axes(x_range=[-5, 5], y_range=[-5, 5])
        >>> parabola = axes.plot(lambda x: x**2)
        >>> dot = x2v(axes, parabola, 2)  # Dot on parabola at x=2
    """
    return Dot(axes.i2gp(x, graph))


def vl(x: float, y1: float = -20, y2: float = 20) -> Line:
    """
    Create a vertical line at x-coordinate from y1 to y2.

    Args:
        x: The x-coordinate of the vertical line
        y1: The starting y-coordinate (default: -20)
        y2: The ending y-coordinate (default: 20)

    Returns:
        A Line object representing the vertical line

    Example:
        >>> from robo_manim_add_ons import vl
        >>>
        >>> line = vl(2)         # Vertical line at x=2 from y=-20 to y=20
        >>> line = vl(2, -3, 3)  # Vertical line at x=2 from y=-3 to y=3
        >>> line = vl(0, 0, 5)   # Vertical line at x=0 from y=0 to y=5
    """
    return Line(np.array([x, y1, 0]), np.array([x, y2, 0]))


def hl(y: float, x1: float = -20, x2: float = 20) -> Line:
    """
    Create a horizontal line at y-coordinate from x1 to x2.

    Args:
        y: The y-coordinate of the horizontal line
        x1: The starting x-coordinate (default: -20)
        x2: The ending x-coordinate (default: 20)

    Returns:
        A Line object representing the horizontal line

    Example:
        >>> from robo_manim_add_ons import hl
        >>>
        >>> line = hl(3)         # Horizontal line at y=3 from x=-20 to x=20
        >>> line = hl(3, -2, 2)  # Horizontal line at y=3 from x=-2 to x=2
        >>> line = hl(0, 0, 5)   # Horizontal line at y=0 from x=0 to x=5
    """
    return Line(np.array([x1, y, 0]), np.array([x2, y, 0]))


def lra(radius: float, angle: float, from_x: float = 0, from_y: float = 0) -> Line:
    """
    Create a line using polar coordinates (radius and angle).

    Args:
        radius: The radius (distance from starting point)
        angle: The angle in degrees
        from_x: The x-coordinate of the starting point (default: 0)
        from_y: The y-coordinate of the starting point (default: 0)

    Returns:
        A Line object from (from_x, from_y) to the point at radius and angle

    Example:
        >>> from robo_manim_add_ons import lra
        >>>
        >>> line = lra(2, 45)        # Line from origin, radius 2 at 45 degrees
        >>> line = lra(3, 90, 1, 1)  # Line from (1,1), radius 3 at 90 degrees
        >>> line = lra(1, 0, 2, 0)   # Line from (2,0), radius 1 at 0 degrees
    """
    angle_rad = np.radians(angle)
    dx = radius * np.cos(angle_rad)
    dy = radius * np.sin(angle_rad)
    return Line(np.array([from_x, from_y, 0]), np.array([from_x + dx, from_y + dy, 0]))


def vra(radius: float, angle: float, from_x: float = 0, from_y: float = 0) -> Arrow:
    """
    Create an arrow using polar coordinates (radius and angle).

    Args:
        radius: The radius (distance from starting point)
        angle: The angle in degrees
        from_x: The x-coordinate of the starting point (default: 0)
        from_y: The y-coordinate of the starting point (default: 0)

    Returns:
        An Arrow object from (from_x, from_y) to the point at radius and angle

    Example:
        >>> from robo_manim_add_ons import vra
        >>>
        >>> arrow = vra(2, 45)        # Arrow from origin, radius 2 at 45 degrees
        >>> arrow = vra(1, 90, 1, 1)  # Arrow from (1,1), radius 1 at 90 degrees
        >>> arrow = vra(3, 0, 2, 0)   # Arrow from (2,0), radius 3 at 0 degrees
    """
    angle_rad = np.radians(angle)
    dx = radius * np.cos(angle_rad)
    dy = radius * np.sin(angle_rad)
    start_point = np.array([from_x, from_y, 0])
    end_point = np.array([from_x + dx, from_y + dy, 0])
    return Arrow(start=start_point, end=end_point)


def r2p(obj, proportion: float) -> Dot:
    """
    Get a point at a proportion along an object and return it as a Dot.

    Args:
        obj: A Manim object with point_from_proportion method (e.g., Line, Arc, VMobject)
        proportion: The proportion along the object (0 = start, 1 = end)

    Returns:
        A Dot at the point corresponding to the given proportion

    Example:
        >>> from manim import Line, LEFT, RIGHT
        >>> from robo_manim_add_ons import r2p
        >>>
        >>> line = Line(LEFT, RIGHT)
        >>> dot = r2p(line, 0.5)   # Dot at midpoint of line
        >>> dot = r2p(line, 0.25)  # Dot at 25% along the line
        >>> dot = r2p(line, 1)     # Dot at end of line
    """
    point = obj.point_from_proportion(proportion)
    return Dot(point)


def a2p(circle, angle_degrees: float) -> Dot:
    """
    Get a point on a circle at a given angle and return it as a Dot.

    Args:
        circle: A Manim Circle object
        angle_degrees: The angle in degrees (0 = right, 90 = top, 180 = left, 270 = bottom)

    Returns:
        A Dot at the point on the circle at the given angle

    Example:
        >>> from manim import Circle
        >>> from robo_manim_add_ons import a2p
        >>>
        >>> circle = Circle()
        >>> dot = a2p(circle, 0)    # Dot at right (3 o'clock)
        >>> dot = a2p(circle, 90)   # Dot at top (12 o'clock)
        >>> dot = a2p(circle, 180)  # Dot at left (9 o'clock)
    """
    angle_radians = angle_degrees * np.pi / 180
    point = circle.point_at_angle(angle_radians)
    return Dot(point)


def ln(*args) -> Line:
    """
    Create a red Line with flexible arguments.

    Args can be:
        - 2 args: two Dots/objects or np.arrays (start, end)
        - 3 args: one Dot/object/np.array and two numbers
          - (dot, x, y): from dot to (x, y)
          - (x, y, dot): from (x, y) to dot
        - 4 args: four numbers (x1, y1, x2, y2)

    Returns:
        A red Line object

    Example:
        >>> from manim import Dot, ORIGIN, UP
        >>> from robo_manim_add_ons import ln
        >>>
        >>> # With two dots
        >>> line = ln(Dot(ORIGIN), Dot(UP))
        >>>
        >>> # With two arrays
        >>> line = ln(np.array([0, 0, 0]), np.array([1, 1, 0]))
        >>>
        >>> # With dot and coordinates
        >>> line = ln(Dot(ORIGIN), 1, 2)
        >>>
        >>> # With coordinates and dot
        >>> line = ln(0, 0, Dot(UP))
        >>>
        >>> # With four numbers
        >>> line = ln(0, 0, 1, 2)
    """
    from manim import RED

    def _is_object(arg):
        """Check if arg is a Dot/object or np.array"""
        return hasattr(arg, 'get_center') or isinstance(arg, np.ndarray)

    def _is_number(arg):
        """Check if arg is a number"""
        return isinstance(arg, (int, float))

    def _extract_position(obj):
        """Extract position from Dot/object or np.array"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        else:
            raise TypeError(f"Expected Dot or np.array, got {type(obj).__name__}")

    if len(args) == 2:
        # Two objects (Dots or arrays)
        start_pos = _extract_position(args[0])
        end_pos = _extract_position(args[1])
        return Line(start_pos, end_pos, color=RED)

    elif len(args) == 3:
        # One dot/array and two numbers
        # Check if first arg is object and last two are numbers
        if _is_object(args[0]) and _is_number(args[1]) and _is_number(args[2]):
            # Pattern: (dot, x, y)
            start_pos = _extract_position(args[0])
            end_pos = np.array([args[1], args[2], 0])
        # Check if first two are numbers and last is object
        elif _is_number(args[0]) and _is_number(args[1]) and _is_object(args[2]):
            # Pattern: (x, y, dot)
            start_pos = np.array([args[0], args[1], 0])
            end_pos = _extract_position(args[2])
        else:
            raise TypeError(
                "For 3 arguments, expected either (dot, x, y) or (x, y, dot)"
            )
        return Line(start_pos, end_pos, color=RED)

    elif len(args) == 4:
        # Four numbers
        if not all(_is_number(arg) for arg in args):
            raise TypeError("For 4 arguments, all must be numbers")
        x1, y1, x2, y2 = args
        start_pos = np.array([x1, y1, 0])
        end_pos = np.array([x2, y2, 0])
        return Line(start_pos, end_pos, color=RED)
    else:
        raise ValueError(
            f"ln() takes 2, 3, or 4 arguments, got {len(args)}"
        )


def vt(*args) -> Arrow:
    """
    Create a red Arrow with flexible arguments.

    Args can be:
        - 2 args: two Dots/objects or np.arrays (start, end)
        - 3 args: one Dot/object/np.array and two numbers
          - (dot, x, y): from dot to (x, y)
          - (x, y, dot): from (x, y) to dot
        - 4 args: four numbers (x1, y1, x2, y2)

    Returns:
        A red Arrow object

    Example:
        >>> from manim import Dot, ORIGIN, UP
        >>> from robo_manim_add_ons import vt
        >>>
        >>> # With two dots
        >>> arrow = vt(Dot(ORIGIN), Dot(UP))
        >>>
        >>> # With two arrays
        >>> arrow = vt(np.array([0, 0, 0]), np.array([1, 1, 0]))
        >>>
        >>> # With dot and coordinates
        >>> arrow = vt(Dot(ORIGIN), 1, 2)
        >>>
        >>> # With coordinates and dot
        >>> arrow = vt(0, 0, Dot(UP))
        >>>
        >>> # With four numbers
        >>> arrow = vt(0, 0, 1, 2)
    """
    from manim import RED

    def _is_object(arg):
        """Check if arg is a Dot/object or np.array"""
        return hasattr(arg, 'get_center') or isinstance(arg, np.ndarray)

    def _is_number(arg):
        """Check if arg is a number"""
        return isinstance(arg, (int, float))

    def _extract_position(obj):
        """Extract position from Dot/object or np.array"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        else:
            raise TypeError(f"Expected Dot or np.array, got {type(obj).__name__}")

    if len(args) == 2:
        # Two objects (Dots or arrays)
        start_pos = _extract_position(args[0])
        end_pos = _extract_position(args[1])
        return Arrow(start_pos, end_pos, color=RED)

    elif len(args) == 3:
        # One dot/array and two numbers
        # Check if first arg is object and last two are numbers
        if _is_object(args[0]) and _is_number(args[1]) and _is_number(args[2]):
            # Pattern: (dot, x, y)
            start_pos = _extract_position(args[0])
            end_pos = np.array([args[1], args[2], 0])
        # Check if first two are numbers and last is object
        elif _is_number(args[0]) and _is_number(args[1]) and _is_object(args[2]):
            # Pattern: (x, y, dot)
            start_pos = np.array([args[0], args[1], 0])
            end_pos = _extract_position(args[2])
        else:
            raise TypeError(
                "For 3 arguments, expected either (dot, x, y) or (x, y, dot)"
            )
        return Arrow(start_pos, end_pos, color=RED)

    elif len(args) == 4:
        # Four numbers
        if not all(_is_number(arg) for arg in args):
            raise TypeError("For 4 arguments, all must be numbers")
        x1, y1, x2, y2 = args
        start_pos = np.array([x1, y1, 0])
        end_pos = np.array([x2, y2, 0])
        return Arrow(start_pos, end_pos, color=RED)
    else:
        raise ValueError(
            f"vt() takes 2, 3, or 4 arguments, got {len(args)}"
        )


def tri(p1, p2, p3) -> Polygon:
    """
    Create a red triangle from three points.

    Args:
        p1: First vertex (Dot/object or np.array)
        p2: Second vertex (Dot/object or np.array)
        p3: Third vertex (Dot/object or np.array)

    Returns:
        A red Polygon (triangle) object

    Example:
        >>> from manim import Dot, ORIGIN, UP, RIGHT
        >>> from robo_manim_add_ons import tri
        >>>
        >>> # With three dots
        >>> triangle = tri(Dot(ORIGIN), Dot(UP), Dot(RIGHT))
        >>>
        >>> # With three arrays
        >>> triangle = tri(np.array([0, 0, 0]), np.array([0, 1, 0]), np.array([1, 0, 0]))
        >>>
        >>> # With mixed dots and arrays
        >>> triangle = tri(Dot(ORIGIN), np.array([0, 1, 0]), Dot(RIGHT))
    """
    from manim import RED

    def _extract_position(obj):
        """Extract position from Dot/object or np.array"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        else:
            raise TypeError(f"Expected Dot or np.array, got {type(obj).__name__}")

    pos1 = _extract_position(p1)
    pos2 = _extract_position(p2)
    pos3 = _extract_position(p3)

    return Polygon(pos1, pos2, pos3, color=RED)


def aa(*args, radius=0.5, dash=True, **kwargs):
    """
    Create an angle arc visualization using ArcArrow.

    Args can be:
        - 3 args: three points/dots (p1, vertex, p3) where vertex is the angle vertex
        - 2 args: two Line objects (line1, line2) - intersection point is the vertex

    Additional args:
        radius: Radius of the angle arc (default: 0.5)
        dash: If True, creates dashed arc; if False, creates solid arc (default: True)
        **kwargs: Additional styling arguments (color, buff, etc.)

    Returns:
        An ArcArrow object representing the angle arc, or empty VGroup if lines are parallel

    Raises:
        TypeError: If arguments don't match expected patterns

    Example:
        >>> from manim import Dot, Line, ORIGIN, UP, RIGHT, VGroup
        >>> from robo_manim_add_ons import aa
        >>>
        >>> # With three points (vertex in middle)
        >>> angle_arc = aa(Dot(RIGHT), Dot(ORIGIN), Dot(UP))
        >>>
        >>> # With three arrays
        >>> angle_arc = aa(np.array([1, 0, 0]), np.array([0, 0, 0]), np.array([0, 1, 0]))
        >>>
        >>> # With two lines
        >>> line1 = Line(ORIGIN, RIGHT)
        >>> line2 = Line(ORIGIN, UP)
        >>> angle_arc = aa(line1, line2, radius=0.8)
        >>>
        >>> # Solid angle arc (no dashes)
        >>> angle_arc = aa(Dot(RIGHT), Dot(ORIGIN), Dot(UP), dash=False, radius=0.7)
        >>>
        >>> # Parallel lines return empty VGroup
        >>> line3 = Line(LEFT, RIGHT)
        >>> line4 = Line(LEFT + UP, RIGHT + UP)
        >>> result = aa(line3, line4)  # Returns empty VGroup
    """
    from manim import VGroup
    from .custom_objects import ArcArrow, ArcDashedVMobject
    from .intersection_utils import intersect_lines

    def _is_line(arg):
        """Check if arg is a Line object"""
        return isinstance(arg, Line)

    def _is_point(arg):
        """Check if arg is a Dot/object or np.array"""
        return hasattr(arg, 'get_center') or isinstance(arg, np.ndarray)

    def _extract_position(obj):
        """Extract position from Dot/object or np.array"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        else:
            raise TypeError(f"Expected Dot or np.array, got {type(obj).__name__}")

    # Set default color if not provided
    if 'color' not in kwargs:
        kwargs['color'] = RED

    # Map dash parameter to line_class for ArcArrow
    if dash:
        kwargs['line_class'] = ArcDashedVMobject
    else:
        kwargs['line_class'] = None

    if len(args) == 2:
        # Two lines case
        if not (_is_line(args[0]) and _is_line(args[1])):
            raise TypeError("For 2 arguments, both must be Line objects")

        line1, line2 = args

        # Find intersection point
        intersection = intersect_lines(line1, line2)
        if len(intersection) == 0:
            # Lines are parallel, return empty VGroup
            return VGroup()

        vertex_pos = intersection.get_center()

        # Get angles of the lines
        angle1 = line1.get_angle()
        angle2 = line2.get_angle()

        # Calculate angle span
        angle_span = angle2 - angle1

        # Normalize angle span to be between -π and π
        while angle_span > np.pi:
            angle_span -= 2 * np.pi
        while angle_span < -np.pi:
            angle_span += 2 * np.pi

        # Create arc
        arc = Arc(
            radius=radius,
            start_angle=angle1,
            angle=angle_span,
            arc_center=vertex_pos
        )

        return ArcArrow(arc, **kwargs)

    elif len(args) == 3:
        # Three points case
        if not all(_is_point(arg) for arg in args):
            raise TypeError("For 3 arguments, all must be Dot objects or np.arrays")

        p1, vertex, p3 = args

        # Extract positions
        p1_pos = _extract_position(p1)
        vertex_pos = _extract_position(vertex)
        p3_pos = _extract_position(p3)

        # Create vectors from vertex to p1 and p3
        v1 = p1_pos - vertex_pos
        v2 = p3_pos - vertex_pos

        # Calculate angles
        start_angle = float(np.arctan2(v1[1], v1[0]))
        end_angle = float(np.arctan2(v2[1], v2[0]))

        # Calculate angle span
        angle_span = end_angle - start_angle

        # Normalize angle span to be between -π and π
        while angle_span > np.pi:
            angle_span -= 2 * np.pi
        while angle_span < -np.pi:
            angle_span += 2 * np.pi

        # Create arc
        arc = Arc(
            radius=radius,
            start_angle=start_angle,
            angle=angle_span,
            arc_center=vertex_pos
        )

        return ArcArrow(arc, **kwargs)

    else:
        raise ValueError(f"aa() takes 2 or 3 arguments, got {len(args)}")


def aa2(*args, radius=0.5, **kwargs):
    """
    Create an angle visualization using Manim's Angle class with explicit quadrant control.

    This function provides flexible input handling similar to aa(), but uses Manim's
    Angle class and allows explicit control over angle direction via the quadrant parameter.

    Args can be:
        - 2 args: (line1, line2) - two Line objects
        - 3 args: (line1, line2, quadrant) - two lines + quadrant/other_angle
               OR (p1, vertex, p3) - three points (vertex is the angle vertex)
        - 4 args: (p1, vertex, p3, quadrant) - three points + quadrant/other_angle

    Additional args:
        radius: Radius of the angle arc (default: 0.5)
        **kwargs: Additional styling arguments (color, stroke_width, etc.)

    Quadrant parameter:
        - Number (1 or -1): Controls direction
          - 1: counterclockwise (default)
          - -1: clockwise
        - Boolean (True/False): Controls reflex angle
          - True: use reflex/other angle
          - False: use default angle

    Returns:
        A Manim Angle object, or empty VGroup if lines are parallel

    Raises:
        TypeError: If arguments don't match expected patterns

    Example:
        >>> from manim import Dot, Line, ORIGIN, UP, RIGHT
        >>> from robo_manim_add_ons import aa2
        >>>
        >>> # With two lines (default counterclockwise)
        >>> line1 = Line(ORIGIN, RIGHT)
        >>> line2 = Line(ORIGIN, UP)
        >>> angle = aa2(line1, line2)
        >>>
        >>> # Clockwise angle
        >>> angle = aa2(line1, line2, -1)
        >>>
        >>> # Reflex angle
        >>> angle = aa2(line1, line2, True)
        >>>
        >>> # With three points
        >>> angle = aa2(Dot(RIGHT), Dot(ORIGIN), Dot(UP))
        >>>
        >>> # Three points with clockwise direction
        >>> angle = aa2(np.array([1, 0, 0]), np.array([0, 0, 0]), np.array([0, 1, 0]), -1)
    """
    from manim import VGroup
    from .intersection_utils import intersect_lines

    def _is_line(arg):
        """Check if arg is a Line object"""
        return isinstance(arg, Line)

    def _is_point(arg):
        """Check if arg is a Dot/object or np.array"""
        return hasattr(arg, 'get_center') or isinstance(arg, np.ndarray)

    def _extract_position(obj):
        """Extract position from Dot/object or np.array"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        else:
            raise TypeError(f"Expected Dot or np.array, got {type(obj).__name__}")

    # Set default color if not provided
    if 'color' not in kwargs:
        kwargs['color'] = RED

    # Parse arguments to determine pattern
    if len(args) == 2:
        # Two lines case, no quadrant specified
        if not (_is_line(args[0]) and _is_line(args[1])):
            raise TypeError("For 2 arguments, both must be Line objects")

        line1, line2 = args

        # Check if lines intersect
        intersection = intersect_lines(line1, line2)
        if len(intersection) == 0:
            # Lines are parallel, return empty VGroup
            return VGroup()

        # Create Angle with default quadrant
        return Angle(line1, line2, radius=radius, **kwargs)

    elif len(args) == 3:
        # Could be: (line1, line2, quadrant) OR (p1, vertex, p3)
        if _is_line(args[0]) and _is_line(args[1]):
            # Pattern: (line1, line2, quadrant)
            line1, line2 = args[0], args[1]
            quadrant_param = args[2]

            # Check if lines intersect
            intersection = intersect_lines(line1, line2)
            if len(intersection) == 0:
                # Lines are parallel, return empty VGroup
                return VGroup()

            # Process quadrant parameter
            if isinstance(quadrant_param, bool):
                # Boolean -> use as other_angle
                return Angle(line1, line2, radius=radius, other_angle=quadrant_param, **kwargs)
            elif isinstance(quadrant_param, (int, float)):
                # Number -> use as quadrant
                return Angle(line1, line2, radius=radius, quadrant=(quadrant_param,), **kwargs)
            else:
                raise TypeError(f"Quadrant parameter must be bool or number, got {type(quadrant_param).__name__}")

        elif all(_is_point(arg) for arg in args):
            # Pattern: (p1, vertex, p3) - three points, no quadrant
            p1, vertex, p3 = args

            # Extract positions
            p1_pos = _extract_position(p1)
            vertex_pos = _extract_position(vertex)
            p3_pos = _extract_position(p3)

            # Create Angle from three points
            return Angle.from_three_points(p1_pos, vertex_pos, p3_pos, radius=radius, **kwargs)

        else:
            raise TypeError("For 3 arguments, expected either (line1, line2, quadrant) or (p1, vertex, p3)")

    elif len(args) == 4:
        # Pattern: (p1, vertex, p3, quadrant)
        if not all(_is_point(arg) for arg in args[:3]):
            raise TypeError("For 4 arguments, first 3 must be Dot objects or np.arrays")

        p1, vertex, p3 = args[:3]
        quadrant_param = args[3]

        # Extract positions
        p1_pos = _extract_position(p1)
        vertex_pos = _extract_position(vertex)
        p3_pos = _extract_position(p3)

        # Process quadrant parameter
        if isinstance(quadrant_param, bool):
            # Boolean -> use as other_angle
            return Angle.from_three_points(p1_pos, vertex_pos, p3_pos, radius=radius, other_angle=quadrant_param, **kwargs)
        elif isinstance(quadrant_param, (int, float)):
            # Number -> use as quadrant
            return Angle.from_three_points(p1_pos, vertex_pos, p3_pos, radius=radius, quadrant=(quadrant_param,), **kwargs)
        else:
            raise TypeError(f"Quadrant parameter must be bool or number, got {type(quadrant_param).__name__}")

    else:
        raise ValueError(f"aa2() takes 2, 3, or 4 arguments, got {len(args)}")


def rangle(line1: Line, line2: Line, length: float = 0.3, quadrant: tuple = (1, 1), **kwargs) -> RightAngle:
    """
    Create a right angle marker (L-shape) at the intersection of two lines.

    The L-shape is drawn at the intersection point of the two lines to indicate
    a 90-degree angle. The quadrant parameter controls which of the four possible
    positions the marker appears in.

    Args:
        line1: First Line object
        line2: Second Line object
        length: Length of the L-shape arms (default: 0.3)
        quadrant: Tuple (x, y) controlling placement:
                  (1, 1) = upper-right quadrant (default)
                  (1, -1) = lower-right quadrant
                  (-1, 1) = upper-left quadrant
                  (-1, -1) = lower-left quadrant
        **kwargs: Additional styling (color, stroke_width, etc.)

    Returns:
        RightAngle object (L-shaped marker)

    Example:
        >>> from manim import Line, LEFT, RIGHT, UP, DOWN
        >>> from robo_manim_add_ons import rangle
        >>>
        >>> line1 = Line(LEFT, RIGHT)
        >>> line2 = Line(DOWN, UP)
        >>>
        >>> # Default: upper-right quadrant
        >>> marker = rangle(line1, line2)
        >>>
        >>> # Lower-right quadrant
        >>> marker = rangle(line1, line2, quadrant=(1, -1))
        >>>
        >>> # Upper-left quadrant with custom length and color
        >>> marker = rangle(line1, line2, length=0.5, quadrant=(-1, 1), color=RED)
        >>>
        >>> # All four quadrants
        >>> markers = [
        ...     rangle(line1, line2, quadrant=(1, 1)),    # upper-right
        ...     rangle(line1, line2, quadrant=(1, -1)),   # lower-right
        ...     rangle(line1, line2, quadrant=(-1, 1)),   # upper-left
        ...     rangle(line1, line2, quadrant=(-1, -1)),  # lower-left
        ... ]
    """
    return RightAngle(line1, line2, length=length, quadrant=quadrant, **kwargs)


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

    Example:
        >>> from robo_manim_add_ons import rect
        >>>
        >>> # From width and height
        >>> rectangle = rect(4, 3)
        >>>
        >>> # From two corners (left-bottom and top-right)
        >>> rectangle = rect([-2, -1, 0], [2, 2, 0])
        >>>
        >>> # From four corners
        >>> rectangle = rect([-2, -1.5, 0], [-2, 1.5, 0], [2, 1.5, 0], [2, -1.5, 0])
    """
    return _rect(*args, **kwargs)


def sss(a: float, b: float = None, c: float = None, **kwargs) -> Polygon:
    """
    Create a triangle using SSS (Side-Side-Side) construction.

    Args:
        a: Length of side (if only arg, creates equilateral triangle)
        b: Length of second side (optional, defaults to 'a' for equilateral)
        c: Length of third side (optional, defaults to 'a' for equilateral)
        **kwargs: Additional styling arguments (color, fill_opacity, etc.)

    Returns:
        A Polygon (triangle) object (red by default)

    Example:
        >>> from robo_manim_add_ons import sss
        >>>
        >>> # Equilateral triangle with side length 5
        >>> triangle = sss(5)
        >>>
        >>> # 3-4-5 right triangle
        >>> triangle = sss(3, 4, 5)
        >>>
        >>> # Isosceles triangle
        >>> triangle = sss(3, 3, 4)
    """
    return _sss(a, b, c, **kwargs)


def sas(a: float, angle_deg: float, b: float, **kwargs) -> Polygon:
    """
    Create a triangle using SAS (Side-Angle-Side) construction.

    Args:
        a: Length of the first side
        angle_deg: The included angle between the two sides (in degrees)
        b: Length of the second side
        **kwargs: Additional styling arguments (color, fill_opacity, etc.)

    Returns:
        A Polygon (triangle) object (red by default)

    Example:
        >>> from robo_manim_add_ons import sas
        >>>
        >>> # Right triangle with sides 3 and 4
        >>> triangle = sas(3, 90, 4)
        >>>
        >>> # Triangle with 60° angle
        >>> triangle = sas(2, 60, 3)
    """
    return _sas(a, angle_deg, b, **kwargs)


def ssa(a: float, b: float, angle_deg: float, **kwargs) -> Polygon:
    """
    Create a triangle using SSA (Side-Side-Angle) construction.

    This is the ambiguous case. Returns the first valid solution.

    Args:
        a: Length of the first side
        b: Length of the second side
        angle_deg: Angle opposite to side 'a' (in degrees)
        **kwargs: Additional styling arguments (color, fill_opacity, etc.)

    Returns:
        A Polygon (triangle) object (red by default)

    Example:
        >>> from robo_manim_add_ons import ssa
        >>>
        >>> triangle = ssa(3, 5, 30)
    """
    return _ssa(a, b, angle_deg, **kwargs)


def cr(*args, **kwargs) -> Circle:
    """
    Create a Circle with flexible arguments.

    Args can be:
        - 1 arg: Line object - center at line.get_center(), diameter = line length
        - 2 args:
            - (center, radius) where center is Dot/np.array and radius is number
            - (dot1, dot2) where midpoint is center and distance is diameter

    Additional args:
        **kwargs: Additional styling arguments (color, stroke_width, etc.)

    Returns:
        A Circle object

    Raises:
        TypeError: If arguments don't match expected patterns

    Example:
        >>> from manim import Line, Dot, ORIGIN, UP, RIGHT
        >>> from robo_manim_add_ons import cr
        >>>
        >>> # From a line (center at line center, diameter = line length)
        >>> line = Line(ORIGIN, RIGHT * 2)
        >>> circle = cr(line)  # Circle with center at (1, 0), radius 1
        >>>
        >>> # From center and radius
        >>> circle = cr(Dot(ORIGIN), 2)  # Circle at origin with radius 2
        >>> circle = cr(np.array([1, 1, 0]), 1.5)  # Circle at (1,1) with radius 1.5
        >>>
        >>> # From two dots (diameter is distance between them)
        >>> dot1 = Dot(LEFT)
        >>> dot2 = Dot(RIGHT)
        >>> circle = cr(dot1, dot2)  # Circle with center at origin, radius 1
    """
    def _is_line(arg):
        """Check if arg is a Line object"""
        return isinstance(arg, Line)

    def _is_point(arg):
        """Check if arg is a Dot/object or np.array"""
        return hasattr(arg, 'get_center') or isinstance(arg, np.ndarray)

    def _is_number(arg):
        """Check if arg is a number"""
        return isinstance(arg, (int, float))

    def _extract_position(obj):
        """Extract position from Dot/object or np.array"""
        if hasattr(obj, 'get_center'):
            return obj.get_center()
        elif isinstance(obj, np.ndarray):
            return obj
        else:
            raise TypeError(f"Expected Dot or np.array, got {type(obj).__name__}")

    if len(args) == 1:
        # Single line case
        if not _is_line(args[0]):
            raise TypeError("For 1 argument, must be a Line object")

        line = args[0]
        center = line.get_center()
        diameter = line.get_length()
        radius = diameter / 2

        circle = Circle(radius=radius, **kwargs)
        circle.move_to(center)
        return circle

    elif len(args) == 2:
        # Could be: (center, radius) OR (dot1, dot2)
        if _is_point(args[0]) and _is_number(args[1]):
            # Pattern: (center, radius)
            center = _extract_position(args[0])
            radius = args[1]

            circle = Circle(radius=radius, **kwargs)
            circle.move_to(center)
            return circle

        elif _is_point(args[0]) and _is_point(args[1]):
            # Pattern: (dot1, dot2)
            pos1 = _extract_position(args[0])
            pos2 = _extract_position(args[1])

            # Midpoint is center
            center = (pos1 + pos2) / 2

            # Distance is diameter
            diameter = np.linalg.norm(pos2 - pos1)
            radius = diameter / 2

            circle = Circle(radius=radius, **kwargs)
            circle.move_to(center)
            return circle

        else:
            raise TypeError("For 2 arguments, expected (center, radius) or (dot1, dot2)")

    else:
        raise ValueError(f"cr() takes 1 or 2 arguments, got {len(args)}")


class Exp:
    """
    Expression utility class for extracting coordinates and properties from various types.

    This class provides the same functionality as the standalone x, y, st, ed, mid, mag, uv, vec, ang, slope, val, pt, m2v, v2m, x2v, vl, hl, lra, vra, r2p, ln, vt, tri, aa, rect, cr, sss, sas, ssa, and graph functions,
    but in a class-based interface for those who prefer it.
    """
    x = staticmethod(x)
    y = staticmethod(y)
    st = staticmethod(st)
    ed = staticmethod(ed)
    mid = staticmethod(mid)
    mag = staticmethod(mag)
    uv = staticmethod(uv)
    vec = staticmethod(vec)
    ang = staticmethod(ang)
    slope = staticmethod(slope)
    val = staticmethod(val)
    pt = staticmethod(pt)
    m2v = staticmethod(m2v)
    v2m = staticmethod(v2m)
    x2v = staticmethod(x2v)
    vl = staticmethod(vl)
    hl = staticmethod(hl)
    lra = staticmethod(lra)
    vra = staticmethod(vra)
    r2p = staticmethod(r2p)
    a2p = staticmethod(a2p)
    ln = staticmethod(ln)
    vt = staticmethod(vt)
    tri = staticmethod(tri)
    aa = staticmethod(aa)
    aa2 = staticmethod(aa2)
    rect = staticmethod(rect)
    cr = staticmethod(cr)
    sss = staticmethod(sss)
    sas = staticmethod(sas)
    ssa = staticmethod(ssa)
    graph = staticmethod(GraphUtils.graph)

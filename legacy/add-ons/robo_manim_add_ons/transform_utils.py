"""
Transform utilities for Manim objects.

Provides helper functions for creating transformed copies of Manim objects
using translations, rotations, and scaling operations.
"""

import numpy as np
from manim import Mobject, Dot
from typing import Union


def translated(obj: Mobject, dx: float, dy: float) -> Mobject:
    """
    Create a copy of an object translated by dx and dy.

    Args:
        obj: The Mobject to copy and translate
        dx: The horizontal displacement
        dy: The vertical displacement

    Returns:
        A new Mobject that is a translated copy of the input

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import translated
        >>>
        >>> square = Square()
        >>> shifted_square = translated(square, 2, 1)
        >>> # Creates a copy of square shifted right 2 units and up 1 unit
    """
    new_obj = obj.copy()
    new_obj.shift(dx * np.array([1, 0, 0]) + dy * np.array([0, 1, 0]))
    return new_obj


def rotated(obj: Mobject, angle_in_degrees: float, about: Union[Dot, np.ndarray, None] = None) -> Mobject:
    """
    Create a copy of an object rotated by a given angle.

    Args:
        obj: The Mobject to copy and rotate
        angle_in_degrees: The rotation angle in degrees
        about: The point to rotate around (Dot, numpy array, or None for object's center)

    Returns:
        A new Mobject that is a rotated copy of the input

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import rotated
        >>>
        >>> line = Line(ORIGIN, RIGHT)
        >>> rotated_line = rotated(line, 90)  # Rotate 90 degrees around center
        >>> rotated_around_point = rotated(line, 45, Dot(UP))  # Rotate around a point
    """
    new_obj = obj.copy()

    # Convert degrees to radians
    angle_in_radians = angle_in_degrees * np.pi / 180

    # Determine rotation point
    if about is None:
        about_point = new_obj.get_center()
    elif isinstance(about, Dot):
        about_point = about.get_center()
    else:
        about_point = np.array(about)

    new_obj.rotate(angle_in_radians, about_point=about_point)
    return new_obj


def scaled(obj: Mobject, scale_factor: float, about: Union[Dot, np.ndarray, None] = None) -> Mobject:
    """
    Create a copy of an object scaled by a given factor.

    Args:
        obj: The Mobject to copy and scale
        scale_factor: The scaling factor (e.g., 2 doubles the size, 0.5 halves it)
        about: The point to scale around (Dot, numpy array, or None for object's center)

    Returns:
        A new Mobject that is a scaled copy of the input

    Example:
        >>> from manim import *
        >>> from robo_manim_add_ons import scaled
        >>>
        >>> circle = Circle()
        >>> big_circle = scaled(circle, 2)  # Double the size
        >>> small_circle = scaled(circle, 0.5, Dot(UP))  # Scale to half size around a point
    """
    new_obj = obj.copy()

    # Determine scaling point
    if about is None:
        about_point = new_obj.get_center()
    elif isinstance(about, Dot):
        about_point = about.get_center()
    else:
        about_point = np.array(about)

    new_obj.scale(scale_factor, about_point=about_point)
    return new_obj

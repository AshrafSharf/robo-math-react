"""
Point utilities for Manim objects.

Provides helper class for point operations and transformations.
"""

import numpy as np
from manim import Dot, Mobject


class PointUtils:
    """Utility class for point operations on Manim Dot objects."""

    @staticmethod
    def addp(point, vector, **dot_kwargs) -> Dot:
        """
        Create a new Dot by adding a vector displacement to a point.

        This method takes a point (Dot or np.array) and translates it by a vector,
        returning a new Dot at the displaced position.

        Args:
            point: Point position - can be Dot or np.ndarray
            vector: Vector displacement - can be Arrow/Line (uses direction) or np.ndarray
            **dot_kwargs: Optional styling parameters (color, radius, etc.)

        Returns:
            A new Dot at the displaced position

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.point_utils import PointUtils
            >>>
            >>> # Dot + Arrow
            >>> point = Dot(ORIGIN, color=BLUE)
            >>> vec = Arrow(ORIGIN, RIGHT * 2, buff=0)
            >>> new_point = PointUtils.addp(point, vec, color=RED)
            >>> # Creates red dot at position [2, 0, 0]
            >>>
            >>> # Dot + np.array
            >>> new_point2 = PointUtils.addp(point, UP + RIGHT, color=GREEN)
            >>> # Creates green dot at position [1, 1, 0]
            >>>
            >>> # np.array + np.array
            >>> new_point3 = PointUtils.addp(RIGHT, UP)
            >>> # Creates dot at position [1, 1, 0]
            >>>
            >>> # np.array + Arrow
            >>> new_point4 = PointUtils.addp(UP, vec)
            >>> # Creates dot at position [2, 1, 0]
        """
        # Get current point position
        if isinstance(point, np.ndarray):
            current_pos = point
            default_kwargs = {}
        elif isinstance(point, Dot):
            current_pos = point.get_center()
            # Get default styling from source point
            default_kwargs = {
                'color': point.get_color() if 'color' not in dot_kwargs else dot_kwargs['color'],
                'radius': point.radius if 'radius' not in dot_kwargs else dot_kwargs['radius'],
            }
        else:
            raise TypeError(f"Point must be Dot or np.ndarray, got {type(point)}")

        # Extract displacement vector
        if isinstance(vector, np.ndarray):
            displacement = vector
        elif hasattr(vector, 'get_start') and hasattr(vector, 'get_end'):
            # Arrow or Line - use direction
            displacement = vector.get_end() - vector.get_start()
        else:
            raise TypeError(f"Vector must be Arrow/Line or np.ndarray, got {type(vector)}")

        # Calculate new position
        new_pos = current_pos + displacement

        # Merge with provided kwargs
        default_kwargs.update(dot_kwargs)

        # Create and return new Dot
        return Dot(new_pos, **default_kwargs)


# ============================================================================
# Standalone function alias for convenient static import
# ============================================================================

def addp(point, vector, **dot_kwargs) -> Dot:
    """
    Standalone function for point displacement. See PointUtils.addp() for full documentation.

    Example:
        >>> from robo_manim_add_ons import addp
        >>> new_point = addp(point, vec, color=RED)
        >>> new_point2 = addp(ORIGIN, RIGHT, color=BLUE)
    """
    return PointUtils.addp(point, vector, **dot_kwargs)

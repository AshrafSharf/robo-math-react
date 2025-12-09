"""
Custom arrow tips for textbook-style vectors.
"""

import numpy as np
from manim import ArrowTip, VMobject


class SimpleArrowTip(ArrowTip):
    """
    Simple two-line arrow tip (>) - just two lines forming an angle.

    This creates a clean textbook-style arrow without a filled triangle
    or back/base line. Perfect for mathematical vectors.
    """

    def __init__(
        self,
        angle: float = 60 * np.pi / 180,  # 60 degrees between lines
        length: float = 0.35,
        stroke_width: float = 3,
        **kwargs
    ):
        self.angle = angle
        self._arrow_length = length
        VMobject.__init__(self, stroke_width=stroke_width, **kwargs)

    def generate_points(self):
        """Generate the two line segments forming the '>' shape."""
        half_angle = self.angle / 2

        # Tip is at origin (0, 0, 0)
        tip = np.array([0, 0, 0])

        # Upper line: from tip back at angle
        upper_back = np.array([
            -self._arrow_length * np.cos(half_angle),
            self._arrow_length * np.sin(half_angle),
            0
        ])

        # Lower line: from tip back at angle
        lower_back = np.array([
            -self._arrow_length * np.cos(half_angle),
            -self._arrow_length * np.sin(half_angle),
            0
        ])

        # Draw two separate line segments (no connection at back)
        # Upper line: tip -> upper_back
        self.set_points_as_corners([tip, upper_back])
        # Start new disconnected path for lower line
        self.start_new_path(tip)
        self.add_line_to(lower_back)

    @property
    def base(self) -> np.ndarray:
        """The base point where the arrow shaft connects (midpoint of back edge)."""
        half_angle = self.angle / 2
        # Midpoint between upper_back and lower_back
        return np.array([
            -self._arrow_length * np.cos(half_angle),
            0,
            0
        ])

    @property
    def tip_point(self) -> np.ndarray:
        """The tip point of the arrow."""
        return np.array([0, 0, 0])

    @property
    def vector(self) -> np.ndarray:
        """Vector from base to tip."""
        return self.tip_point - self.base

    @property
    def tip_angle(self) -> float:
        """Angle of the tip."""
        return np.arctan2(self.vector[1], self.vector[0])

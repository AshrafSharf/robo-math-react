"""
Custom objects for specialized Manim visualizations.

This module provides custom VMobject classes for creating specialized annotations
and visual elements, particularly for arc-based measurements and angle annotations.
"""

import numpy as np
from manim import VMobject, Arc, DashedVMobject, TangentLine, PI, DEGREES, WHITE


class ArcDashedVMobject(DashedVMobject):
    """
    Creates a dashed version of a VMobject, particularly useful for arcs.

    This class extends DashedVMobject to provide easy creation of dashed arcs
    and other curved objects with customizable dash patterns.
    """

    def __init__(self,
                 vmobject,
                 num_dashes=30,
                 dashed_ratio=0.6,
                 dash_offset=0.4,
                 color=WHITE,
                 equal_lengths=True,
                 **kwargs):
        """
        Initialize a dashed VMobject.

        Args:
            vmobject: The VMobject to make dashed (typically an Arc or curved object)
            num_dashes: Number of dashes to create (default 30)
            dashed_ratio: Ratio of dash length to total dash+gap length (default 0.6)
            dash_offset: Offset for dash positioning along the path (default 0.4)
            color: Color of the dashed object (default WHITE)
            equal_lengths: Whether dashes should be equal length (default True)
            **kwargs: Additional arguments passed to DashedVMobject

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.custom_objects import ArcDashedVMobject
            >>>
            >>> arc = Arc(radius=2, start_angle=0, angle=PI/2)
            >>> dashed_arc = ArcDashedVMobject(arc, num_dashes=20, color=BLUE)
        """
        super().__init__(vmobject,
                         num_dashes,
                         dashed_ratio,
                         dash_offset,
                         color,
                         equal_lengths,
                         **kwargs)


class ArcArrow(VMobject):
    """
    Creates an arc with arrow tips at both ends, optionally dashed.

    This class is useful for creating arc-based measurement annotations,
    angle markers, or curved distance indicators. The arc is offset from
    the original arc by a buffer distance and can be either solid or dashed.
    """

    def __init__(self,
                 arc: Arc,
                 reverse=False,
                 buff=0.2,
                 line_class=ArcDashedVMobject,
                 tip_angle=20*DEGREES,
                 **kwargs):
        """
        Initialize an arc arrow with optional dashing and bidirectional tips.

        Args:
            arc: The Arc object to create a measurement annotation for
            reverse: If True, reverses the arc direction (default False)
            buff: Buffer distance from the original arc (positive = outward) (default 0.2)
            line_class: Class to use for the arc line, None for solid arc (default ArcDashedVMobject for dashed)
            tip_angle: Angle of the arrow tips in radians (default 20 degrees)
            **kwargs: Additional styling arguments (color, stroke_width, etc.)

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons import ArcArrow
            >>>
            >>> # Create a dashed arc arrow (default)
            >>> arc = Arc(radius=2.5, start_angle=-60*DEGREES, angle=PI*0.9)
            >>> measure_dashed = ArcArrow(arc, buff=0.3, color=RED)
            >>>
            >>> # Create a solid arc arrow
            >>> measure_solid = ArcArrow(arc, buff=0.3, line_class=None, color=BLUE)
            >>> self.add(arc, measure_dashed, measure_solid)
        """
        super().__init__(**kwargs)

        # Create a parallel arc with buffer offset
        arc_radius = arc.radius + buff
        arc_center = arc.arc_center
        start_angle = arc.start_angle
        angle = arc.angle

        self.arc = Arc(arc_radius, start_angle, angle, arc_center=arc_center, **kwargs)

        # Apply line class (dashed or solid)
        if line_class is not None:
            self.main_arc = line_class(self.arc)
        else:
            self.main_arc = self.arc

        self.tip_angle = tip_angle

        self.add(self.main_arc)
        self.add_right_tip()
        self.add_left_tip()
        self.set_color(self.main_arc.get_color())

    def add_right_tip(self, start_angle=0, line_size=0.3, invert=False):
        """
        Add an arrow tip at the right (end) of the arc.

        This creates a two-line arrow tip tangent to the arc at the specified position.

        Args:
            start_angle: Additional angle offset for the tip orientation (default 0)
            line_size: Length of the tip lines (default 0.3)
            invert: If False, adds tip at end; if True, adds tip at start (default False)
        """
        arc = self.arc
        sign = -1 if invert else 1
        index = -1 if invert else 0

        # Create tangent line at the arc endpoint
        tl = TangentLine(arc, abs(index), length=line_size)
        tl.shift(sign * tl.get_vector() / 2)
        start = arc.point_from_proportion(abs(index))

        # Create tip components
        down_tip = tl
        up_tip = tl.copy()
        normal_line = tl.copy()

        # Rotate to create arrow shape
        down_tip.rotate(self.tip_angle + start_angle, about_point=start)
        up_tip.rotate(-self.tip_angle + start_angle, about_point=start)
        normal_line.rotate(PI / 2).move_to(start)

        self.add(down_tip, up_tip, normal_line)

    def add_left_tip(self, start_angle=0, line_size=0.3, invert=True):
        """
        Add an arrow tip at the left (start) of the arc.

        This is a convenience method that calls add_right_tip with invert=True.

        Args:
            start_angle: Additional angle offset for the tip orientation (default 0)
            line_size: Length of the tip lines (default 0.3)
            invert: If True, adds tip at start; if False, adds tip at end (default True)
        """
        self.add_right_tip(start_angle, line_size, invert)

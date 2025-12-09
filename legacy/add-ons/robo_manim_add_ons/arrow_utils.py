"""
Arrow utilities for advanced arrow creation in Manim.

Provides ArrowUtil class for creating arrows with:
- Dashed lines
- Perpendicular buffer (offset)
- Bidirectional tips
- Curved arrows along arcs
- Label positioning
"""

import numpy as np
from manim import VMobject, VGroup, Line, DashedLine, Circle, Arc, PI, DEGREES
from manim.utils.space_ops import rotate_vector
from .arrow_tips import SimpleArrowTip


class ArrowUtil:
    """Utility class for creating advanced arrows with various styles and features."""

    @staticmethod
    def arrow(
        start: np.ndarray,
        end: np.ndarray,
        buff: float = 0,
        dashed: bool = False,
        bidirectional: bool = False,
        tip_angle: float = 20 * DEGREES,
        tip_length: float = 0.3,
        **kwargs
    ) -> VMobject:
        """
        Create an arrow with advanced features: dashing, perpendicular buffer, bidirectional tips.

        This method creates a customizable arrow with simple two-line tips (textbook style).
        The arrow can be dashed, offset perpendicular to its direction, and have tips on both ends.

        Args:
            start: Starting point of the arrow
            end: Ending point of the arrow
            buff: Perpendicular offset distance (positive shifts counterclockwise, negative clockwise)
            dashed: If True, creates a dashed line
            bidirectional: If True, adds arrow tips on both ends
            tip_angle: Angle of the arrow tip lines (in radians)
            tip_length: Length of the arrow tip lines
            **kwargs: Additional styling parameters (color, stroke_width, dash_length, etc.)

        Returns:
            VMobject: Arrow with the specified features

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.arrow_utils import ArrowUtil
            >>>
            >>> # Simple dashed arrow
            >>> arrow1 = ArrowUtil.arrow(ORIGIN, RIGHT * 2, dashed=True, color=BLUE)
            >>>
            >>> # Arrow with perpendicular offset
            >>> arrow2 = ArrowUtil.arrow(ORIGIN, RIGHT * 2, buff=0.3, color=RED)
            >>>
            >>> # Bidirectional arrow
            >>> arrow3 = ArrowUtil.arrow(ORIGIN, RIGHT * 2, bidirectional=True, color=GREEN)
        """
        # Create the main line (dashed or solid)
        line_class = DashedLine if dashed else Line
        main_line = line_class(start, end, **kwargs)

        # Calculate unit vector and perpendicular shift
        direction = end - start
        unit_vector = direction / np.linalg.norm(direction)
        perpendicular_vector = rotate_vector(unit_vector, PI / 2)
        shift_vector = perpendicular_vector * buff

        # Create the arrow group
        arrow_group = VGroup(main_line)

        # Add right tip (at end point)
        arrow_group.add(*ArrowUtil._add_tip(main_line, tip_angle, tip_length, invert=False))

        # Add left tip if bidirectional (at start point)
        if bidirectional:
            arrow_group.add(*ArrowUtil._add_tip(main_line, tip_angle, tip_length, invert=True))

        # Apply perpendicular shift
        arrow_group.shift(shift_vector)

        # Ensure color is applied to all components
        if 'color' in kwargs:
            arrow_group.set_color(kwargs['color'])

        return arrow_group

    @staticmethod
    def _add_tip(
        line: Line,
        tip_angle: float,
        tip_length: float,
        invert: bool = False
    ) -> list:
        """
        Create arrow tip lines at the specified end of a line.

        Args:
            line: The main line to add tip to
            tip_angle: Angle of the tip lines from the main line
            tip_length: Length of the tip lines
            invert: If False, tip at end point; if True, tip at start point

        Returns:
            list: Two Line objects forming the tip
        """
        sign = 1 if invert else -1
        index = -1 if not invert else 0

        # Get the tip point
        tip_point = line.get_all_points()[index]

        # Calculate tip vector
        unit_vector = line.get_unit_vector()
        tip_vector = unit_vector * tip_length * sign

        # Create base line for tip
        base_tip = Line(tip_point, tip_point + tip_vector)

        # Create the two tip lines by rotating
        down_tip = base_tip.copy()
        up_tip = base_tip.copy()

        down_tip.rotate(tip_angle, about_point=tip_point)
        up_tip.rotate(-tip_angle, about_point=tip_point)

        return [down_tip, up_tip]

    @staticmethod
    def curved_arrow(
        start: np.ndarray,
        end: np.ndarray,
        angle: float = 45 * DEGREES,
        tip_angle: float = 20 * DEGREES,
        tip_length: float = 0.3,
        **kwargs
    ) -> VMobject:
        """
        Create a curved arrow along a circular arc.

        The arrow follows a circular arc from start to end point. The curvature
        is controlled by the angle parameter - larger angles create more pronounced curves.

        Args:
            start: Starting point of the arrow
            end: Ending point of the arrow
            angle: Arc angle controlling curvature (in radians)
            tip_angle: Angle of the arrow tip lines (in radians)
            tip_length: Length of the arrow tip lines
            **kwargs: Additional styling parameters (color, stroke_width, etc.)

        Returns:
            VMobject: Curved arrow along circular arc

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.arrow_utils import ArrowUtil
            >>>
            >>> # Curved arrow with 45 degree arc
            >>> arrow1 = ArrowUtil.curved_arrow(LEFT * 2, RIGHT * 2, angle=45*DEGREES, color=BLUE)
            >>>
            >>> # More pronounced curve
            >>> arrow2 = ArrowUtil.curved_arrow(LEFT * 2, RIGHT * 2, angle=90*DEGREES, color=RED)
        """
        # Calculate midpoint
        midpoint = (start + end) / 2

        # Calculate distance between points
        distance = np.linalg.norm(end - start)

        # Calculate radius based on angle and distance
        # For an arc subtending angle θ, radius r = (chord_length / 2) / sin(θ/2)
        radius = (distance / 2) / np.sin(angle / 2)

        # Calculate the perpendicular direction to find arc center
        direction = end - start
        unit_direction = direction / distance
        perpendicular = rotate_vector(unit_direction, PI / 2)

        # Calculate arc center
        # Distance from midpoint to center: r * cos(angle/2)
        center_distance = radius * np.cos(angle / 2)
        arc_center = midpoint + perpendicular * center_distance

        # Calculate start and end angles for the arc
        start_angle = np.arctan2(
            (start - arc_center)[1],
            (start - arc_center)[0]
        )
        end_angle = np.arctan2(
            (end - arc_center)[1],
            (end - arc_center)[0]
        )

        # Create the arc
        arc = Arc(
            radius=radius,
            start_angle=start_angle,
            angle=angle,
            arc_center=arc_center,
            **kwargs
        )

        # Create arrow group
        arrow_group = VGroup(arc)

        # Add tip at the end
        # Calculate tangent direction at end point
        tangent_direction = rotate_vector(
            (end - arc_center) / np.linalg.norm(end - arc_center),
            PI / 2
        )

        # Create tip lines
        tip_vector = tangent_direction * tip_length
        down_tip = Line(end, end - tip_vector)
        up_tip = down_tip.copy()

        down_tip.rotate(tip_angle, about_point=end)
        up_tip.rotate(-tip_angle, about_point=end)

        arrow_group.add(down_tip, up_tip)

        # Ensure color is applied to all components
        if 'color' in kwargs:
            arrow_group.set_color(kwargs['color'])

        return arrow_group

    @staticmethod
    def perpendicular_offset(start: np.ndarray, end: np.ndarray, distance: float) -> np.ndarray:
        """
        Calculate perpendicular offset vector for a line segment.

        This returns the vector needed to shift a line perpendicular to its direction.
        Positive distance shifts counterclockwise, negative shifts clockwise.

        Args:
            start: Starting point of the line
            end: Ending point of the line
            distance: Distance to offset (positive = counterclockwise, negative = clockwise)

        Returns:
            numpy.ndarray: Offset vector to apply with .shift()

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.arrow_utils import ArrowUtil
            >>>
            >>> line = Line(ORIGIN, RIGHT * 2)
            >>> offset = ArrowUtil.perpendicular_offset(ORIGIN, RIGHT * 2, 0.5)
            >>> line.shift(offset)  # Line is now shifted 0.5 units upward
        """
        direction = end - start
        unit_vector = direction / np.linalg.norm(direction)
        perpendicular_vector = rotate_vector(unit_vector, PI / 2)
        return perpendicular_vector * distance

    @staticmethod
    def label(arrow: VMobject, tex: VMobject, buff: float = 0.2) -> VMobject:
        """
        Position a label (text/math) relative to an arrow with perpendicular offset.

        The label is placed at the center of the arrow and offset perpendicular to
        the arrow's direction. This is useful for labeling measurement arrows.

        Args:
            arrow: The arrow to label (must have get_center() method)
            tex: The label mobject (MathTex, Text, etc.)
            buff: Perpendicular offset distance from arrow center

        Returns:
            VMobject: The positioned label

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.arrow_utils import ArrowUtil
            >>>
            >>> arrow = ArrowUtil.arrow(LEFT, RIGHT, buff=0.2, color=RED)
            >>> label = ArrowUtil.label(arrow, MathTex("L"), buff=0.3)
            >>> # Label is positioned at arrow center, offset perpendicularly
        """
        # For VGroup arrows, get the first element (main line) for direction calculation
        if isinstance(arrow, VGroup) and len(arrow) > 0:
            main_line = arrow[0]
        else:
            main_line = arrow

        # Get start and end points
        if hasattr(main_line, 'get_start') and hasattr(main_line, 'get_end'):
            start = main_line.get_start()
            end = main_line.get_end()

            # Calculate perpendicular offset
            direction = end - start
            unit_vector = direction / np.linalg.norm(direction)
            perpendicular_vector = rotate_vector(unit_vector, PI / 2)
            shift_vector = perpendicular_vector * buff

            # Position label at arrow center with offset
            tex.move_to(arrow.get_center())
            tex.shift(shift_vector)
        else:
            # Fallback: just center on arrow
            tex.move_to(arrow.get_center())

        return tex

    @staticmethod
    def marker(
        point: np.ndarray,
        direction: np.ndarray,
        tip_angle: float = 20 * DEGREES,
        tip_length: float = 0.3,
        **kwargs
    ) -> VGroup:
        """
        Create a directional marker (arrow tip) at a specific point.

        This is useful for adding markers along paths or at intersection points
        to indicate direction or flow.

        Args:
            point: The point where the marker should be placed
            direction: Direction vector for the marker (will be normalized)
            tip_angle: Angle of the marker lines (in radians)
            tip_length: Length of the marker lines
            **kwargs: Additional styling parameters (color, stroke_width, etc.)

        Returns:
            VGroup: Marker consisting of two lines forming arrow tip

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.arrow_utils import ArrowUtil
            >>>
            >>> # Add marker at origin pointing right
            >>> marker1 = ArrowUtil.marker(ORIGIN, RIGHT, color=BLUE)
            >>>
            >>> # Add marker on a curve
            >>> circle = Circle()
            >>> point = circle.point_from_proportion(0.25)
            >>> tangent = circle.point_from_proportion(0.26) - point
            >>> marker2 = ArrowUtil.marker(point, tangent, color=RED)
        """
        # Normalize direction
        unit_direction = direction / np.linalg.norm(direction)

        # Create tip vector
        tip_vector = unit_direction * tip_length

        # Create base line
        base_line = Line(point, point + tip_vector)

        # Create the two tip lines by rotating
        down_tip = base_line.copy()
        up_tip = base_line.copy()

        down_tip.rotate(tip_angle, about_point=point)
        up_tip.rotate(-tip_angle, about_point=point)

        # Create group
        marker_group = VGroup(down_tip, up_tip)

        # Apply styling
        if 'color' in kwargs:
            marker_group.set_color(kwargs['color'])
        if 'stroke_width' in kwargs:
            marker_group.set_stroke(width=kwargs['stroke_width'])

        return marker_group

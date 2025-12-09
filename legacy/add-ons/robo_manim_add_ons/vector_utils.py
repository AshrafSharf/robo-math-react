"""
Vector utilities for Manim objects.

Provides helper class for vector operations like forward projection.
"""

import numpy as np
from manim import Mobject, Arrow, Line, Polygon
from manim.utils.space_ops import normalize


class VectorUtils:
    """Utility class for vector operations on Manim objects."""

    @staticmethod
    def create_vector(start: np.ndarray, end: np.ndarray, **kwargs) -> Arrow:
        """
        Create a vector arrow with open arrow tip (textbook style).

        Args:
            start: Starting point of the vector
            end: Ending point of the vector
            **kwargs: Additional styling parameters (color, stroke_width, etc.)

        Returns:
            Arrow with open tip style

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vec = VectorUtils.create_vector(ORIGIN, RIGHT * 2, color=BLUE)
        """
        default_kwargs = {
            'buff': 0,
            'fill_opacity': 0,
            'max_tip_length_to_length_ratio': 0.15,
            'tip_length': 0.2
        }
        default_kwargs.update(kwargs)
        return Arrow(start, end, **default_kwargs)

    @staticmethod
    def forward(source: Mobject, distance: float) -> Mobject:
        """
        Create a copy of a vector shifted forward along its direction.

        This method takes a vector (Line, Arrow, or any Mobject with start/end points)
        and creates a copy shifted forward by the specified distance along the
        vector's direction.

        Args:
            source: The source Mobject (typically a Line or Arrow) to copy and shift
            distance: The distance to shift the copy forward along the vector's direction

        Returns:
            A new Mobject that is a copy of the source, shifted forward by the distance

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> source_vector = Arrow(ORIGIN, RIGHT * 2, color=BLUE)
            >>> shifted_vector = VectorUtils.forward(source_vector, 1.5)
            >>> # Creates a copy of the arrow shifted 1.5 units to the right
        """
        # Calculate shift direction
        direction = source.get_end() - source.get_start()
        direction_unit = direction / np.linalg.norm(direction)
        shift_vector = direction_unit * distance
        shifted_vector = source.copy()
        shifted_vector.shift(shift_vector)

        return shifted_vector

    @staticmethod
    def backward(source: Mobject, distance: float) -> Mobject:
        """
        Create a copy of a vector shifted backward (opposite to its direction).

        This method takes a vector (Line, Arrow, or any Mobject with start/end points)
        and creates a copy shifted backward by the specified distance, opposite to the
        vector's direction.

        Args:
            source: The source Mobject (typically a Line or Arrow) to copy and shift
            distance: The distance to shift the copy backward (opposite to vector direction)

        Returns:
            A new Mobject that is a copy of the source, shifted backward by the distance

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> source_vector = Arrow(ORIGIN, RIGHT * 2, color=BLUE)
            >>> shifted_vector = VectorUtils.backward(source_vector, 1.5)
            >>> # Creates a copy of the arrow shifted 1.5 units to the left
        """
        # Calculate shift direction
        direction = source.get_end() - source.get_start()
        direction_unit = direction / np.linalg.norm(direction)
        shift_vector = direction_unit * -distance
        shifted_vector = source.copy()
        shifted_vector.shift(shift_vector)

        return shifted_vector

    @staticmethod
    def perp_move(source: Mobject, distance: float) -> Mobject:
        """
        Create a copy of a vector shifted perpendicular to its direction.

        This method takes a vector (Line, Arrow, or any Mobject with start/end points)
        and creates a copy shifted perpendicular by the specified distance. The
        perpendicular direction is 90° counterclockwise from the vector's direction.

        Args:
            source: The source Mobject (typically a Line or Arrow) to copy and shift
            distance: The distance to shift the copy perpendicular to vector direction
                     (positive = counterclockwise, negative = clockwise)

        Returns:
            A new Mobject that is a copy of the source, shifted perpendicular by the distance

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> source_vector = Arrow(ORIGIN, RIGHT * 2, color=BLUE)
            >>> shifted_vector = VectorUtils.perp_move(source_vector, 1.5)
            >>> # Creates a copy of the arrow shifted 1.5 units upward (perpendicular)
        """
        # Calculate shift direction
        direction = source.get_end() - source.get_start()
        direction_unit = direction / np.linalg.norm(direction)
        # Perpendicular: rotate direction by 90° counterclockwise: (x,y) -> (-y,x)
        perp_direction = np.array([-direction_unit[1], direction_unit[0], 0])
        shift_vector = perp_direction * distance
        shifted_vector = source.copy()
        shifted_vector.shift(shift_vector)

        return shifted_vector

    @staticmethod
    def tail_at_tip(vector_a: Mobject, vector_b: Mobject) -> Mobject:
        """
        Create a copy of vector B positioned so its tail starts at vector A's tip.

        This method is useful for vector addition visualization (tip-to-tail method),
        where you want to place one vector starting at the end of another vector.

        Args:
            vector_a: The first vector (Mobject with start/end points)
            vector_b: The second vector to position at vector_a's tip

        Returns:
            A new Mobject that is a copy of vector_b, positioned with its tail at vector_a's tip

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vector_a = Arrow(ORIGIN, RIGHT * 2, color=BLUE)
            >>> vector_b = Arrow(ORIGIN, UP * 1.5, color=RED)
            >>> vector_b_shifted = VectorUtils.tail_at_tip(vector_a, vector_b)
            >>> # Creates a copy of vector_b starting at the tip of vector_a
        """
        # Calculate direction of vector B
        vec_b_direction = vector_b.get_end() - vector_b.get_start()

        # Create a copy of vector_b positioned at tip of vector_a
        shifted_vector = vector_b.copy()

        # Calculate the shift needed: from vector_b's current start to vector_a's tip
        shift_amount = vector_a.get_end() - vector_b.get_start()
        shifted_vector.shift(shift_amount)

        return shifted_vector

    @staticmethod
    def shift_amount(vector_target: Mobject, vector_source: Mobject) -> np.ndarray:
        """
        Calculate the shift vector needed to move vector_source's tail to vector_target's tip.

        This method returns a numpy array representing the displacement needed to position
        vector_source so that its start point aligns with vector_target's end point.
        Useful for animating vectors with .animate.shift().

        Args:
            vector_target: The target vector whose tip will be the destination
            vector_source: The source vector to be shifted

        Returns:
            numpy.ndarray: The shift vector to apply to vector_source

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vector_a = Arrow(ORIGIN, RIGHT * 2, color=BLUE, buff=0)
            >>> vector_b = Arrow(LEFT, LEFT + UP, color=RED, buff=0)
            >>> shift_vector = VectorUtils.shift_amount(vector_a, vector_b)
            >>> # In animation: self.play(vector_b.animate.shift(shift_vector))
        """
        # Calculate shift needed: from source's start to target's end
        shift_vector = vector_target.get_end() - vector_source.get_start()
        return shift_vector

    @staticmethod
    def copy_at(source: Mobject, start_point: np.ndarray, **arrow_kwargs) -> Mobject:
        """
        Create a copy of a vector with the same direction and magnitude at a new starting point.

        This method is useful for creating parallelograms or positioning vectors with the same
        direction at different locations without manually extracting and recalculating directions.

        Args:
            source: The source Mobject (typically a Line or Arrow) to copy
            start_point: The new starting point (numpy array or Manim constant)
            **arrow_kwargs: Optional styling parameters (color, buff, tip_length, stroke_width, etc.)

        Returns:
            A new Mobject with the same direction and magnitude as source, starting at start_point

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> # Original vector
            >>> vector_a = Arrow(ORIGIN, RIGHT * 2, color=BLUE, buff=0)
            >>>
            >>> # Create parallelogram side: copy vector_a starting from different point
            >>> vector_a_copy = VectorUtils.copy_at(vector_a, UP * 2, color=RED)
            >>> # Creates a red arrow with same direction/length as vector_a, starting at UP * 2
            >>>
            >>> # Parallelogram construction example:
            >>> vector_b = Arrow(ORIGIN, UP * 1.5, color=GREEN, buff=0)
            >>> side_a = VectorUtils.copy_at(vector_a, vector_b.get_end())
            >>> side_b = VectorUtils.copy_at(vector_b, vector_a.get_end())
        """
        # Extract direction from source vector
        direction = source.get_end() - source.get_start()

        # Calculate end point
        end_point = start_point + direction

        # Get source properties as defaults
        default_kwargs = {
            'buff': 0,
            'fill_opacity': 0,  # Open arrow tips (textbook style)
            'max_tip_length_to_length_ratio': 0.15,
            'tip_length': 0.2,
            'color': source.get_color() if not 'color' in arrow_kwargs else arrow_kwargs['color'],
            'stroke_width': source.get_stroke_width() if not 'stroke_width' in arrow_kwargs else arrow_kwargs['stroke_width'],
        }

        # Merge with provided kwargs (provided kwargs override defaults)
        default_kwargs.update(arrow_kwargs)

        # Create and return new arrow
        return Arrow(start_point, end_point, **default_kwargs)

    @staticmethod
    def reverse_at(source: Mobject, start_point: np.ndarray, **arrow_kwargs) -> Mobject:
        """
        Create a reversed copy of a vector at a specific starting point.

        This method takes a vector and creates a new arrow with the opposite direction
        (negated direction vector) at the specified starting point. This is particularly
        useful for vector subtraction visualizations where you need -b positioned at
        the tip of vector a.

        Args:
            source: The source Mobject (typically a Line or Arrow) to reverse
            start_point: The new starting point (numpy array or Manim constant)
            **arrow_kwargs: Optional styling parameters (color, buff, tip_length, stroke_width, etc.)

        Returns:
            A new Mobject with the opposite direction of source, starting at start_point

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> # Original vector
            >>> vector_b = Arrow(ORIGIN, RIGHT * 2, color=BLUE, buff=0)
            >>>
            >>> # Create reversed vector at a different point (for vector subtraction)
            >>> vector_a = Arrow(ORIGIN, UP * 1.5, color=GREEN, buff=0)
            >>> neg_b = VectorUtils.reverse_at(vector_b, vector_a.get_end(), color=PURPLE)
            >>> # Creates a purple arrow with opposite direction to vector_b, starting at tip of vector_a
            >>>
            >>> # Usage in vector subtraction: a - b = a + (-b)
            >>> # Step 1: Show -b at origin
            >>> neg_b_at_origin = VectorUtils.reverse_at(vector_b, ORIGIN, color=PURPLE)
            >>> # Step 2: Move -b to tip of a
            >>> neg_b_at_tip = VectorUtils.reverse_at(vector_b, vector_a.get_end(), color=PURPLE)
        """
        # Extract direction from source vector and negate it
        direction = source.get_end() - source.get_start()
        reversed_direction = -direction

        # Calculate end point
        end_point = start_point + reversed_direction

        # Get source properties as defaults
        default_kwargs = {
            'buff': 0,
            'fill_opacity': 0,  # Open arrow tips (textbook style)
            'max_tip_length_to_length_ratio': 0.15,
            'tip_length': 0.2,
            'color': source.get_color() if not 'color' in arrow_kwargs else arrow_kwargs['color'],
            'stroke_width': source.get_stroke_width() if not 'stroke_width' in arrow_kwargs else arrow_kwargs['stroke_width'],
        }

        # Merge with provided kwargs (provided kwargs override defaults)
        default_kwargs.update(arrow_kwargs)

        # Create and return new arrow
        return Arrow(start_point, end_point, **default_kwargs)

    @staticmethod
    def project_onto(vector_to_project: Mobject, vector_target: Mobject, **arrow_kwargs) -> Mobject:
        """
        Create the projection arrow of one vector onto another.

        This method projects vector_to_project onto vector_target and returns an arrow
        representing the parallel component. Useful for visualizing dot products and
        vector decomposition (v = parallel + perpendicular components).

        Args:
            vector_to_project: The vector to be projected (typically an Arrow)
            vector_target: The vector to project onto (typically an Arrow)
            **arrow_kwargs: Optional styling parameters (color, buff, tip_length, stroke_width, etc.)

        Returns:
            An Arrow representing the projection (starts at vector_target's start)

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vector_a = Arrow(ORIGIN, RIGHT * 3, buff=0)
            >>> vector_b = Arrow(ORIGIN, RIGHT * 2 + UP * 1.5, buff=0)
            >>> projection = VectorUtils.project_onto(vector_b, vector_a)
            >>> # Creates arrow showing component of vector_b along vector_a
        """
        # Extract direction vectors
        target_direction = vector_target.get_end() - vector_target.get_start()
        to_project_direction = vector_to_project.get_end() - vector_to_project.get_start()

        # Calculate projection using dot product
        target_unit = normalize(target_direction)
        proj_length = np.dot(to_project_direction, target_unit)

        # Calculate projection endpoint
        proj_endpoint = vector_target.get_start() + proj_length * target_unit

        # Create projection arrow
        default_kwargs = {
            'buff': 0,
            'fill_opacity': 0,
            'max_tip_length_to_length_ratio': 0.15,
            'tip_length': 0.2
        }
        default_kwargs.update(arrow_kwargs)

        return Arrow(vector_target.get_start(), proj_endpoint, **default_kwargs)

    @staticmethod
    def decompose(source: Mobject, decompose_against: Mobject, perp: bool = False, **arrow_kwargs) -> Mobject:
        """
        Decompose a vector into parallel or perpendicular components relative to a reference vector.

        This method decomposes the source vector into components relative to the decompose_against
        vector. By default (perp=False), returns the parallel component (projection). When perp=True,
        returns the perpendicular component (rejection). Together, these provide a complete
        decomposition: source = parallel + perpendicular.

        Args:
            source: The vector to decompose (typically an Arrow)
            decompose_against: The reference vector to decompose relative to (typically an Arrow)
            perp: If False (default), return parallel component; if True, return perpendicular component
            **arrow_kwargs: Optional styling parameters (color, buff, tip_length, stroke_width, etc.)

        Returns:
            An Arrow representing the requested component:
            - Parallel: starts at source's start point, extends along decompose_against direction
            - Perpendicular: starts at end of parallel component, ends at source's tip

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> # Vector A to decompose
            >>> vector_a = Arrow(ORIGIN, RIGHT * 2 + UP * 1, buff=0)
            >>> # Vector B as reference
            >>> vector_b = Arrow(ORIGIN, RIGHT * 3, buff=0)
            >>>
            >>> # Get parallel component of A along B (default)
            >>> parallel = VectorUtils.decompose(vector_a, vector_b, color=GREEN)
            >>>
            >>> # Get perpendicular component
            >>> perp = VectorUtils.decompose(vector_a, vector_b, perp=True, color=ORANGE)
            >>> # Now: vector_a = parallel + perp (visually)
        """
        # Calculate vector directions
        vec_source_direction = source.get_end() - source.get_start()
        vec_against_direction = decompose_against.get_end() - decompose_against.get_start()

        # Calculate parallel component (projection of source onto decompose_against)
        against_unit = normalize(vec_against_direction)
        parallel_magnitude = np.dot(vec_source_direction, against_unit)
        parallel_component = parallel_magnitude * against_unit

        # Create arrow with styling
        default_kwargs = {
            'buff': 0,
            'fill_opacity': 0,
            'max_tip_length_to_length_ratio': 0.15,
            'tip_length': 0.2
        }
        default_kwargs.update(arrow_kwargs)

        if not perp:
            # Return parallel component
            parallel_endpoint = source.get_start() + parallel_component
            return Arrow(source.get_start(), parallel_endpoint, **default_kwargs)
        else:
            # Return perpendicular component
            perp_start_point = source.get_start() + parallel_component
            perp_endpoint = source.get_end()
            return Arrow(perp_start_point, perp_endpoint, **default_kwargs)

    @staticmethod
    def projection_line(vector_to_project: Mobject, vector_target: Mobject, **line_kwargs) -> Mobject:
        """
        Create the perpendicular line from projected vector tip to original vector tip.

        This line represents the perpendicular component (rejection) of the projection,
        showing the "distance" from the original vector to its projection. When vectors
        are perpendicular, this line has maximum length and projection is zero.

        Args:
            vector_to_project: The vector to be projected (typically an Arrow)
            vector_target: The vector to project onto (typically an Arrow)
            **line_kwargs: Optional styling parameters (color, dash_length, stroke_width, etc.)

        Returns:
            A Line from the projection endpoint to the tip of vector_to_project

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vector_a = Arrow(ORIGIN, RIGHT * 3, buff=0)
            >>> vector_b = Arrow(ORIGIN, RIGHT * 2 + UP * 1.5, buff=0)
            >>> proj_line = VectorUtils.projection_line(vector_b, vector_a)
            >>> # Creates line showing perpendicular component
        """
        # Extract direction vectors
        target_direction = vector_target.get_end() - vector_target.get_start()
        to_project_direction = vector_to_project.get_end() - vector_to_project.get_start()

        # Calculate projection endpoint
        target_unit = normalize(target_direction)
        proj_length = np.dot(to_project_direction, target_unit)
        proj_endpoint = vector_target.get_start() + proj_length * target_unit

        # Create line from projection endpoint to original vector tip
        return Line(proj_endpoint, vector_to_project.get_end(), **line_kwargs)

    @staticmethod
    def projection_region(vector_to_project: Mobject, vector_target: Mobject, **polygon_kwargs) -> Mobject:
        """
        Create a shaded triangular region showing the projection area.

        This creates a triangle with vertices at:
        1. Start of target vector (origin)
        2. Endpoint of projection
        3. Tip of vector being projected

        When vectors are perpendicular, the projection is zero and the triangle
        collapses to a line. The area visually represents the magnitude of projection.

        Args:
            vector_to_project: The vector to be projected (typically an Arrow)
            vector_target: The vector to project onto (typically an Arrow)
            **polygon_kwargs: Optional styling parameters (fill_opacity, color, stroke_width, etc.)

        Returns:
            A Polygon representing the projection region

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vector_a = Arrow(ORIGIN, RIGHT * 3, buff=0)
            >>> vector_b = Arrow(ORIGIN, RIGHT * 2 + UP * 1.5, buff=0)
            >>> region = VectorUtils.projection_region(vector_b, vector_a, fill_opacity=0.3)
            >>> # Creates shaded triangle showing projection relationship
        """
        # Extract direction vectors
        target_direction = vector_target.get_end() - vector_target.get_start()
        to_project_direction = vector_to_project.get_end() - vector_to_project.get_start()

        # Calculate projection endpoint
        target_unit = normalize(target_direction)
        proj_length = np.dot(to_project_direction, target_unit)
        proj_endpoint = vector_target.get_start() + proj_length * target_unit

        # Create triangle: origin -> projection endpoint -> vector tip -> origin
        return Polygon(
            vector_target.get_start(),
            proj_endpoint,
            vector_to_project.get_end(),
            **polygon_kwargs
        )

    @staticmethod
    def add(vector_a: Mobject, vector_b: Mobject, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
        """
        Create the result vector of vector addition a + b.

        This method computes the mathematical result of adding two vectors and returns
        an arrow representing the sum. The result starts at the specified start_point
        (defaulting to vector_a's start) and points to a + b.

        Args:
            vector_a: First vector
            vector_b: Second vector to add
            start_point: Starting point for result vector (defaults to vector_a's start)
            **arrow_kwargs: Optional styling parameters (color, buff, tip_length, stroke_width, etc.)

        Returns:
            Arrow representing a + b

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vector_a = Arrow(ORIGIN, RIGHT * 2, buff=0, color=BLUE)
            >>> vector_b = Arrow(ORIGIN, UP * 1.5, buff=0, color=RED)
            >>>
            >>> # Create result vector a + b
            >>> result = VectorUtils.add(vector_a, vector_b, color=GREEN)
            >>> # Creates green arrow from ORIGIN to (2, 1.5, 0)
        """
        vec_a_dir = vector_a.get_end() - vector_a.get_start()
        vec_b_dir = vector_b.get_end() - vector_b.get_start()

        if start_point is None:
            start_point = vector_a.get_start()

        result_end = start_point + vec_a_dir + vec_b_dir

        default_kwargs = {
            'buff': 0,
            'fill_opacity': 0,
            'max_tip_length_to_length_ratio': 0.15,
            'tip_length': 0.2
        }
        default_kwargs.update(arrow_kwargs)

        return Arrow(start_point, result_end, **default_kwargs)

    @staticmethod
    def subtract(vector_a: Mobject, vector_b: Mobject, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
        """
        Create the result vector of vector subtraction a - b.

        This method computes the mathematical result of subtracting vector_b from vector_a
        and returns an arrow representing the difference. The result starts at the specified
        start_point (defaulting to vector_a's start) and points to a - b.

        Useful for vector subtraction visualizations where you show a - b = a + (-b).

        Args:
            vector_a: Vector to subtract from
            vector_b: Vector to subtract
            start_point: Starting point for result vector (defaults to vector_a's start)
            **arrow_kwargs: Optional styling parameters (color, buff, tip_length, stroke_width, etc.)

        Returns:
            Arrow representing a - b

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vector_a = Arrow(ORIGIN, RIGHT * 3, buff=0, color=BLUE)
            >>> vector_b = Arrow(ORIGIN, UP * 2, buff=0, color=RED)
            >>>
            >>> # Create result vector a - b
            >>> result = VectorUtils.subtract(vector_a, vector_b, color=GREEN)
            >>> # Creates green arrow from ORIGIN to (3, -2, 0)
            >>>
            >>> # Use in subtraction visualization:
            >>> # Step 1: Show -b at origin
            >>> neg_b = VectorUtils.reverse_at(vector_b, ORIGIN, color=PURPLE)
            >>> # Step 2: Move -b to tip of a
            >>> shift = VectorUtils.shift_amount(vector_a, neg_b)
            >>> self.play(neg_b.animate.shift(shift))
            >>> # Step 3: Show result
            >>> result = VectorUtils.subtract(vector_a, vector_b, color=GREEN)
            >>> self.play(GrowArrow(result))
        """
        vec_a_dir = vector_a.get_end() - vector_a.get_start()
        vec_b_dir = vector_b.get_end() - vector_b.get_start()

        if start_point is None:
            start_point = vector_a.get_start()

        result_end = start_point + vec_a_dir - vec_b_dir

        default_kwargs = {
            'buff': 0,
            'fill_opacity': 0,
            'max_tip_length_to_length_ratio': 0.15,
            'tip_length': 0.2
        }
        default_kwargs.update(arrow_kwargs)

        return Arrow(start_point, result_end, **default_kwargs)

    @staticmethod
    def scalar_multiply(vector: Mobject, scalar: float, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
        """
        Create a vector scaled by a scalar multiplier.

        This method multiplies a vector by a scalar value, returning a new arrow with
        the scaled magnitude. The direction remains the same for positive scalars,
        and is reversed for negative scalars.

        Args:
            vector: The vector to scale
            scalar: The scalar multiplier (can be negative to reverse direction)
            start_point: Starting point for result vector (defaults to vector's start)
            **arrow_kwargs: Optional styling parameters (color, buff, tip_length, stroke_width, etc.)

        Returns:
            Arrow representing scalar * vector

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.vector_utils import VectorUtils
            >>>
            >>> vector_a = Arrow(ORIGIN, RIGHT * 2, buff=0, color=BLUE)
            >>>
            >>> # Create 2 * vector_a
            >>> scaled_up = VectorUtils.scalar_multiply(vector_a, 2, color=GREEN)
            >>> # Creates green arrow from ORIGIN to (4, 0, 0)
            >>>
            >>> # Create 0.5 * vector_a
            >>> scaled_down = VectorUtils.scalar_multiply(vector_a, 0.5, color=YELLOW)
            >>> # Creates yellow arrow from ORIGIN to (1, 0, 0)
            >>>
            >>> # Create -1 * vector_a (reversal)
            >>> reversed_vec = VectorUtils.scalar_multiply(vector_a, -1, color=RED)
            >>> # Creates red arrow from ORIGIN to (-2, 0, 0)
        """
        vec_dir = vector.get_end() - vector.get_start()
        scaled_dir = vec_dir * scalar

        if start_point is None:
            start_point = vector.get_start()

        end_point = start_point + scaled_dir

        default_kwargs = {
            'buff': 0,
            'fill_opacity': 0,
            'max_tip_length_to_length_ratio': 0.15,
            'tip_length': 0.2
        }
        default_kwargs.update(arrow_kwargs)

        return Arrow(start_point, end_point, **default_kwargs)

    # ============================================================================
    # 2-Letter Aliases for Common Methods
    # ============================================================================

    @staticmethod
    def fw(source: Mobject, distance: float) -> Mobject:
        """Alias for forward(). See forward() for full documentation."""
        return VectorUtils.forward(source, distance)

    @staticmethod
    def bw(source: Mobject, distance: float) -> Mobject:
        """Alias for backward(). See backward() for full documentation."""
        return VectorUtils.backward(source, distance)

    @staticmethod
    def pm(source: Mobject, distance: float) -> Mobject:
        """Alias for perp_move(). See perp_move() for full documentation."""
        return VectorUtils.perp_move(source, distance)

    @staticmethod
    def cp(source: Mobject, start_point: np.ndarray, **arrow_kwargs) -> Mobject:
        """Alias for copy_at(). See copy_at() for full documentation."""
        return VectorUtils.copy_at(source, start_point, **arrow_kwargs)

    @staticmethod
    def rv(source: Mobject, start_point: np.ndarray, **arrow_kwargs) -> Mobject:
        """Alias for reverse_at(). See reverse_at() for full documentation."""
        return VectorUtils.reverse_at(source, start_point, **arrow_kwargs)

    @staticmethod
    def tt(vector_a: Mobject, vector_b: Mobject) -> Mobject:
        """Alias for tail_at_tip(). See tail_at_tip() for full documentation."""
        return VectorUtils.tail_at_tip(vector_a, vector_b)

    @staticmethod
    def sa(vector_target: Mobject, vector_source: Mobject) -> np.ndarray:
        """Alias for shift_amount(). See shift_amount() for full documentation."""
        return VectorUtils.shift_amount(vector_target, vector_source)

    @staticmethod
    def prov(vector_to_project: Mobject, vector_target: Mobject, **arrow_kwargs) -> Mobject:
        """Alias for project_onto(). See project_onto() for full documentation."""
        return VectorUtils.project_onto(vector_to_project, vector_target, **arrow_kwargs)

    @staticmethod
    def dcv(source: Mobject, decompose_against: Mobject, perp: bool = False, **arrow_kwargs) -> Mobject:
        """Alias for decompose(). See decompose() for full documentation."""
        return VectorUtils.decompose(source, decompose_against, perp=perp, **arrow_kwargs)

    @staticmethod
    def addv(vector_a: Mobject, vector_b: Mobject, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
        """Alias for add(). See add() for full documentation."""
        return VectorUtils.add(vector_a, vector_b, start_point=start_point, **arrow_kwargs)

    @staticmethod
    def subv(vector_a: Mobject, vector_b: Mobject, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
        """Alias for subtract(). See subtract() for full documentation."""
        return VectorUtils.subtract(vector_a, vector_b, start_point=start_point, **arrow_kwargs)

    @staticmethod
    def scalev(vector: Mobject, scalar: float, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
        """Alias for scalar_multiply(). See scalar_multiply() for full documentation."""
        return VectorUtils.scalar_multiply(vector, scalar, start_point=start_point, **arrow_kwargs)


# ============================================================================
# Standalone function aliases for convenient static imports
# ============================================================================

def addv(vector_a: Mobject, vector_b: Mobject, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
    """
    Standalone function for vector addition. See VectorUtils.add() for full documentation.

    Example:
        >>> from robo_manim_add_ons import addv
        >>> result = addv(vec_a, vec_b, color=GREEN)
    """
    return VectorUtils.add(vector_a, vector_b, start_point=start_point, **arrow_kwargs)


def subv(vector_a: Mobject, vector_b: Mobject, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
    """
    Standalone function for vector subtraction. See VectorUtils.subtract() for full documentation.

    Example:
        >>> from robo_manim_add_ons import subv
        >>> result = subv(vec_a, vec_b, color=RED)
    """
    return VectorUtils.subtract(vector_a, vector_b, start_point=start_point, **arrow_kwargs)


def scalev(vector: Mobject, scalar: float, start_point: np.ndarray = None, **arrow_kwargs) -> Mobject:
    """
    Standalone function for scalar multiplication. See VectorUtils.scalar_multiply() for full documentation.

    Example:
        >>> from robo_manim_add_ons import scalev
        >>> result = scalev(vec_a, 2, color=BLUE)
    """
    return VectorUtils.scalar_multiply(vector, scalar, start_point=start_point, **arrow_kwargs)

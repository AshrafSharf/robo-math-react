"""
Text utilities for MathTex extraction and debugging.

Provides helper class for flexible MathTex part extraction with silent error handling.
"""

from manim import MathTex, VMobject, SurroundingRectangle, BLUE, ORANGE


class TextUtils:
    """Utility class for MathTex extraction and debugging operations."""

    @staticmethod
    def _parse_index(index_arg):
        """
        Parse an index argument into a usable index or slice.

        Args:
            index_arg: Either an int or a string like "1:2" or "1:" or ":2"

        Returns:
            int or slice object

        Example:
            >>> TextUtils._parse_index(1)
            1
            >>> TextUtils._parse_index("1:3")
            slice(1, 3, None)
            >>> TextUtils._parse_index("2:")
            slice(2, None, None)
        """
        if isinstance(index_arg, int):
            return index_arg
        elif isinstance(index_arg, str):
            # Parse slice notation "1:2" or "1:" or ":2"
            parts = index_arg.split(':')
            if len(parts) == 2:
                start = int(parts[0]) if parts[0] else None
                end = int(parts[1]) if parts[1] else None
                return slice(start, end)
            else:
                raise ValueError(f"Invalid slice format: {index_arg}")
        else:
            raise TypeError(f"Index must be int or string, got {type(index_arg)}")

    @staticmethod
    def _extract_part(mathtext_obj, *indices):
        """
        Extract a part from MathTex using chained indices with silent error handling.

        Args:
            mathtext_obj: MathTex object to extract from
            *indices: One or more indices (int or string slices) to chain

        Returns:
            Extracted MathTex part or empty VMobject if extraction fails

        Example:
            >>> eq = MathTex("x^2 + y^2")
            >>> part = TextUtils._extract_part(eq, 1, 2)  # eq[1][2]
            >>> part2 = TextUtils._extract_part(eq, "1:3")  # eq[1:3]
        """
        try:
            result = mathtext_obj
            for index_arg in indices:
                parsed_index = TextUtils._parse_index(index_arg)
                result = result[parsed_index]
            return result
        except (IndexError, TypeError, ValueError, KeyError) as e:
            print(f"Warning: Invalid index for MathTex extraction: {e}")
            return VMobject()

    @staticmethod
    def text(scene, mathtext, *args):
        """
        Extract a part from MathTex or create MathTex from string with flexible indexing.

        This is a pure extraction utility that doesn't modify colors or add to the scene.
        Silently fails and returns empty VMobject if indices are invalid.

        Args:
            scene: The scene object (required for text2 compatibility, not used here)
            mathtext: Either a string (creates MathTex) or existing MathTex object
            *args: Zero or more indices (int or "1:2" string slices) for extraction

        Returns:
            Extracted MathTex part or empty VMobject if extraction fails

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.text_utils import TextUtils
            >>>
            >>> # Create from string
            >>> eq = TextUtils.text(self, "x^2 + y^2")
            >>>
            >>> # Extract from string with indices
            >>> part = TextUtils.text(self, "x^2 + y^2", 0)  # eq[0]
            >>> part2 = TextUtils.text(self, "x^2 + y^2", 1, 2)  # eq[1][2]
            >>>
            >>> # Extract from existing MathTex
            >>> existing_eq = MathTex("a + b")
            >>> part3 = TextUtils.text(self, existing_eq, 1)  # existing_eq[1]
            >>>
            >>> # Slice extraction
            >>> part4 = TextUtils.text(self, "x^2 + y", "1:3")  # eq[1:3]
            >>> part5 = TextUtils.text(self, existing_eq, 0, "1:4")  # existing_eq[0][1:4]
        """
        # Create MathTex if string is provided
        if isinstance(mathtext, str):
            mathtext_obj = MathTex(mathtext)
        else:
            mathtext_obj = mathtext

        # If no indices provided, return the whole MathTex object
        if len(args) == 0:
            return mathtext_obj

        # Extract part using indices
        return TextUtils._extract_part(mathtext_obj, *args)

    @staticmethod
    def text2(scene, mathtext, *args):
        """
        Debug utility: Extract MathTex part, color it BLUE, add to scene with ORANGE rectangle.

        This method does everything text() does, plus:
        - Colors the extracted part BLUE
        - Adds the extracted part to the scene
        - Creates an ORANGE rectangle around it
        - Adds the rectangle to the scene

        Args:
            scene: The scene object (for adding objects)
            mathtext: Either a string (creates MathTex) or existing MathTex object
            *args: Zero or more indices (int or "1:2" string slices) for extraction

        Returns:
            Extracted MathTex part or empty VMobject if extraction fails

        Example:
            >>> from manim import *
            >>> from robo_manim_add_ons.text_utils import TextUtils
            >>>
            >>> class MyScene(Scene):
            ...     def construct(self):
            ...         # Debug: Show x^2 term with highlight
            ...         part = TextUtils.text2(self, "x^2 + y^2", 0)
            ...         # Creates MathTex, extracts [0], colors BLUE, adds to scene with ORANGE box
            ...
            ...         # Debug: Show specific part of existing equation
            ...         eq = MathTex("a + b = c")
            ...         part2 = TextUtils.text2(self, eq, 2)
            ...         # Extracts eq[2], colors BLUE, adds to scene with ORANGE box
        """
        # Use text() to extract the part
        extracted_part = TextUtils.text(scene, mathtext, *args)

        # If extraction failed (empty VMobject), return it
        if isinstance(extracted_part, VMobject) and len(extracted_part.submobjects) == 0:
            return extracted_part

        # Color the extracted part BLUE
        extracted_part.set_color(BLUE)

        # Add to scene
        scene.add(extracted_part)

        # Create and add ORANGE rectangle
        rectangle = SurroundingRectangle(extracted_part, color=ORANGE)
        scene.add(rectangle)

        # Return the extracted part (not the rectangle)
        return extracted_part


# ============================================================================
# Standalone function aliases for convenient static import
# ============================================================================

def text(scene, mathtext, *args):
    """
    Standalone function for MathTex extraction. See TextUtils.text() for full documentation.

    Example:
        >>> from robo_manim_add_ons import text
        >>> part = text(self, "x^2 + y", 0)
        >>> part2 = text(self, existing_eq, 1, 2)
    """
    return TextUtils.text(scene, mathtext, *args)


def text2(scene, mathtext, *args):
    """
    Standalone function for debug MathTex extraction. See TextUtils.text2() for full documentation.

    Example:
        >>> from robo_manim_add_ons import text2
        >>> part = text2(self, "x^2 + y", 0)  # Shows with BLUE color and ORANGE box
    """
    return TextUtils.text2(scene, mathtext, *args)

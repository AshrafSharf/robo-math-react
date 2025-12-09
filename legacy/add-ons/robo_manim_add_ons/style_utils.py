"""
Style utilities for chainable styling of Manim objects.

Provides convenient methods for styling objects with method chaining.
"""

from manim import VMobject
from typing import Union


def stroke(obj: VMobject, color) -> VMobject:
    """
    Set stroke color of a VMobject.

    Args:
        obj: The VMobject to style
        color: The stroke color

    Returns:
        The object (for chaining)

    Example:
        >>> from robo_manim_add_ons import stroke
        >>> line = Line(ORIGIN, RIGHT)
        >>> stroke(line, RED)
    """
    obj.set_stroke(color=color)
    return obj


def fill(obj: VMobject, color) -> VMobject:
    """
    Set fill color of a VMobject.

    Args:
        obj: The VMobject to style
        color: The fill color

    Returns:
        The object (for chaining)

    Example:
        >>> from robo_manim_add_ons import fill
        >>> circle = Circle()
        >>> fill(circle, BLUE)
    """
    obj.set_fill(color=color)
    return obj


def sopacity(obj: VMobject, opacity: float) -> VMobject:
    """
    Set stroke opacity of a VMobject.

    Args:
        obj: The VMobject to style
        opacity: The stroke opacity (0.0 to 1.0)

    Returns:
        The object (for chaining)

    Example:
        >>> from robo_manim_add_ons import sopacity
        >>> line = Line(ORIGIN, RIGHT)
        >>> sopacity(line, 0.5)
    """
    obj.set_stroke(opacity=opacity)
    return obj


def fopacity(obj: VMobject, opacity: float) -> VMobject:
    """
    Set fill opacity of a VMobject.

    Args:
        obj: The VMobject to style
        opacity: The fill opacity (0.0 to 1.0)

    Returns:
        The object (for chaining)

    Example:
        >>> from robo_manim_add_ons import fopacity
        >>> circle = Circle()
        >>> fopacity(circle, 0.3)
    """
    obj.set_fill(opacity=opacity)
    return obj


def sw(obj: VMobject, width: float) -> VMobject:
    """
    Set stroke width of a VMobject.

    Args:
        obj: The VMobject to style
        width: The stroke width

    Returns:
        The object (for chaining)

    Example:
        >>> from robo_manim_add_ons import sw
        >>> line = Line(ORIGIN, RIGHT)
        >>> sw(line, 5)
    """
    obj.set_stroke(width=width)
    return obj


# Chainable style helper class
class Style:
    """
    Helper class for chainable styling.

    This class wraps a VMobject and provides chainable styling methods.

    Example:
        >>> from robo_manim_add_ons import Style
        >>> line = Line(ORIGIN, RIGHT)
        >>> Style(line).stroke(RED).sw(3).sopacity(0.8)
        >>>
        >>> # Or use the s() convenience function
        >>> from robo_manim_add_ons import s
        >>> s(line).stroke(YELLOW).sw(5)
    """

    def __init__(self, obj: VMobject):
        """
        Initialize the Style wrapper.

        Args:
            obj: The VMobject to style
        """
        self.obj = obj

    def stroke(self, color) -> 'Style':
        """
        Set stroke color.

        Args:
            color: The stroke color

        Returns:
            Self (for chaining)
        """
        self.obj.set_stroke(color=color)
        return self

    def fill(self, color) -> 'Style':
        """
        Set fill color.

        Args:
            color: The fill color

        Returns:
            Self (for chaining)
        """
        self.obj.set_fill(color=color)
        return self

    def sopacity(self, opacity: float) -> 'Style':
        """
        Set stroke opacity.

        Args:
            opacity: The stroke opacity (0.0 to 1.0)

        Returns:
            Self (for chaining)
        """
        self.obj.set_stroke(opacity=opacity)
        return self

    def fopacity(self, opacity: float) -> 'Style':
        """
        Set fill opacity.

        Args:
            opacity: The fill opacity (0.0 to 1.0)

        Returns:
            Self (for chaining)
        """
        self.obj.set_fill(opacity=opacity)
        return self

    def sw(self, width: float) -> 'Style':
        """
        Set stroke width.

        Args:
            width: The stroke width

        Returns:
            Self (for chaining)
        """
        self.obj.set_stroke(width=width)
        return self

    def get(self) -> VMobject:
        """
        Get the styled object.

        Returns:
            The VMobject
        """
        return self.obj


def style(obj: VMobject) -> Style:
    """
    Convenience function to create a Style wrapper for chainable styling.

    Args:
        obj: The VMobject to style

    Returns:
        Style wrapper

    Example:
        >>> from robo_manim_add_ons import style
        >>> from manim import Line, Circle, ORIGIN, RIGHT, RED, BLUE
        >>>
        >>> # Chain multiple styles
        >>> line = Line(ORIGIN, RIGHT)
        >>> style(line).stroke(RED).sw(5).sopacity(0.7)
        >>>
        >>> # Works with any VMobject
        >>> circle = Circle()
        >>> style(circle).fill(BLUE).fopacity(0.3).stroke(RED).sw(2)
    """
    return Style(obj)

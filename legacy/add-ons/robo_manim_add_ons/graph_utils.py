"""
Graph utilities for creating plots from string expressions.

Provides functions for creating various types of plots (explicit, implicit, parametric)
from string expressions using sympy for parsing.
"""

import numpy as np
import sympy as sp
import re
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application, convert_xor
from manim import Axes, ImplicitFunction, ParametricFunction, MathTex, PI, BLACK, BLUE_D, DOWN, LEFT
from typing import Tuple, Union

# Transformations for parsing expressions with implicit multiplication
transformations = (standard_transformations +
                   (implicit_multiplication_application,) +
                   (convert_xor,))


class GraphUtils:
    """
    Utility class for creating graphs from string expressions.

    Provides intelligent plotting that automatically detects whether to use
    explicit plots, implicit plots, or parametric plots based on the input.
    """

    @staticmethod
    def _detect_trig_axes(*expressions: str) -> Tuple[bool, bool]:
        """
        Detect if expressions contain trigonometric functions requiring π ticks.

        Args:
            *expressions: One or more expression strings to analyze

        Returns:
            Tuple of (x_needs_pi, y_needs_pi) booleans

        Examples:
            >>> _detect_trig_axes("sin(x)")  # (True, False)
            >>> _detect_trig_axes("asin(x)") # (False, True)
            >>> _detect_trig_axes("sin(acos(x))") # (True, True)
        """
        # Combine all expressions
        combined = " ".join(expressions)

        # Forward trig functions suggest x-axis needs π ticks
        forward_trig = re.search(r'\b(sin|cos|tan|sec|csc|cot)\(', combined)
        x_needs_pi = forward_trig is not None

        # Inverse trig functions suggest y-axis needs π ticks
        inverse_trig = re.search(r'\b(asin|acos|atan|asec|acsc|acot|arcsin|arccos|arctan)\(', combined)
        y_needs_pi = inverse_trig is not None

        return x_needs_pi, y_needs_pi

    @staticmethod
    def _add_pi_ticks(axes: Axes, axis: str, mode: str, axis_range: list):
        """
        Add π-based tick labels to an axis.

        Args:
            axes: The Axes object
            axis: 'x' or 'y'
            mode: "pi", "pi/2", or "2pi" - determines tick spacing
            axis_range: Range of the axis [min, max, step]

        Examples:
            >>> _add_pi_ticks(axes, 'x', "pi", [0, 2*PI])
            >>> _add_pi_ticks(axes, 'y', "pi/2", [-PI, PI])
        """
        # Define comprehensive π label mapping
        pi_labels = {
            PI: r"\pi",
            PI/2: r"\frac{\pi}{2}",
            -PI: r"-\pi",
            -PI/2: r"-\frac{\pi}{2}",
            2*PI: r"2\pi",
            -2*PI: r"-2\pi",
            3*PI/2: r"\frac{3\pi}{2}",
            -3*PI/2: r"-\frac{3\pi}{2}",
            3*PI: r"3\pi",
            -3*PI: r"-3\pi",
            4*PI: r"4\pi",
            -4*PI: r"-4\pi",
            5*PI/2: r"\frac{5\pi}{2}",
            -5*PI/2: r"-\frac{5\pi}{2}",
            5*PI: r"5\pi",
            -5*PI: r"-5\pi",
            6*PI: r"6\pi",
            -6*PI: r"-6\pi",
            7*PI/2: r"\frac{7\pi}{2}",
            -7*PI/2: r"-\frac{7\pi}{2}",
            8*PI: r"8\pi",
            -8*PI: r"-8\pi",
            0: r"0",
        }

        # Filter labels based on mode
        if mode == "2pi":
            # Only multiples of 2π
            filtered = {k: v for k, v in pi_labels.items() if k % (2*PI) == 0 or k == 0}
        elif mode == "pi":
            # Multiples of π (including 2π)
            filtered = {k: v for k, v in pi_labels.items() if k % PI == 0}
        elif mode == "pi/2":
            # All labels (multiples of π/2)
            filtered = pi_labels
        else:
            filtered = pi_labels

        # Filter based on axis range
        x_min, x_max = axis_range[0], axis_range[1]
        range_filtered = {x: label for x, label in filtered.items() if x_min <= x <= x_max}

        # Sort for consistency
        sorted_labels = dict(sorted(range_filtered.items()))

        # Get the appropriate axis
        target_axis = axes.get_x_axis() if axis == 'x' else axes.get_y_axis()

        # Add labels
        for val, label_text in sorted_labels.items():
            label = MathTex(label_text, font_size=24)
            if axis == 'x':
                label.next_to(target_axis.n2p(val), DOWN, buff=0.2)
            else:
                label.next_to(target_axis.n2p(val), LEFT, buff=0.2)
            axes.add(label)

    @staticmethod
    def graph(*args, x_range=[-5, 5], y_range=[-5, 5], axes=None, x_ticks=None, y_ticks=None, coords=True, **kwargs) -> Tuple[Axes, object]:
        """
        Create a graph from string expression(s) with intelligent π tick detection.

        Intelligently detects the plot type and automatically adds π-based ticks
        for trigonometric functions.

        Args:
            *args: Either:
                - 1 string without "=": Explicit plot y = f(x), e.g., "sin(x)"
                - 1 string with "=": Implicit plot, e.g., "x**2 + y**2 = 4"
                - 2 strings: Parametric plot (x(t), y(t)), e.g., "cos(t)", "sin(t)"
            x_range: Range for x-axis, default [-5, 5]
            y_range: Range for y-axis, default [-5, 5]
            axes: Optional Axes object to use. If None, new axes will be created
            x_ticks: Tick mode for x-axis. Options:
                - None (default): Auto-detect based on trig functions
                - "pi": Multiples of π (π, 2π, 3π, ...)
                - "pi/2": Multiples of π/2 (π/2, π, 3π/2, ...)
                - "2pi": Multiples of 2π only
                - False: Disable π ticks (use regular numbers)
            y_ticks: Tick mode for y-axis (same options as x_ticks)
            coords: If True, automatically add coordinate numbers to axes (default True)
            **kwargs: Additional keyword arguments passed to Axes and plot functions

        Returns:
            Tuple of (axes, plot) where axes is an Axes object and plot is the
            plotted function (either from axes.plot(), ImplicitFunction, or ParametricFunction)

        Raises:
            ValueError: If wrong number of arguments or invalid expression

        Examples:
            >>> # Auto-detects sin → π ticks on x-axis (coordinates auto-added)
            >>> axes, plot = graph("sin(x)")
            >>>
            >>> # Auto-detects asin → π ticks on y-axis
            >>> axes, plot = graph("asin(x)")
            >>>
            >>> # Manual control - finer π/2 ticks
            >>> axes, plot = graph("sin(x)", x_ticks="pi/2")
            >>>
            >>> # Disable auto π ticks (coordinates will be added)
            >>> axes, plot = graph("sin(x)", x_ticks=False)
            >>>
            >>> # Disable coordinate numbers
            >>> axes, plot = graph("x**2", coords=False)
            >>>
            >>> # Implicit plot
            >>> axes, plot = graph("x**2 + y**2 = 4")
            >>>
            >>> # Parametric plot
            >>> axes, plot = graph("cos(t)", "sin(t)")
        """
        # Auto-detect trig functions if ticks not explicitly set
        if x_ticks is None or y_ticks is None:
            x_auto, y_auto = GraphUtils._detect_trig_axes(*args)
            if x_ticks is None:
                x_ticks = "pi" if x_auto else False
            if y_ticks is None:
                y_ticks = "pi" if y_auto else False

        if len(args) == 1:
            # Single string - could be explicit or implicit
            expr_str = args[0]

            # Check if it's an equation (contains "=")
            if "=" in expr_str:
                # Implicit plot
                return GraphUtils._create_implicit_plot(
                    expr_str, x_range, y_range, axes=axes,
                    x_ticks=x_ticks, y_ticks=y_ticks, coords=coords, **kwargs
                )
            else:
                # Explicit plot
                return GraphUtils._create_explicit_plot(
                    expr_str, x_range, y_range, axes=axes,
                    x_ticks=x_ticks, y_ticks=y_ticks, coords=coords, **kwargs
                )

        elif len(args) == 2:
            # Two strings - parametric plot
            expr_x, expr_y = args
            return GraphUtils._create_parametric_plot(
                expr_x, expr_y, x_range, y_range, axes=axes,
                x_ticks=x_ticks, y_ticks=y_ticks, coords=coords, **kwargs
            )

        else:
            raise ValueError(
                f"graph() takes 1 or 2 string arguments, got {len(args)}. "
                "Use 1 arg for explicit/implicit plots, 2 args for parametric plots."
            )

    @staticmethod
    def _remove_function_notation(expression: str) -> str:
        """
        Remove function notation like y=, f(x)=, etc. from expressions.

        Args:
            expression: String expression that may have function notation

        Returns:
            Expression with function notation removed
        """
        if '=' in expression:
            lhs, rhs = expression.split('=', 1)
            lhs = lhs.strip()
            # Check for patterns like y, x, f(x), g(t), etc.
            if lhs in ['x', 'y', 'z'] or (lhs and lhs[0].isalpha() and '(' in lhs and lhs.endswith(')')):
                return rhs.strip()
        return expression

    @staticmethod
    def _create_explicit_plot(expr_str: str, x_range, y_range, axes=None, x_ticks=False, y_ticks=False, coords=True, **kwargs) -> Tuple[Axes, object]:
        """
        Create an explicit plot y = f(x).

        Args:
            expr_str: String expression like "sin(x)" or "x**2"
            x_range: Range for x-axis
            y_range: Range for y-axis
            axes: Optional Axes object to use
            x_ticks: π tick mode for x-axis
            y_ticks: π tick mode for y-axis
            **kwargs: Additional arguments for Axes

        Returns:
            Tuple of (axes, plot)
        """
        # Remove function notation if present (e.g., "y = sin(x)" -> "sin(x)")
        expr_str = GraphUtils._remove_function_notation(expr_str)

        # Parse the expression
        expr = parse_expr(expr_str, transformations=transformations)

        # Get the free variable (should be x)
        free_vars = expr.free_symbols
        if len(free_vars) == 0:
            # Constant function
            var = sp.Symbol('x')
        elif len(free_vars) == 1:
            var = list(free_vars)[0]
        else:
            # Multiple variables - can't do explicit plot
            raise ValueError(
                f"Expression '{expr_str}' has multiple variables {free_vars}. "
                "Use implicit plot (include '=') or parametric plot (2 expressions)."
            )

        # Convert to lambda function
        func = sp.lambdify(var, expr, "numpy")

        # Create or use provided axes
        if axes is None:
            # Configure axis to hide numbers if π ticks will be added
            x_axis_config = {"include_numbers": not bool(x_ticks)}
            y_axis_config = {"include_numbers": not bool(y_ticks)}

            axes = Axes(
                x_range=[x_range[0], x_range[1], (x_range[1] - x_range[0]) / 10],
                y_range=[y_range[0], y_range[1], (y_range[1] - y_range[0]) / 10],
                x_axis_config=x_axis_config,
                y_axis_config=y_axis_config,
                **{k: v for k, v in kwargs.items() if k in ['x_length', 'y_length', 'tips', 'axis_config']}
            )
            # Set default axes color to BLACK
            axes.set_stroke(color=BLACK)

        # Create plot with default BLUE_D color
        plot_kwargs = {k: v for k, v in kwargs.items() if k in ['color', 'stroke_width']}
        if 'color' not in plot_kwargs:
            plot_kwargs['color'] = BLUE_D
        if 'stroke_width' not in plot_kwargs:
            plot_kwargs['stroke_width'] = 3
        plot = axes.plot(func, x_range=x_range, **plot_kwargs)

        # Add π ticks if requested
        if x_ticks and isinstance(x_ticks, str):
            GraphUtils._add_pi_ticks(axes, 'x', x_ticks, x_range)
        if y_ticks and isinstance(y_ticks, str):
            GraphUtils._add_pi_ticks(axes, 'y', y_ticks, y_range)

        # Add coordinate numbers if requested (and not using π ticks)
        if coords and not (x_ticks or y_ticks):
            axes.add_coordinates()

        return axes, plot

    @staticmethod
    def _create_implicit_plot(expr_str: str, x_range, y_range, axes=None, x_ticks=False, y_ticks=False, coords=True, **kwargs) -> Tuple[Axes, object]:
        """
        Create an implicit plot from an equation.

        Args:
            expr_str: String equation like "x**2 + y**2 = 4" or "x**2 + y**2 - 4"
            x_range: Range for x-axis
            y_range: Range for y-axis
            axes: Optional Axes object to use
            x_ticks: π tick mode for x-axis
            y_ticks: π tick mode for y-axis
            **kwargs: Additional arguments for Axes

        Returns:
            Tuple of (axes, plot)
        """
        # Parse the equation
        if "=" in expr_str:
            left, right = expr_str.split("=", 1)
            left_expr = parse_expr(left.strip(), transformations=transformations)
            right_expr = parse_expr(right.strip(), transformations=transformations)
            # Convert to form: left - right = 0
            expr = left_expr - right_expr
        else:
            # Assume it's already in form f(x, y) = 0
            expr = parse_expr(expr_str, transformations=transformations)

        # Get free variables
        free_vars = expr.free_symbols
        if len(free_vars) != 2:
            raise ValueError(
                f"Implicit plot requires exactly 2 variables, got {len(free_vars)}: {free_vars}"
            )

        # Convert to lambda function
        x, y = sp.Symbol('x'), sp.Symbol('y')
        func = sp.lambdify((x, y), expr, "numpy")

        # Create or use provided axes
        if axes is None:
            # Configure axis to hide numbers if π ticks will be added
            x_axis_config = {"include_numbers": not bool(x_ticks)}
            y_axis_config = {"include_numbers": not bool(y_ticks)}

            axes = Axes(
                x_range=[x_range[0], x_range[1], (x_range[1] - x_range[0]) / 10],
                y_range=[y_range[0], y_range[1], (y_range[1] - y_range[0]) / 10],
                x_axis_config=x_axis_config,
                y_axis_config=y_axis_config,
                **{k: v for k, v in kwargs.items() if k in ['x_length', 'y_length', 'tips', 'axis_config']}
            )
            # Set default axes color to BLACK
            axes.set_stroke(color=BLACK)

        # Create implicit plot with default BLUE_D color
        plot_kwargs = {k: v for k, v in kwargs.items() if k in ['color', 'stroke_width']}
        if 'color' not in plot_kwargs:
            plot_kwargs['color'] = BLUE_D
        if 'stroke_width' not in plot_kwargs:
            plot_kwargs['stroke_width'] = 3
        plot = ImplicitFunction(
            lambda x, y: func(x, y),
            **plot_kwargs
        )

        # Add π ticks if requested
        if x_ticks and isinstance(x_ticks, str):
            GraphUtils._add_pi_ticks(axes, 'x', x_ticks, x_range)
        if y_ticks and isinstance(y_ticks, str):
            GraphUtils._add_pi_ticks(axes, 'y', y_ticks, y_range)

        # Add coordinate numbers if requested (and not using π ticks)
        if coords and not (x_ticks or y_ticks):
            axes.add_coordinates()

        return axes, plot

    @staticmethod
    def _create_parametric_plot(expr_x: str, expr_y: str, x_range, y_range, t_range=None, axes=None, x_ticks=False, y_ticks=False, coords=True, **kwargs) -> Tuple[Axes, object]:
        """
        Create a parametric plot from two expressions.

        Args:
            expr_x: String expression for x(t), e.g., "cos(t)"
            expr_y: String expression for y(t), e.g., "sin(t)"
            x_range: Range for x-axis
            y_range: Range for y-axis
            t_range: Range for parameter t, default [0, 2*PI]
            axes: Optional Axes object to use
            x_ticks: π tick mode for x-axis
            y_ticks: π tick mode for y-axis
            **kwargs: Additional arguments for Axes

        Returns:
            Tuple of (axes, plot)
        """
        # Remove function notation if present
        expr_x = GraphUtils._remove_function_notation(expr_x)
        expr_y = GraphUtils._remove_function_notation(expr_y)

        # Parse expressions
        parsed_x = parse_expr(expr_x, transformations=transformations)
        parsed_y = parse_expr(expr_y, transformations=transformations)

        # Get free variables
        vars_x = parsed_x.free_symbols
        vars_y = parsed_y.free_symbols
        all_vars = vars_x | vars_y

        if len(all_vars) == 0:
            # Constant functions
            var = sp.Symbol('t')
        elif len(all_vars) == 1:
            var = list(all_vars)[0]
        else:
            raise ValueError(
                f"Parametric expressions must share the same variable, got {all_vars}"
            )

        # Convert to lambda functions
        func_x = sp.lambdify(var, parsed_x, "numpy")
        func_y = sp.lambdify(var, parsed_y, "numpy")

        # Default t_range if not provided
        if t_range is None:
            t_range = [0, 2 * np.pi]

        # Create or use provided axes
        if axes is None:
            # Configure axis to hide numbers if π ticks will be added
            x_axis_config = {"include_numbers": not bool(x_ticks)}
            y_axis_config = {"include_numbers": not bool(y_ticks)}

            axes = Axes(
                x_range=[x_range[0], x_range[1], (x_range[1] - x_range[0]) / 10],
                y_range=[y_range[0], y_range[1], (y_range[1] - y_range[0]) / 10],
                x_axis_config=x_axis_config,
                y_axis_config=y_axis_config,
                **{k: v for k, v in kwargs.items() if k in ['x_length', 'y_length', 'tips', 'axis_config']}
            )
            # Set default axes color to BLACK
            axes.set_stroke(color=BLACK)

        # Create parametric plot with default BLUE_D color
        plot_kwargs = {k: v for k, v in kwargs.items() if k in ['color', 'stroke_width']}
        if 'color' not in plot_kwargs:
            plot_kwargs['color'] = BLUE_D
        if 'stroke_width' not in plot_kwargs:
            plot_kwargs['stroke_width'] = 3
        plot = ParametricFunction(
            lambda t: axes.c2p(func_x(t), func_y(t)),
            t_range=t_range,
            **plot_kwargs
        )

        # Add π ticks if requested
        if x_ticks and isinstance(x_ticks, str):
            GraphUtils._add_pi_ticks(axes, 'x', x_ticks, x_range)
        if y_ticks and isinstance(y_ticks, str):
            GraphUtils._add_pi_ticks(axes, 'y', y_ticks, y_range)

        # Add coordinate numbers if requested (and not using π ticks)
        if coords and not (x_ticks or y_ticks):
            axes.add_coordinates()

        return axes, plot


# Convenience function at module level
def graph(*args, **kwargs) -> Tuple[Axes, object]:
    """
    Convenience function for GraphUtils.graph().

    Create a graph from string expression(s). See GraphUtils.graph() for details.
    """
    return GraphUtils.graph(*args, **kwargs)

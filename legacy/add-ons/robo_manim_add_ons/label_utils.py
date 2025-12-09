"""
Label utility functions for Manim polygons.

This module provides utilities to create vertex and edge labels for polygons.
"""

import numpy as np
from manim import MathTex, WHITE, YELLOW, UP


def vertex_labels(polygon, labels, scale=0.7, color=WHITE, buff=0.3):
    """
    Create vertex labels positioned outside polygon

    Args:
        polygon: Manim Polygon object
        labels: List of label strings ['A', 'B', 'C']
        scale: Label text scale (default 0.7)
        color: Label color (default WHITE)
        buff: Distance from vertex to label (default 0.3)

    Returns:
        List of positioned MathTex objects
    """
    vertices = polygon.get_vertices()
    center = polygon.get_center()
    label_objects = []

    for vertex, label_text in zip(vertices, labels):
        # Calculate outward direction from center
        direction = vertex - center
        norm = np.linalg.norm(direction)
        if norm > 0:
            direction = direction / norm
        else:
            direction = UP  # Fallback if vertex is at center

        # Create and position label
        label = MathTex(label_text)
        label.scale(scale)
        label.set_color(color)
        label.next_to(vertex, direction, buff=buff)

        label_objects.append(label)

    return label_objects


def edge_labels(polygon, labels, scale=0.6, color=YELLOW, buff=0.2):
    """
    Create edge labels at midpoints with perpendicular offset

    Args:
        polygon: Manim Polygon object
        labels: List of label strings for each edge ['a', 'b', 'c']
        scale: Label text scale (default 0.6)
        color: Label color (default YELLOW)
        buff: Distance from edge midpoint (default 0.2)

    Returns:
        List of positioned MathTex objects
    """
    vertices = polygon.get_vertices()
    label_objects = []
    n = len(vertices)

    for i, label_text in enumerate(labels):
        # Get edge endpoints
        p1 = vertices[i]
        p2 = vertices[(i + 1) % n]

        # Calculate midpoint
        midpoint = (p1 + p2) / 2

        # Calculate perpendicular direction (rotate edge vector 90°)
        edge_vector = p2 - p1
        perp = np.array([-edge_vector[1], edge_vector[0], 0])

        # Normalize perpendicular vector
        perp_norm = np.linalg.norm(perp)
        if perp_norm > 0:
            perp = perp / perp_norm
        else:
            perp = UP  # Fallback

        # Create and position label
        label = MathTex(label_text)
        label.scale(scale)
        label.set_color(color)
        label.next_to(midpoint, perp, buff=buff)

        label_objects.append(label)

    return label_objects

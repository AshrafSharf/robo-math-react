export function getAllDescriptions() {
    return {
        'title': 'Find intercept form of plane cutting axes at $4$, $-6$, and $8$',
        
        // Intercept points
        'x_intercept': 'Point $A(4,\\ 0,\\ 0)$ where plane cuts x-axis at $a = 4$',
        'y_intercept': 'Point $B(0,\\ -6,\\ 0)$ where plane cuts y-axis at $b = -6$',
        'z_intercept': 'Point $C(0,\\ 0,\\ 8)$ where plane cuts z-axis at $c = 8$',
        
        // Triangle edges
        'edge_xy': 'Edge $AB$ between x and y intercepts',
        'edge_yz': 'Edge $BC$ between y and z intercepts',
        'edge_zx': 'Edge $CA$ completes triangular boundary',
        
        // Plane visualization
        'plane_triangle': 'Plane through intercepts satisfies $\\frac{x}{a} + \\frac{y}{b} + \\frac{z}{c} = 1$',
        'equation_label': 'Result: $\\frac{x}{4} + \\frac{y}{-6} + \\frac{z}{8} = 1$'
    };
}

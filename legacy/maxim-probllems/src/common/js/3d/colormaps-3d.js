/**
 * colormaps-3d.js
 * Module for colormap functions used in 3D visualizations
 * Part of the modularized common-3d system
 */

/**
 * Viridis colormap function
 * @param {number} t - Value between 0 and 1
 * @returns {Object} RGB color object with r, g, b values between 0 and 1
 */
export function viridisColor(t) {
    const c0 = { r: 0.267004, g: 0.004874, b: 0.329415 };
    const c1 = { r: 0.127568, g: 0.566949, b: 0.550556 };
    const c2 = { r: 0.993248, g: 0.906157, b: 0.143936 };
    
    if (t < 0.5) {
        const s = t * 2;
        return {
            r: c0.r + s * (c1.r - c0.r),
            g: c0.g + s * (c1.g - c0.g),
            b: c0.b + s * (c1.b - c0.b)
        };
    } else {
        const s = (t - 0.5) * 2;
        return {
            r: c1.r + s * (c2.r - c1.r),
            g: c1.g + s * (c2.g - c1.g),
            b: c1.b + s * (c2.b - c1.b)
        };
    }
}

/**
 * Plasma colormap function
 * @param {number} t - Value between 0 and 1
 * @returns {Object} RGB color object with r, g, b values between 0 and 1
 */
export function plasmaColor(t) {
    const r = Math.min(1, Math.max(0, 0.987 * t + 0.002));
    const g = Math.min(1, Math.max(0, -2.157 * t * t + 1.881 * t + 0.002));
    const b = Math.min(1, Math.max(0, 3.089 * t * t * t - 4.096 * t * t + 0.297 * t + 0.735));
    return { r, g, b };
}

/**
 * Cool-warm colormap function
 * @param {number} t - Value between 0 and 1
 * @returns {Object} RGB color object with r, g, b values between 0 and 1
 */
export function coolwarmColor(t) {
    const r = t;
    const g = 0.5;
    const b = 1 - t;
    return { r, g, b };
}

/**
 * Rainbow colormap function
 * @param {number} t - Value between 0 and 1
 * @returns {Object} RGB color object with r, g, b values between 0 and 1
 */
export function rainbowColor(t) {
    const hue = t * 360;
    const saturation = 1;
    const lightness = 0.5;
    
    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness - c / 2;
    
    let r, g, b;
    
    if (hue < 60) {
        r = c; g = x; b = 0;
    } else if (hue < 120) {
        r = x; g = c; b = 0;
    } else if (hue < 180) {
        r = 0; g = c; b = x;
    } else if (hue < 240) {
        r = 0; g = x; b = c;
    } else if (hue < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }
    
    return {
        r: r + m,
        g: g + m,
        b: b + m
    };
}

/**
 * Grayscale colormap function
 * @param {number} t - Value between 0 and 1
 * @returns {Object} RGB color object with r, g, b values between 0 and 1
 */
export function grayscaleColor(t) {
    return { r: t, g: t, b: t };
}

/**
 * Red-blue colormap function
 * @param {number} t - Value between 0 and 1
 * @returns {Object} RGB color object with r, g, b values between 0 and 1
 */
export function redBlueColor(t) {
    return {
        r: 1 - t,
        g: 0,
        b: t
    };
}

/**
 * Heat colormap function (black -> red -> yellow -> white)
 * @param {number} t - Value between 0 and 1
 * @returns {Object} RGB color object with r, g, b values between 0 and 1
 */
export function heatColor(t) {
    let r, g, b;
    
    if (t < 0.33) {
        // Black to red
        const s = t / 0.33;
        r = s;
        g = 0;
        b = 0;
    } else if (t < 0.66) {
        // Red to yellow
        const s = (t - 0.33) / 0.33;
        r = 1;
        g = s;
        b = 0;
    } else {
        // Yellow to white
        const s = (t - 0.66) / 0.34;
        r = 1;
        g = 1;
        b = s;
    }
    
    return { r, g, b };
}

/**
 * Gets a colormap function by name
 * @param {string|Function} colormap - Colormap name or custom function
 * @returns {Function} Colormap function
 */
export function getColormap(colormap) {
    if (typeof colormap === 'function') {
        return colormap;
    }
    
    const colormaps = {
        'viridis': viridisColor,
        'plasma': plasmaColor,
        'coolwarm': coolwarmColor,
        'rainbow': rainbowColor,
        'grayscale': grayscaleColor,
        'redblue': redBlueColor,
        'heat': heatColor
    };
    
    return colormaps[colormap] || viridisColor;
}

/**
 * Applies a colormap to a value, handling normalization
 * @param {number} value - The value to map
 * @param {number} min - Minimum value in range
 * @param {number} max - Maximum value in range
 * @param {string|Function} colormap - Colormap to use
 * @returns {Object} RGB color object with r, g, b values between 0 and 1
 */
export function applyColormap(value, min, max, colormap = 'viridis') {
    // Normalize value to [0, 1]
    const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
    
    // Get colormap function
    const colormapFn = getColormap(colormap);
    
    // Apply colormap
    return colormapFn(t);
}
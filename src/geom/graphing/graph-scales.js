import { scaleLinear, scalePow, scaleLog, scaleTime } from 'd3-scale';

// Linear scales
export function XLinearScale(domain, width) {
    return scaleLinear()
        .domain([domain[0], domain[1]])
        .range([0, width]);
}

export function YLinearScale(range, height) {
    return scaleLinear()
        .domain([range[0], range[1]])
        .range([height, 0]);
}

// Power scales
export function XPowerScale(domain, exponent, width) {
    return scalePow()
        .domain([domain[0], domain[1]])
        .range([0, width])
        .exponent(exponent);
}

export function YPowerScale(range, exponent, height) {
    return scalePow()
        .domain([range[0], range[1]])
        .range([height, 0])
        .exponent(exponent);
}

// Logarithmic scales with configurable base
export function XLogScale(domain, width, base = 10) {
    const logBase = base === 'e' ? Math.E : base === '2' ? 2 : parseFloat(base) || 10;
    return scaleLog()
        .base(logBase)
        .domain([domain[0], domain[1]])
        .range([0, width]);
}

export function YLogScale(range, height, base = 10) {
    const logBase = base === 'e' ? Math.E : base === '2' ? 2 : parseFloat(base) || 10;
    return scaleLog()
        .base(logBase)
        .domain([range[0], range[1]])
        .range([height, 0]);
}

/**
 * Get the appropriate scale builder based on scale type
 * @param {string} scaleType - 'linear', 'log', or 'pi'
 * @param {Object} options - Scale options (logBase for log scale)
 * @returns {Function} Scale builder function
 */
export function getXScaleBuilder(scaleType, options = {}) {
    switch (scaleType) {
        case 'log':
            return (domain, width) => XLogScale(domain, width, options.logBase);
        case 'pi':
            // Pi scale uses linear scale, ticks/labels handled separately
            return (domain, width) => XLinearScale(domain, width);
        default:
            return (domain, width) => XLinearScale(domain, width);
    }
}

export function getYScaleBuilder(scaleType, options = {}) {
    switch (scaleType) {
        case 'log':
            return (range, height) => YLogScale(range, height, options.logBase);
        case 'pi':
            // Pi scale uses linear scale, ticks/labels handled separately
            return (range, height) => YLinearScale(range, height);
        default:
            return (range, height) => YLinearScale(range, height);
    }
}

// Time scales
export function XTimeScale(domain, width) {
    return scaleTime()
        .domain([domain[0], domain[1]])
        .range([0, width]);
}

export function YTimeScale(range, height) {
    return scaleTime()
        .domain([range[0], range[1]])
        .range([height, 0]);
}
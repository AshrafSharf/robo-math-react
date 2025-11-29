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

// Logarithmic scales
export function XLogScale(domain, width) {
    return scaleLog()
        .domain([domain[0], domain[1]])
        .range([0, width]);
}

export function YLogScale(range, height) {
    return scaleLog()
        .domain([range[0], range[1]])
        .range([height, 0]);
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
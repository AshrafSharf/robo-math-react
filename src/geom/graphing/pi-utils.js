/**
 * Pi utilities - recognize and format pi multiples
 */

const PI = Math.PI;
const TOLERANCE = 0.0001;

/**
 * Known pi multiples for quick lookup
 * Maps ratio (value/π) to display string
 */
const PI_MULTIPLES = [
    // Sixths
    { ratio: 1/6, label: "π/6" },
    { ratio: 1/4, label: "π/4" },
    { ratio: 1/3, label: "π/3" },
    { ratio: 1/2, label: "π/2" },
    { ratio: 2/3, label: "2π/3" },
    { ratio: 3/4, label: "3π/4" },
    { ratio: 5/6, label: "5π/6" },
    { ratio: 1, label: "π" },
    { ratio: 7/6, label: "7π/6" },
    { ratio: 5/4, label: "5π/4" },
    { ratio: 4/3, label: "4π/3" },
    { ratio: 3/2, label: "3π/2" },
    { ratio: 5/3, label: "5π/3" },
    { ratio: 7/4, label: "7π/4" },
    { ratio: 11/6, label: "11π/6" },
    { ratio: 2, label: "2π" },
    { ratio: 3, label: "3π" },
    { ratio: 4, label: "4π" },
];

/**
 * Check if a value matches a known pi multiple
 * @param {number} value - The numeric value to check
 * @returns {object|null} - { value, ratio, label } if matched, null otherwise
 */
export function matchPiMultiple(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return null;
    }

    const ratio = value / PI;
    const sign = ratio < 0 ? -1 : 1;
    const absRatio = Math.abs(ratio);

    for (const mult of PI_MULTIPLES) {
        if (Math.abs(absRatio - mult.ratio) < TOLERANCE) {
            return {
                value: sign * mult.ratio * PI,
                ratio: sign * mult.ratio,
                label: sign < 0 ? "−" + mult.label : mult.label
            };
        }
    }

    // Check for larger integer multiples (5π, 6π, etc.)
    if (Math.abs(absRatio - Math.round(absRatio)) < TOLERANCE && absRatio > 4) {
        const n = Math.round(absRatio);
        return {
            value: sign * n * PI,
            ratio: sign * n,
            label: sign < 0 ? `−${n}π` : `${n}π`
        };
    }

    return null;
}

/**
 * Format a value as pi multiple if possible
 * @param {number} value - The numeric value to format
 * @returns {string} - Formatted string (e.g., "π/4", "2π", or decimal)
 */
export function formatPiValue(value) {
    if (Math.abs(value) < TOLERANCE) return "0";

    const match = matchPiMultiple(value);
    if (match) {
        return match.label;
    }

    // Return decimal for non-pi values
    return value.toFixed(2);
}

/**
 * Get the exact pi value for a ratio string
 * @param {string} ratioStr - Like "1/4", "1/2", "1", "2"
 * @returns {number} - The exact value (e.g., PI/4, PI/2, PI, 2*PI)
 */
export function getPiValue(ratioStr) {
    const [num, denom] = ratioStr.split('/').map(Number);
    if (denom) {
        return (num / denom) * PI;
    }
    return num * PI;
}

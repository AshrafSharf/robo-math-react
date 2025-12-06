/**
 * Simple Test Framework for Expression Parser
 * Provides assertions and test organization without external dependencies
 */

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m'
};

// Test state
let currentSuite = null;
let allTests = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Assertion functions
 */
export const assert = {
    /**
     * Assert that value is truthy
     */
    ok(value, message = 'Expected truthy value') {
        if (!value) {
            throw new AssertionError(message, { expected: 'truthy', actual: value });
        }
    },

    /**
     * Assert equality (===)
     */
    equal(actual, expected, message) {
        if (actual !== expected) {
            const msg = message || `Expected ${expected}, got ${actual}`;
            throw new AssertionError(msg, { expected, actual });
        }
    },

    /**
     * Assert deep equality for objects/arrays
     */
    deepEqual(actual, expected, message) {
        if (!deepEquals(actual, expected)) {
            const msg = message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
            throw new AssertionError(msg, { expected, actual });
        }
    },

    /**
     * Assert approximate equality for floating point
     */
    closeTo(actual, expected, delta = 0.0001, message) {
        if (Math.abs(actual - expected) > delta) {
            const msg = message || `Expected ${expected} ± ${delta}, got ${actual}`;
            throw new AssertionError(msg, { expected: `${expected} ± ${delta}`, actual });
        }
    },

    /**
     * Assert that function throws
     */
    throws(fn, message = 'Expected function to throw') {
        let threw = false;
        try {
            fn();
        } catch (e) {
            threw = true;
        }
        if (!threw) {
            throw new AssertionError(message);
        }
    },

    /**
     * Assert array equality
     */
    arrayEqual(actual, expected, message) {
        if (!Array.isArray(actual) || !Array.isArray(expected)) {
            throw new AssertionError('Both values must be arrays');
        }
        if (actual.length !== expected.length) {
            const msg = message || `Array length mismatch: expected ${expected.length}, got ${actual.length}`;
            throw new AssertionError(msg, { expected, actual });
        }
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                const msg = message || `Array mismatch at index ${i}: expected ${expected[i]}, got ${actual[i]}`;
                throw new AssertionError(msg, { expected, actual });
            }
        }
    }
};

/**
 * Custom assertion error
 */
class AssertionError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'AssertionError';
        this.details = details;
    }
}

/**
 * Deep equality check
 */
function deepEquals(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEquals(a[key], b[key])) return false;
    }

    return true;
}

/**
 * Define a test suite
 */
export function describe(name, fn) {
    const previousSuite = currentSuite;
    currentSuite = name;

    console.log(`\n${colors.blue}${name}${colors.reset}`);

    try {
        fn();
    } finally {
        currentSuite = previousSuite;
    }
}

/**
 * Define a test
 */
export function test(name, fn) {
    totalTests++;

    try {
        fn();
        passedTests++;
        console.log(`  ${colors.green}✓${colors.reset} ${name}`);
    } catch (error) {
        failedTests++;
        console.log(`  ${colors.red}✗${colors.reset} ${name}`);
        console.log(`    ${colors.red}${error.message}${colors.reset}`);
        if (error.details) {
            console.log(`    ${colors.gray}Expected: ${JSON.stringify(error.details.expected)}${colors.reset}`);
            console.log(`    ${colors.gray}Actual: ${JSON.stringify(error.details.actual)}${colors.reset}`);
        }
        if (error.stack && process.env.VERBOSE) {
            console.log(`    ${colors.gray}${error.stack}${colors.reset}`);
        }
    }
}

/**
 * Print test summary
 */
export function printSummary() {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`${colors.blue}Test Summary${colors.reset}`);
    console.log(`Total: ${totalTests}`);
    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    if (failedTests > 0) {
        console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
    }
    console.log('='.repeat(50));

    // Exit with appropriate code
    if (failedTests > 0) {
        process.exit(1);
    }
}

/**
 * Reset test state (useful for running multiple test files)
 */
export function resetTests() {
    totalTests = 0;
    passedTests = 0;
    failedTests = 0;
    allTests = [];
}

/**
 * Get test statistics
 */
export function getStats() {
    return {
        total: totalTests,
        passed: passedTests,
        failed: failedTests
    };
}

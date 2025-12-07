/**
 * Parser Module - Wrapper for compass-parser
 *
 * This module provides an ES6 interface to the compass-parser.js (generated file).
 * The compass-parser.js is generated from compassgrammar.pegjs and should not be modified.
 *
 * @example
 * import { parse } from './parser';
 * const ast = parse('line(0, 0, 10, 10)');
 */

// Set up global robo object before loading the parser
const globalObj = typeof window !== 'undefined' ? window : globalThis;
globalObj.robo = globalObj.robo || {};

// Import the parser (side-effect: sets up robo.compass.CompassParser)
import './compass-parser.js';

/**
 * Parse a string expression into an AST
 * @param {string} input - The expression string to parse
 * @returns {Array} - The parsed AST
 * @throws {SyntaxError} - If the input cannot be parsed
 */
export function parse(input) {
    if (!globalObj.robo.compass || !globalObj.robo.compass.CompassParser) {
        throw new Error('Compass parser not loaded properly.');
    }

    return globalObj.robo.compass.CompassParser.parse(input);
}

/**
 * The Parser's SyntaxError class
 */
export const SyntaxError = globalObj.robo.compass?.CompassParser?.SyntaxError || Error;

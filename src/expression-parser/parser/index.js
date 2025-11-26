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

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up global robo object before loading the parser
const globalObj = typeof window !== 'undefined' ? window : global;
globalObj.robo = globalObj.robo || {};

// Load and execute the compass-parser.js file
const parserPath = join(__dirname, 'compass-parser.js');
const parserCode = readFileSync(parserPath, 'utf8');

// Execute the parser code in the global context
const parserFunc = new Function('robo', parserCode + '\nreturn robo;');
const robo = parserFunc(globalObj.robo);

// Update global
globalObj.robo = robo;

/**
 * Parse a string expression into an AST
 * @param {string} input - The expression string to parse
 * @returns {Array} - The parsed AST
 * @throws {SyntaxError} - If the input cannot be parsed
 */
export function parse(input) {
    if (!robo.compass || !robo.compass.CompassParser) {
        throw new Error('Compass parser not loaded properly.');
    }

    return robo.compass.CompassParser.parse(input);
}

/**
 * The Parser's SyntaxError class
 */
export const SyntaxError = robo.compass && robo.compass.CompassParser
    ? robo.compass.CompassParser.SyntaxError
    : Error;

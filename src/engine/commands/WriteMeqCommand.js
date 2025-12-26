/**
 * WriteMeqCommand - Writes meq (multi-line equation) with line-by-line animation
 *
 * Animates each line sequentially in Y-sorted order (top to bottom).
 */
import { BaseMeqCommand } from './BaseMeqCommand.js';

export class WriteMeqCommand extends BaseMeqCommand {
    // Uses all default behavior from BaseMeqCommand:
    // - Builds selection units for each line
    // - Animates line by line with autoComplete=true
}

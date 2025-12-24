import { BaseEffect } from './base-effect.js';
import { TweenMax } from 'gsap';

/**
 * WriteCellEffect handles write animation for table cells
 *
 * For LaTeX content: Uses stroke-dasharray animation (pen-tracing)
 * For plain text: Uses typewriter effect (character by character)
 */
export class WriteCellEffect extends BaseEffect {
    /**
     * @param {TableCell} tableCell - The table cell to animate
     */
    constructor(tableCell) {
        super();
        this.tableCell = tableCell;
        this.originalContent = '';
    }

    toEndState() {
        // Ensure all strokes are enabled and content is visible
        if (this.tableCell.isMath()) {
            this.tableCell.enableStrokes();
        } else {
            // Restore full text content
            const element = this.tableCell.element;
            if (element) {
                element.textContent = this.originalContent;
            }
        }
    }

    show() {
        const element = this.tableCell.element;
        if (element) {
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        }
        // Hide content initially for animation
        if (this.tableCell.isMath()) {
            this.tableCell.disableStrokes();
        } else {
            // Store original content and clear for typewriter
            this.originalContent = this.tableCell.getContent();
            if (element) {
                element.textContent = '';
            }
        }
    }

    hide() {
        const element = this.tableCell.element;
        if (element) {
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
        }
    }

    doPlay(playContext) {
        if (this.tableCell.isMath()) {
            this._animateMath(playContext);
        } else {
            this._animateText(playContext);
        }
    }

    /**
     * Animate LaTeX content with pen-tracing (stroke-dasharray)
     */
    _animateMath(playContext) {
        const paths = this.tableCell.getSVGPaths();
        if (!paths || paths.length === 0) {
            this.scheduleComplete();
            playContext.onComplete();
            return;
        }

        // Get total animation duration
        const totalDuration = playContext.durationInSeconds;
        const perPathDuration = totalDuration / paths.length;

        // Animate each path sequentially
        let completedPaths = 0;
        paths.forEach((path, index) => {
            // Get path length for dasharray
            const pathLength = path.getTotalLength ? path.getTotalLength() : 1000;

            // Set initial state - fully hidden
            path.style.strokeDasharray = `${pathLength}`;
            path.style.strokeDashoffset = `${pathLength}`;
            path.style.opacity = '1';

            // Animate after delay based on index
            const delay = index * perPathDuration * 0.8; // Slight overlap

            TweenMax.to(path, perPathDuration, {
                strokeDashoffset: 0,
                delay: delay,
                ease: 'Power1.easeInOut',
                onComplete: () => {
                    // Ensure final state
                    path.style.strokeDasharray = '0,0';
                    path.style.strokeDashoffset = '0';
                    completedPaths++;

                    if (completedPaths === paths.length) {
                        this.scheduleComplete();
                        playContext.onComplete();
                    }
                }
            });
        });
    }

    /**
     * Animate plain text content with typewriter effect
     */
    _animateText(playContext) {
        const element = this.tableCell.element;
        const content = this.originalContent;

        if (!element || !content) {
            this.scheduleComplete();
            playContext.onComplete();
            return;
        }

        const totalDuration = playContext.durationInSeconds * 1000; // Convert to ms
        const charDelay = totalDuration / content.length;
        let currentIndex = 0;

        const typeNextChar = () => {
            if (currentIndex < content.length) {
                currentIndex++;
                element.textContent = content.substring(0, currentIndex);

                const timeoutId = setTimeout(typeNextChar, charDelay);
                this.addTimeout(timeoutId);
            } else {
                // Animation complete
                this.scheduleComplete();
                playContext.onComplete();
            }
        };

        // Start typing
        typeNextChar();
    }
}

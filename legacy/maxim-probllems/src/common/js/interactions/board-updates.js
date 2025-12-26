// Board update functionality with MathJax support
// Extracted from common.js to handle dynamic board updates

/**
 * Update board and re-render dynamic content (including MathJax)
 * @param {JXG.Board} board - The JSXGraph board to update
 */
export function updateBoard(board) {
    board.update();
    
    // Re-render MathJax if available and ready
    if (typeof window !== 'undefined' && window.MathJax) {
        // Wait for MathJax to be ready before processing
        const processMathJax = () => {
            if (window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([board.containerObj]).catch((err) => {
                    console.warn('MathJax rendering error:', err);
                });
            }
        };
        
        // If MathJax is ready, process immediately
        if (window.MathJaxReady || (window.MathJax.startup && window.MathJax.startup.document.state() >= 8)) {
            processMathJax();
        } else {
            // Wait for MathJax to be ready
            if (window.MathJax.startup) {
                window.MathJax.startup.promise.then(processMathJax);
            } else {
                // Fallback: try again after a short delay
                setTimeout(processMathJax, 100);
            }
        }
    }
}

// Legacy compatibility export - deprecated, use updateBoard instead
export const updateBoardWithMathJax = updateBoard;
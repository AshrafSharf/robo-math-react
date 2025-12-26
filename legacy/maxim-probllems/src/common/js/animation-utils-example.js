/**
 * Example usage of AnimationUtils for vector animations
 */

// Import the animation utilities
import { AnimationUtils } from './animation-utils.js';
import { COLORS } from './common.js';

// In your render function:
export function render(diagramBoard, controlPanel, config) {
    // ... create your vectors and other elements ...
    
    // Method 1: Simple animation button with default settings
    const animController = AnimationUtils.createAnimationButton(
        controlPanel,
        (doneCallback) => {
            // Your animation logic here
            performAnimation(() => {
                // Animation complete
                doneCallback();
            });
        }
    );
    
    // Method 2: Customized animation button
    const customController = AnimationUtils.createAnimationButton(
        controlPanel,
        (doneCallback) => {
            // Your animation logic
            animateCustom(doneCallback);
        },
        {
            buttonText: 'Show Vector Addition',
            runningText: 'Animating...',
            sectionId: 'custom-animation',
            buttonStyle: 'width: 100%; font-size: 16px; padding: 8px;',
            normalColor: '#0080ff',
            runningColor: '#ff0000'
        }
    );
    
    // Method 3: Using the vector animation helpers
    function animateWithHelpers(doneCallback) {
        // Define your vector sequence
        const vectorSequence = [
            {
                start: [0, 0],
                end: [3, 2],
                color: COLORS.RED_DARK,
                arrowOptions: { strokeWidth: 3 }
            },
            {
                start: [3, 2],
                end: [5, 1],
                color: COLORS.GREEN_DARK,
                arrowOptions: { strokeWidth: 3 }
            }
        ];
        
        // Create animated elements
        const animatedElements = AnimationUtils.createVectorAnimation(
            diagramBoard,
            vectorSequence,
            { duration: 800, strokeWidth: 4 }
        );
        
        // Run the animation
        AnimationUtils.runVectorAnimation(animatedElements, () => {
            // Cleanup after delay
            setTimeout(() => {
                AnimationUtils.cleanupAnimation(diagramBoard, animatedElements);
                doneCallback();
            }, 500);
        });
    }
    
    // In your reset function:
    // animController.setAnimating(false);
}

// Example of manual animation (without helpers)
function performAnimation(callback) {
    // Create animated elements
    const animPoint = diagramBoard.create('point', [0, 0], {
        visible: false,
        fixed: true
    });
    
    const animVector = diagramBoard.create('arrow', [[0, 0], animPoint], {
        strokeColor: COLORS.RED_DARK,
        strokeWidth: 4
    });
    
    // Animate
    animPoint.moveTo([3, 2], 1000, {
        callback: function() {
            // Cleanup
            setTimeout(() => {
                diagramBoard.removeObject(animVector);
                diagramBoard.removeObject(animPoint);
                callback();
            }, 300);
        }
    });
}
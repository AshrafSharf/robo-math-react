import { GeomPrimitiveShape } from "./geom-primitive-shape.js";
import TeXToSVG from 'tex-to-svg';

export class LatexPrimitiveShape extends GeomPrimitiveShape {

    constructor(modelCoordinates, latexString, options = {}) {
        super(modelCoordinates);
        this.latexString = latexString;
        this.options = options;
        
        // Generate SVG from LaTeX for rendering - no options
        this.svgString = TeXToSVG(latexString);
        
        // No default styles - let caller specify everything
    }

    doCreate() {
        // Create group using SVG.js
        this.shapeGroup = this.layer.group();
        
        // Use SVG.js svg() method to directly insert the LaTeX SVG content
        this.shapeGroup.svg(this.svgString);
        
        // Set the group as the primitive shape for animation compatibility
        this.primitiveShape = this.shapeGroup;
        this.generatedSVGPath = this.shapeGroup;
        
        // Initially hide for animation (like other shapes)
        this.shapeGroup.hide();
        
        // Position the group
        this.generatePath();
        
        // Apply styles to all paths within the LaTeX content
        this.applyStylesToLatexContent();
    }
    
    applyStylesToLatexContent() {
        // Apply color to ALL elements - use * to catch everything
        const allElements = this.shapeGroup.node.querySelectorAll('*');
        for (let element of allElements) {
            element.setAttribute('fill', this.styleObj.fill);
            element.setAttribute('stroke', this.styleObj.fill);
        }
        
        // Apply font-size - this approach is working
        if (this.options.fontSize) {
            const fontSize = this.options.fontSize;
            this.shapeGroup.style('font-size', `${fontSize}px`);
        }
    }

    generatePath() {
        // Get view coordinates (same as other shapes)
        const x = this.graphsheet2d.toViewX(this.modelCoordinates[0]);
        const y = this.graphsheet2d.toViewY(this.modelCoordinates[1]);
        
        // Position the LaTeX group at (x, y)
        if (this.shapeGroup) {
            this.shapeGroup.move(x, y);
        }
    }

    getShapeType() {
        return 'latex';
    }

    setTweenSpeed(tweenablePath) {
        // LaTeX shapes appear instantly
        tweenablePath.setFast();
    }

    /**
     * Override renderWithAnimation for LaTeX shapes
     * LaTeX shapes are groups, not paths, so they can't use TweenablePath
     */
    renderWithAnimation(_penStartPoint, completionHandler) {
        try {
            // For LaTeX, just show instantly since it's not a path
            this.show();
            // Complete immediately
            if (completionHandler) {
                completionHandler();
            }
        } catch (error) {
            console.error('Error in LaTeX renderWithAnimation:', error);
            if (completionHandler) {
                completionHandler();
            }
        }
    }

    /**
     * Hide the shape (for animation system)
     */
    hide() {
        if (this.shapeGroup) {
            this.shapeGroup.hide();
        }
        return this;
    }

    /**
     * Show the shape (for animation system)
     */
    show() {
        if (this.shapeGroup) {
            this.shapeGroup.show();
        }
        return this;
    }

    /**
     * Get the default rotation point for LaTeX text
     * For text, this is typically the text position itself
     * @returns {Object} Position {x, y} in model coordinates
     */
    getRotationCenter() {
        return { 
            x: this.modelCoordinates[0], 
            y: this.modelCoordinates[1] 
        };
    }
    
    /**
     * Update the LaTeX content
     * @param {string} newLatexString - New LaTeX expression
     */
    updateLatex(newLatexString) {
        this.latexString = newLatexString;
        
        // Generate SVG for LaTeX rendering - no options
        this.svgString = TeXToSVG(newLatexString);
        
        if (this.shapeGroup) {
            // Clear existing content and add new
            this.shapeGroup.clear();
            this.shapeGroup.svg(this.svgString);
            this.applyStylesToLatexContent();
        }
        
        return this;
    }
    
    /**
     * Override stroke method to update LaTeX SVG paths
     */
    stroke(color) {
        // For LaTeX shapes, always override with our unified color approach
        this.applyStylesToLatexContent();
        
        return this;
    }
    
    /**
     * Override fill method to update LaTeX SVG paths
     */
    fill(color) {
        // Actually update the fill color
        this.styleObj.fill = color;
        this.applyStylesToLatexContent();
        
        return this;
    }
}
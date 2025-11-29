import { BaseEffect } from '../base-effect.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';

/**
 * TexToSVGShapeEffect handles animation and rendering of TeX-to-SVG shapes
 */
export class TexToSVGShapeEffect extends BaseEffect {
    constructor(mathScriptShape) {
        super();
        this.mathScriptShape = mathScriptShape;
    }

    toEndState() {
        this.mathScriptShape.show();
        this.mathScriptShape.enableStroke();
        this.mathScriptShape.renderEndState();
    }

    show() {
        this.mathScriptShape.show();
    }

    hide() {
        this.mathScriptShape.hide();
    }

    doPlay(playContext) {
        try {
            console.log('🎬 TexToSVGShapeEffect.doPlay() called');
            console.log('🎬 Shape type:', this.mathScriptShape.constructor.name);
            console.log('🎬 Shape has renderWithAnimation?', typeof this.mathScriptShape.renderWithAnimation);

            const localHandler = () => {
                console.log('🎬 TexToSVGShapeEffect animation complete');
                this.scheduleComplete();
                playContext.onComplete();
            };

            const startPoint = RoboEventManager.getLastVisitedPenPoint();
            console.log('🎬 Pen start point:', startPoint);

            this.mathScriptShape.show();
            console.log('🎬 Shape shown, calling renderWithAnimation...');

            if (typeof this.mathScriptShape.renderWithAnimation === 'function') {
                this.mathScriptShape.renderWithAnimation(startPoint, localHandler);
            } else {
                console.error('🎬 renderWithAnimation is not a function!');
                localHandler();
            }
        } catch (e) {
            console.error('🎬 ERROR in TexToSVGShapeEffect.doPlay():', e);
            this.scheduleComplete();
            playContext.onComplete(e);
        }
    }

}
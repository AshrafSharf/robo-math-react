import { BaseEffect } from '../base-effect.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';

/**
 * MathShapeEffect handles animation and rendering of geometric shapes (line, circle, etc.)
 */
export class MathShapeEffect extends BaseEffect {
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
            console.log('📐 MathShapeEffect.doPlay() called for', this.mathScriptShape.constructor.name);

            const localHandler = () => {
                console.log('📐 MathShapeEffect animation complete');
                this.scheduleComplete();
                playContext.onComplete();
            };

            const startPoint = RoboEventManager.getLastVisitedPenPoint();
            console.log('📐 Pen start point:', startPoint);

            this.mathScriptShape.show();
            console.log('📐 Calling renderWithAnimation...');
            this.mathScriptShape.renderWithAnimation(startPoint, localHandler);
        } catch (e) {
            console.error('📐 ERROR in MathShapeEffect.doPlay():', e);
            this.scheduleComplete();
            playContext.onComplete(e);
        }
    }

}

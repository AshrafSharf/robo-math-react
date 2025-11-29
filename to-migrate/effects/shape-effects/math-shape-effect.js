import { BaseEffect } from '../base-effect.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';

/**
 * MathShapeEffect handles animation and rendering of math shapes
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
            const localHandler = () => {
                this.scheduleComplete();
                playContext.onComplete();
            };

            const startPoint = RoboEventManager.getLastVisitedPenPoint();
            
            this.mathScriptShape.show();
            this.mathScriptShape.renderWithAnimation(startPoint, localHandler);
        } catch (e) {
            this.scheduleComplete();
            playContext.onComplete(e);
        }
    }

}
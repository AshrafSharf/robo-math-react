import { Bounds2 } from '../geom/Bounds2.js';
import { StyleMapper } from '../ui-models/style-mapper.js';
import { ComponentSlideLeftAnimator } from '../effects/enter-effects/component-slide-left-animator.js';
import { ComponentCenterExpandAnimator } from '../effects/enter-effects/component-center-expand-animator.js';
import { ComponentHeightAnimator } from '../effects/enter-effects/component-height-animator.js';
import { ComponentWidthAnimator } from '../effects/enter-effects/component-width-animator.js';
import { ComponentFadeInAnimator } from '../effects/enter-effects/component-fade-in-animator.js';
import { ComponentSlideBottomAnimator } from '../effects/enter-effects/component-slide-bottom-animator.js';
import { ComponentSlideTopAnimator } from '../effects/enter-effects/component-slide-top-animator.js';
import { ComponentSlideRightAnimator } from '../effects/enter-effects/component-slide-right-animator.js';
import { BackgroundDefinitions } from '../effects/background-definitions.js';
import $ from 'jquery';

export class MessageModel {

  // set internally
  messageDOM$;
  bounds;

  constructor(content, enterType = 'b', styleObj = {}) {
    this.content = content;
    this.enterType = enterType;
    this.styleObj = styleObj;
  }

  setMessageDOM(messageDOM) {
    this.messageDOM$ = $(messageDOM);
  }

  renderWithAnimation(completionHandler, duration) {
    this.show();
    this.enterAnimate(completionHandler, duration);
  }

  renderEndState() {
    this.show();
  }

  show() {
    let textDOM = $(`<div>${this.getProcessedContent()}</div>`);
    this.messageDOM$.html(textDOM.html());
    this.messageDOM$.css({
      left: this.bounds.left + 'px',
      top: this.bounds.top + 'px',
      width: this.bounds.width + 'px',
      height: this.bounds.height + 'px'
    })
    this.messageDOM$.css(this.styleObj)
    this.messageDOM$.show();
  }

  setStyle(newStyleObj) {
    newStyleObj = StyleMapper.getCSSPropStyle(newStyleObj);
    this.populateBackGroundStyle(newStyleObj);
    this.styleObj = Object.assign(this.styleObj, newStyleObj, {
      'letter-spacing': newStyleObj['letter-spacing'],
      'line-height': newStyleObj['line-height'] ? newStyleObj['line-height'] : 'inherit',
      'font-style': newStyleObj['font-style'] ? newStyleObj['font-style'] : 'inherit',
      'font-weight': newStyleObj['font-weight'] ? newStyleObj['font-weight'] : 'normal',
      'font-size': newStyleObj['font-size'] ? newStyleObj['font-size'] : '18px',
      'text-align': newStyleObj['text-align'] ? newStyleObj['text-align'] : 'center',
      'color': newStyleObj['color'] ? newStyleObj['color'] : 'maroon',
      'padding': '5px',
      'text-decoration': newStyleObj['text-decoration'] ? newStyleObj['text-decoration'] : 'none',
      'text-shadow': newStyleObj['text-shadow'] ? newStyleObj['text-shadow'] : 'none',
    })
  }

  populateBackGroundStyle(newStyleObj) {
    if (!newStyleObj['background-color'] || !newStyleObj['background-image']) { // if nothing is found, populate default values
      newStyleObj['background-image'] = BackgroundDefinitions.BG_DEFINITION_MAP['saint'];
      return;
    }
  }

  getProcessedContent() {
    // KatexProcessor.preprocesstMathString is not available, so return content as is
    // In the future, this should process LaTeX/KaTeX content
    return this.content;
  }

  hide() {

  }

  enterAnimate(completionHandler, duration) {
    let enterType = this.enterType ? this.enterType.toLowerCase() : 'l';

    let componentAnimator;
    let domAnimator;
    switch (enterType) {
      case 'l':
        componentAnimator = new ComponentSlideLeftAnimator();
        break;
      case 'r':
        componentAnimator = new ComponentSlideRightAnimator();
        break;
      case 't':
        componentAnimator = new ComponentSlideTopAnimator();
        break;
      case 'b':
        componentAnimator = new ComponentSlideBottomAnimator();
        break;
      case 'f':
        componentAnimator = new ComponentFadeInAnimator();
        break;
      case 'w':
        domAnimator = new ComponentWidthAnimator();
        break;
      case 'h':
        domAnimator = new ComponentHeightAnimator();
        break;
      case 'c':
        domAnimator = new ComponentCenterExpandAnimator();
        break;

    }

    if (componentAnimator) {
      componentAnimator.play(completionHandler, this.messageDOM$, this, duration);
      return;
    }

    if (domAnimator) {
      domAnimator.play(completionHandler, this.messageDOM$, duration);
      return;
    }

    completionHandler();

  }

  // Just to statisfy the animators (since it uses component based animators
  changeThoughExpression() {

  }

  get position() {
    return {
      x: this.bounds.left, y: this.bounds.top
    }
  }

  get size() {
    return {
      width: this.bounds.width, height: this.bounds.height
    }
  }


}
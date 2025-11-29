import { BaseEffect } from './base-effect.js';
import { MessageModel } from '../models/message.model.js';
import { PlayContext } from './play-context.js';
import { Bounds2 } from '../geom/Bounds2.js';

export class MessageEffect extends BaseEffect {

  constructor(messageModel, messageDOM$, position, size) {
    super();
    this.messageModel = messageModel;
    this.messageDOM$ = messageDOM$;
    this.position = position;
    this.size = size;
  }

  doPlay(playContext) {
    try {
      const localHandler = () => {
        this.onComplete();
      };
      this.updateDimensions();
      this.messageModel.setMessageDOM(this.messageDOM$);
      this.messageModel.renderWithAnimation(localHandler, playContext.durationInSeconds);
    } catch (e) {
      console.log(e);
      this.scheduleComplete(1500);
    }
  }

  toEndState() {
    this.updateDimensions();
    this.messageModel.setMessageDOM(this.messageDOM$);
    this.messageModel.renderEndState();
  }


  updateDimensions() {
    const position = this.position;
    const size = this.size;
    // Support both formats for position
    const left = position.left !== undefined ? position.left : position.x;
    const top = position.top !== undefined ? position.top : position.y;
    this.messageModel.bounds = Bounds2.rect(left, top, size.width, size.height);
  }

  show() {
    // Message effect shows itself when played
  }

  hide() {
    // Message effect hides by clearing DOM
    if (this.messageDOM$) {
      this.messageDOM$.innerHTML = '';
    }
  }
}
import { BaseEffect } from './base-effect.js';
import { MessageModel } from '../models/message.model.js';
import { PlayContext } from './play-context.js';
import { Bounds2 } from '../geom/Bounds2.js';

export class MessageEffect extends BaseEffect {

  constructor(messageModel, messageDOM$) {
    super();
    this.messageModel = messageModel;
    this.messageDOM$ = messageDOM$;
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
    // Get dimensions from the DOM element
    if (this.messageDOM$) {
      const rect = this.messageDOM$.getBoundingClientRect();
      this.messageModel.bounds = Bounds2.rect(0, 0, rect.width, rect.height);
    }
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
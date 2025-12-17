import { Point } from '../geom/Point.js';
import { PenEvent } from './pen-event.js';

/**
 * RoboEventManager - Event management system for pen-sequencer
 */
export class RoboEventManager {
  static listeners = new Map();
  static scaleFactor = 1;
  static lastVisitedPoint = new Point(0, 0);
  static lastVisitedTweenNode = null;
  static penActive = true;

  static register(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
    
    // Return a function which will unregister similar to RxJS subscription
    return () => {
      this.unregister(eventName, callback);
    };
  }

  static unregister(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  static emit(eventName, data) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  static firePenPosition(penEvent) {
    if (!this.penActive) return;
    this.lastVisitedPoint = penEvent.screenPoint;
    this.emit(PenEvent.POSITION_EVENT_NAME, penEvent);
  }

  static setPenActive(active) {
    this.penActive = active;
  }

  static isPenActive() {
    return this.penActive;
  }

  static getLastVisitedPenPoint() {
    return new Point(this.lastVisitedPoint.x, this.lastVisitedPoint.y);
  }

  static toUIWidth(modelWidth) {
    return modelWidth * 25;
  }

  static setScaleFactor(scaleFactor) {
    this.scaleFactor = scaleFactor;
  }

  static getScaleFactor() {
    return this.scaleFactor;
  }

  static getLastVisitedTween() {
    return this.lastVisitedTweenNode;
  }

  static setLastVisitedTween(lastVisitedTweenNode) {
    this.lastVisitedTweenNode = lastVisitedTweenNode;
    return this.lastVisitedTweenNode;
  }

  static clear(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  static hasListener(eventName) {
    return this.listeners.has(eventName) && this.listeners.get(eventName).length > 0;
  }
}
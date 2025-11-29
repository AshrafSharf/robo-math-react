import { TimelineMax } from 'gsap';
import { Point } from '../geom/Point.js';
import { RoboEventManager } from '../events/robo-event-manager.js';
import { PenEvent } from '../events/pen-event.js';

export class MathTimeLine {
  constructor(timeLineMax) {
    this.timeLineMax = timeLineMax;
  }

  getTimeLineMax() {
    return this.timeLineMax;
  }

  updatePenCoordinates(screenPoint) {
    RoboEventManager.firePenPosition(new PenEvent(screenPoint));
  }

  getPenOffsetRestPoint(x, y) {
    return new Point(x + 20, y + 20);
  }
}
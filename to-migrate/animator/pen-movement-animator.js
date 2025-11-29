import { Power2 } from 'gsap/all';
import { MathTimeLine } from './math-time-line.js';
import { Point } from '../geom/Point.js';
import { GeomUtil } from '../geom/GeomUtil.js';

export class PenMovementAnimator {
  addPenTween(startPoint, endPoint, mathTimeLine, preStartHandler, preCompletionHandler) {
    const clonedStart = startPoint.clone();
    const clonedEnd = endPoint.clone();
    const dist = Point.distance(startPoint, endPoint);
    let duration = this.timeByDistance(dist);
    try {
      const tweener = {};
      mathTimeLine.timeLineMax.fromTo(tweener, duration, {
        param: 0
      }, {
        param: 1,
        'ease': Power2.easeInOut,
        onUpdate: (updatingTweener) => {
          let svgPoint = Point.interpolate(clonedEnd, clonedStart, updatingTweener.param);
          mathTimeLine.updatePenCoordinates(svgPoint);
        },
        immediateRender: false,
        onUpdateParams: [tweener],
        onStart: () => {
          if (preStartHandler) {
            preStartHandler();
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  addPenTweenDynamicHandler(liveStartPoint, liveEndPoint, mathTimeLine, preStartHandler) {
    const dist = Point.distance(liveStartPoint(), liveEndPoint());
    let duration = this.timeByDistance(dist);
    try {
      const tweener = {};
      mathTimeLine.timeLineMax.fromTo(tweener, duration, {
        param: 0
      }, {
        param: 1,
        'ease': Power2.easeInOut,
        onUpdate: (updatingTweener) => {
          let svgPoint = Point.interpolate(liveEndPoint(), liveStartPoint(), updatingTweener.param);
          mathTimeLine.updatePenCoordinates(svgPoint);
        },
        immediateRender: false,
        onUpdateParams: [tweener],
        onStart: () => {
          if (preStartHandler) {
            preStartHandler();
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  timeByDistance(distance) {
    const minDistance = 50;
    const maxDistance = 1000;
    const minTime = 0.3;
    const maxTime = 2;
    return GeomUtil.map(distance, minDistance, maxDistance, minTime, maxTime);
  }
}
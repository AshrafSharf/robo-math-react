import { TweenMax } from 'gsap';

export class ComponentHeightAnimator {

  play(onCompletionHandler, componentDOM$, durationInSeconds) {
    try {
      TweenMax.set(componentDOM$, {
        opacity: '1',
        scaleY: 0,
        rotation: 0.01,
        transformOrigin: "50% 0%"
      });

      TweenMax.to(componentDOM$, durationInSeconds, {
        opacity: '1',
        scaleY: 1,
        rotation: 0.01,
        transformOrigin: "50% 0%",
        onComplete: () => {
          onCompletionHandler();
        }
      });
    }
    catch (e) {
      onCompletionHandler();
    }
  }

}
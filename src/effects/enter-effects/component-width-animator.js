import { TweenMax } from 'gsap';

export class ComponentWidthAnimator {

  play(onCompletionHandler, componentDOM$, durationInSeconds) {
    try {
      TweenMax.set(componentDOM$.parent(), {perspective: 1000});
      TweenMax.set(componentDOM$, {
        opacity: '0',
        scaleX: 0,
        rotation: 0.01,
        transformOrigin: "0% 50%",
        transformStyle: "preserve-3d"
      });

      TweenMax.to(componentDOM$, durationInSeconds, {
        opacity: '1',
        scaleX: 1,
        rotation: 0.01,
        transformOrigin: "0% 50%",
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
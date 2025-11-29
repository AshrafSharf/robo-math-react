import { TweenMax } from 'gsap/all';

export class ComponentFadeInAnimator {

  play(onCompletionHandler, componentDOM$, componentSubject, durationInSeconds) {
    const componentPosition = componentSubject.position;
    try {
      TweenMax.set(componentDOM$, {
        opacity: '0'
      });
      TweenMax.to(componentDOM$, durationInSeconds, {
        opacity: '1',
        onComplete: () => {
          componentSubject.changeThoughExpression({
            visible: true,
            opacity: 1
          });
          onCompletionHandler();
        }
      });
    }
    catch (e) {
      onCompletionHandler();
    }
  }
}
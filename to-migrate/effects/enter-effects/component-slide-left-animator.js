import { TweenMax } from 'gsap/all';

export class ComponentSlideLeftAnimator {

  play(onCompletionHandler, componentDOM$, componentSubject, durationInSeconds) {
    const componentPosition = componentSubject.position;
    const tweenInitialPosX = componentPosition.x - this.fromValue(componentSubject);

    try {
      TweenMax.set(componentDOM$, {
        opacity: '0',
        left: tweenInitialPosX,
      });
      TweenMax.to(componentDOM$, durationInSeconds, {
        opacity: '1',
        left: componentPosition.x,
        onComplete: () => {
          componentSubject.changeThoughExpression({
            visible: true,
            position: componentPosition,
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

  fromValue(basePlayableComponent) {
    return basePlayableComponent.size.width + basePlayableComponent.position.x + 500; // should be calculated bssed on current x and width
  }
}
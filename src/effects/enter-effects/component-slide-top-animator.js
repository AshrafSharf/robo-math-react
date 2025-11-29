import { TweenMax } from 'gsap';

export class ComponentSlideTopAnimator {

  play(onCompletionHandler, componentDOM$, componentSubject, durationInSeconds) {
    const componentPosition = componentSubject.position;
    const tweenInitialPosY = componentPosition.y - this.fromValue(componentSubject);

    try {
      TweenMax.set(componentDOM$, {
        opacity: '0',
        top: tweenInitialPosY,
      });
      TweenMax.to(componentDOM$, durationInSeconds, {
        opacity: '1',
        top: componentPosition.y,
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
    return basePlayableComponent.size.height + basePlayableComponent.position.y + 200; // should be calculated bssed on current x and width
  }


}
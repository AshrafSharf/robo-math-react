export class GraphEvaluator {

  eval(func, uiMin, uiMax, uiStep, xModelMin, xModelMax, uiToModelConverter) {
    // func is now a function callback instead of a string expression
    if (typeof func !== 'function') {
      throw new Error('GraphEvaluator.eval expects a function callback');
    }

    const lineValues = [];
    for (let x = uiMin; x <= uiMax; x += uiStep) {
      let x1 = uiToModelConverter(x);
      let y1 = func(x1);
      let x2 = uiToModelConverter(x + uiStep);
      let y2 = func(x2);
      if (isFinite(x1) && isFinite(y1) && isFinite(x2) && isFinite(y2)) {
        if (x1 >= xModelMin && x1 <= xModelMax && x2 >= xModelMin && x2 <= xModelMax) {
          lineValues.push(x1, y1, x2, y2);
        }
      }
    }
    return lineValues;
  }

  generatePoints(func, screenWidth, divisionCount = 8, plotDensity = 1, combineZoom = true) {
    // func is now a function callback instead of a string expression
    if (typeof func !== 'function') {
      throw new Error('GraphEvaluator.generatePoints expects a function callback');
    }
    
    const modifierZoom = 8;
    let modifierZoomX = 1;
    let modifierZoomY = 1;
    
    // The function can now access additional parameters through closure
    const newFunc = function (x) {
      try {
        // Call the provided function with x and optional context
        return func(x, {
          t: Date.now(),
          r: Math.random()
        });
      } catch (e) {
        return NaN;
      }
    };

    const pointValues = [];

    const pixelMid = screenWidth / 2;
    const spacePerDivision = screenWidth / divisionCount;
    void (combineZoom && ((modifierZoomX = modifierZoom) && (modifierZoomY = modifierZoom)));
    const baseScaleX = 1 / (screenWidth / 2);
    const baseScaleY = screenWidth / 2;
    const scaleX = baseScaleX * modifierZoomX;
    const scaleY = baseScaleY * 1 / modifierZoomY;
    const secantBoundOffset = plotDensity * 10;

    for (let k = -pixelMid; k <= pixelMid + plotDensity; k = k + plotDensity) { //From left to right on x axis
      let x1 = k + pixelMid;
      let y1 = (-newFunc(k * scaleX) * scaleY) + pixelMid; //Evaluate point
      let x2 = (k - plotDensity) + pixelMid;
      let y2 = (-newFunc(((k - plotDensity) * scaleX) * scaleY)) + pixelMid; //Evaluate second secant point
      if (
        x1 > (0 - secantBoundOffset) &&
        x1 <= (screenWidth + secantBoundOffset) &&
        x2 > (0 - secantBoundOffset) &&
        x2 <= (screenWidth + secantBoundOffset) &&
        y1 > (0 - secantBoundOffset) &&
        y1 <= (screenWidth + secantBoundOffset) &&
        y2 > (0 - secantBoundOffset) &&
        y2 <= (screenWidth + secantBoundOffset)
      ) {

        pointValues.push(x1);
        pointValues.push(y1);
        pointValues.push(x2);
        pointValues.push(y2);
      }
    }

    return pointValues;
  }
}
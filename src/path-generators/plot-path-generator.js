import * as d3 from 'd3';

export class PlotPathGenerator {
  generate(coordinates, uiWidth, uiHeight) {
    const path = d3.path();
    
    for (let i = 0; i < coordinates.length - 3; i += 4) {
      if (coordinates[i] >= 0 && coordinates[i] <= uiWidth && 
          coordinates[i + 1] >= 0 && coordinates[i + 1] <= uiWidth) {
        if (coordinates[i + 2] >= 0 && coordinates[i + 2] <= uiHeight && 
            coordinates[i + 3] >= 0 && coordinates[i + 3] <= uiHeight) {
          path.moveTo(coordinates[i], coordinates[i + 1]);
          path.lineTo(coordinates[i + 2], coordinates[i + 3]);
        }
      }
    }
    
    const pathString = path.toString();
    return pathString;
  }
}
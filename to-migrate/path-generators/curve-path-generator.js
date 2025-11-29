import * as d3 from 'd3';

export class CurvePathGenerator {
  generate(input, curveType = "catmull") {
    const pending = input.length % 2;
    const coordinates = input.slice(0, input.length - pending);
    const points = [];
    
    for (let i = 0; i < coordinates.length - 1; i += 2) {
      points.push([coordinates[i], coordinates[i + 1]]);
    }
    
    let lineGenerator;
    
    switch (curveType) {
      case 'linear':
        lineGenerator = d3.line().curve(d3.curveLinear);
        break;
      case 'step':
        lineGenerator = d3.line().curve(d3.curveStep);
        break;
      case 'step-before':
        lineGenerator = d3.line().curve(d3.curveStepBefore);
        break;
      case 'step-after':
        lineGenerator = d3.line().curve(d3.curveStepAfter);
        break;
      case 'basis':
        lineGenerator = d3.line().curve(d3.curveBasis);
        break;
      case 'cardinal':
        lineGenerator = d3.line().curve(d3.curveCardinal);
        break;
      case 'monotone':
        lineGenerator = d3.line().curve(d3.curveMonotoneX);
        break;
      case 'catmull':
        lineGenerator = d3.line().curve(d3.curveCatmullRom);
        break;
      default:
        lineGenerator = d3.line().curve(d3.curveBasis);
    }
    
    const pathString = lineGenerator(points);
    return pathString;
  }
}
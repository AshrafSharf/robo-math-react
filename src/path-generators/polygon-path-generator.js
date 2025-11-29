import * as d3 from 'd3';

export class PolygonPathGenerator {
  generate(input) {
    const pending = input.length % 2;
    const coordinates = input.slice(0, input.length - pending);
    const data = [];
    
    for (let i = 0; i < coordinates.length - 1; i += 2) {
      data.push([coordinates[i], coordinates[i + 1]]);
    }
    
    const lineGenerator = d3.line();
    const pathString = lineGenerator(data);
    return pathString;
  }
}
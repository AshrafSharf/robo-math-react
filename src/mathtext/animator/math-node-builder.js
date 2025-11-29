import { MathAnimateNodeFactory } from './math-animate-node-factory.js';
import { MathNodeGraph } from './math-node-graph.js';
import { NodePathAssigner } from './node-path-assigner.js';
import cheerio from 'cheerio-standalone';

export class MathNodeBuilder {
  constructor(inputSVG) {
    this.inputSVG = inputSVG;
    this.outputSVG = null;
    this.rootMathGrapNode = null;
  }

  process(parentId, strokeColor) {
    const cheerio$ = cheerio.load(this.inputSVG);
    const svgNode$ = cheerio$('svg');
    this.rootMathGrapNode = new MathNodeGraph(parentId, "root", svgNode$, MathAnimateNodeFactory, strokeColor);
    
    const rootG = svgNode$.children()[0];
    cheerio$(rootG).children().each((i, element) => {
      if (cheerio(element).attr('meta')) {
        const elementId = `${parentId}-${i}`;
        const mathGraphNode = MathAnimateNodeFactory.getAnimatorNode(elementId, cheerio(element), strokeColor);
        this.rootMathGrapNode.addChild(mathGraphNode);
        mathGraphNode.process(elementId, strokeColor);
      }
    });

    this.rootMathGrapNode.reOrder();
    this.assignNodePathValues();
    this.outputSVG = cheerio$.root().html();
    return this.outputSVG;
  }

  assignNodePathValues() {
    const nodePathAssigner = new NodePathAssigner();
    this.rootMathGrapNode.nodePath = "root";
    nodePathAssigner.incrementDepth();
    
    this.rootMathGrapNode.children.forEach((mathGraphNode) => {
      nodePathAssigner.incrementPath();
      mathGraphNode.nodePath = nodePathAssigner.getPathAsString();
      mathGraphNode.assignNodePath(nodePathAssigner);
    });
    
    nodePathAssigner.decrementDepth();
  }
}
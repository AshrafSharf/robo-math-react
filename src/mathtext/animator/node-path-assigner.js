export class NodePathAssigner {
  constructor() {
    this.pathArray = [];
    this.pathArray.push(1);
  }

  incrementDepth() {
    this.pathArray.push(0);
  }

  decrementDepth() {
    this.pathArray.pop();
  }

  getPathAsString() {
    return this.pathArray.join(".");
  }

  incrementPath() {
    this.pathArray[this.pathArray.length - 1]++;
  }
}
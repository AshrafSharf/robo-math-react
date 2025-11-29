export class NodeRenderOrderHeurestics {

  static reOrder(mathNodeGroup) {
    if (this.isDivision(mathNodeGroup)) {
      this.applyDivisionOrder(mathNodeGroup);
      return;
    }
  }

  static isDivision(mathNodeGroup) {
    if (mathNodeGroup.children.length == 3) {
      if (mathNodeGroup.children[0].type == 'rect') {
        return true;
      }
    }
    return false;
  }

  static applyDivisionOrder(mathNodeGroup) {
    const currentChildren = mathNodeGroup.children;
    mathNodeGroup.children = [];
    mathNodeGroup.children[0] = currentChildren[1];
    mathNodeGroup.children[1] = currentChildren[0];
    mathNodeGroup.children[2] = currentChildren[2];
  }
}
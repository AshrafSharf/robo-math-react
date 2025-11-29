export class SelectionUnit {
  constructor() {
    this.fragmentPaths = [];
  }

  toFragmentPaths() {
    return this.fragmentPaths;
  }

  static fromFragmentPaths(fragmentPaths) {
    const unit = new SelectionUnit();
    unit.fragmentPaths = fragmentPaths;
    return unit;
  }

  addFragment(fragmentId) {
    if (fragmentId == 'root') {
      return;
    }
    this.fragmentPaths.push(fragmentId);
  }

  containsFragment(fragmentId) {
    if (fragmentId == 'root') {
      return false;
    }
    return this.fragmentPaths.includes(fragmentId);
  }

  hasFragment() {
    return this.fragmentPaths.length > 0;
  }
}
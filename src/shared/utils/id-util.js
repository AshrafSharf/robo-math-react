export class IdUtil {
  static counter = 0;

  static getID() {
    this.counter++;
    return `${this.counter}`;
  }

  static generateID(prefix = 'id') {
    this.counter++;
    return `${prefix}_${this.counter}`;
  }
}
export class IdUtil {
  static counter = 0;

  static getID() {
    this.counter++;
    return `id_${Date.now()}_${this.counter}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateID(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
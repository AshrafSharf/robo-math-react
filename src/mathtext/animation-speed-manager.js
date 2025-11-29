/**
 * AnimationSpeedManager - Singleton class to manage global animation speed
 * Controls the speed multiplier for all writing animations
 */
export class AnimationSpeedManager {
  static instance = null;

  constructor() {
    if (AnimationSpeedManager.instance) {
      return AnimationSpeedManager.instance;
    }

    this.speedMultiplier = 1.0; // Default speed (1x)
    AnimationSpeedManager.instance = this;
  }

  /**
   * Get the singleton instance
   * @returns {AnimationSpeedManager}
   */
  static getInstance() {
    if (!AnimationSpeedManager.instance) {
      new AnimationSpeedManager();
    }
    return AnimationSpeedManager.instance;
  }

  /**
   * Get the current speed multiplier
   * Higher values = faster animation (shorter duration)
   * @returns {number}
   */
  static getSpeedMultiplier() {
    return AnimationSpeedManager.getInstance().speedMultiplier;
  }

  /**
   * Set the speed multiplier
   * @param {number} multiplier - Speed multiplier (0.1 to 3.0)
   *   - < 1.0: Slower than normal
   *   - 1.0: Normal speed
   *   - > 1.0: Faster than normal
   */
  static setSpeedMultiplier(multiplier) {
    const instance = AnimationSpeedManager.getInstance();
    instance.speedMultiplier = Math.max(0.1, Math.min(3.0, multiplier));
    console.log(`Animation speed set to ${instance.speedMultiplier.toFixed(1)}x`);
  }

  /**
   * Reset to default speed (1x)
   */
  static reset() {
    AnimationSpeedManager.getInstance().speedMultiplier = 1.0;
  }
}

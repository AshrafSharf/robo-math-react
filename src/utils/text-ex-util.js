import calculateTextSize from 'calculate-size';

export class TextExUtil {
  static mobileMode = false;

  static getTextSizeInEx(fontSize) {
    if (this.mobileMode) {
      return this.mobileModeConversion(fontSize);
    }
    return this.desktopModeConversion(fontSize);
  }

  static setMobileModel(mobileMode) {
    this.mobileMode = mobileMode;
  }

  static desktopModeConversion(fontSize) {
    const pixelSize = parseInt(fontSize);

    // Smoother mapping for common font sizes
    if (pixelSize <= 12) return '70';
    if (pixelSize <= 16) return '75';
    if (pixelSize <= 20) return '80';
    if (pixelSize <= 24) return '85';
    if (pixelSize <= 32) return '90';
    if (pixelSize <= 48) return '95';
    return '100';  // Large sizes
  }

  static mobileModeConversion(fontSize) {
    const pixelSize = parseInt(fontSize);

    // Slightly thinner strokes for mobile
    if (pixelSize <= 12) return '60';
    if (pixelSize <= 16) return '65';
    if (pixelSize <= 20) return '70';
    if (pixelSize <= 24) return '75';
    if (pixelSize <= 32) return '80';
    if (pixelSize <= 48) return '85';
    return '90';
  }
}
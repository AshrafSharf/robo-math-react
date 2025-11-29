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

    if (pixelSize < 20) {
      return `80`;  // Direct pixel value
    }

    if (pixelSize < 30) {
      return `85`;  // Direct pixel value
    }
    
    // For larger sizes, scale appropriately
    return `90`;  // Direct pixel value for larger fonts
  }

  static mobileModeConversion(fontSize) {
    const pixelSize = parseInt(fontSize);

    if (pixelSize < 20) {
      return `70`;  // Direct pixel value for mobile
    }

    if (pixelSize < 30) {
      return `75`;  // Direct pixel value for mobile
    }
    
    // For larger sizes on mobile
    return `80`;  // Direct pixel value
  }
}
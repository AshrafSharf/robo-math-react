/**
 * Created by MohammedAzeem on 3/19/14.
 */
module robo.util {
    import PMath = robo.util.PMath;
    import ColorUtils = away.utils.ColorUtils;

    export class ColorConstants {
        public static red:number = 0xFF0000;
        public static orange:number = 0xFF8C00;
        public static white:number = 0xFFDEAD;
        public static wheat:number = 0xF5DEB3;
        public static orangered:number = 0xFF4500;
        public static green:number = 0x556B2F;
        public static blue:number = 0x5F9EA0;

        private static highlightColorMapper:number[];

        private static  initializeColorMapper() {
            if (ColorConstants.highlightColorMapper != null) {
                return;
            }

            ColorConstants.highlightColorMapper = [];

            ColorConstants.highlightColorMapper["0x990099"] = 0xFB00FB;
            ColorConstants.highlightColorMapper["0x109618"] = 0x1CFF1C;
            ColorConstants.highlightColorMapper["0xFF9900"] = 0xDB9834;
            ColorConstants.highlightColorMapper["0xDC3912"] = 0xFF0000;
            ColorConstants.highlightColorMapper["0x3366CC"] = 0x548DFF;
            ColorConstants.highlightColorMapper["0x000000"] = 0x7F7F7F;
            ColorConstants.highlightColorMapper["0xDD4477"] = 0xFF6399;
            ColorConstants.highlightColorMapper["0x0099C6"] = 0xC7FF;
            ColorConstants.highlightColorMapper["0x6633CC"] = 0x9A6BFF;
            ColorConstants.highlightColorMapper["0xFF4DFF"] = 0;
        }

        public static brightenColor(currentColor:number, alpha:number):number {
            var colorParts:number[] = ColorUtils.float32ColorToARGB(currentColor);

            var a:number = alpha;
            var r:number = colorParts[1];
            var g:number = colorParts[2];
            var b:number = colorParts[3];

            var newColor = 0;
            newColor |= (a & 255) << 24;
            newColor |= (r & 255) << 16;
            newColor |= (g & 255) << 8;
            newColor |= (b & 255);

            return newColor;
        }


        public static getHighlightColor(colorValue:number):number {
            ColorConstants.initializeColorMapper();

            var highlightColor:number = ColorConstants.highlightColorMapper[colorValue];

            return highlightColor;
        }


        ////////////////////ccopied from MathDIsk////////////////////////////////////////////////


        private static FACTOR:number = 0.7;

        /**
         * Returns a color value with the given red, green, blue, and alpha
         * components
         * @param r the red component (0-255)
         * @param g the green component (0-255)
         * @param b the blue component (0-255)
         * @param a the alpha component (0-255, 255 by default)
         * @return the color value
         *
         */
        public static  rgba(r:number, g:number, b:number, a:number = 255):number {
            return ((a & 0xFF) << 24) | ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
        }

        /**
         * Returns a color value by updating the alpha component of another color value.
         * @param c a color value
         * @param a the desired alpha component (0-255)
         * @return a color value with adjusted alpha component
         */
        public static  setAlpha(c:number, a:number):number {
            return ((a & 0xFF) << 24) | (c & 0x00FFFFFF);
        }

        /**
         * Returns the alpha component of a color value
         * @param c the color value
         * @return the alpha component
         */
        public static  getAlpha(c:number):number {
            return (c >> 24) & 0xFF;
        }


        public static  getRed(rgb:number):number {
            return ((rgb >> 16) & 0xFF);
        }

        public static  getGreen(rgb:number):number {
            return ((rgb >> 8) & 0xFF);
        }

        public static  getBlue(rgb:number):number {
            return (rgb & 0xFF);
        }

        /**
         * Combines the red, green, and blue color components numbero one 24 bit number.
         */
        public static  combine(r:number, g:number, b:number):number {
            return (Math.min(Math.max(0, r), 255) << 16) |
                (Math.min(Math.max(0, g), 255) << 8) |
                Math.min(Math.max(0, b), 255);
        }

        /**
         * Combines the color value and the alpha value numbero a 32 bit number like #AARRGGBB.
         */
        public static  combineColorAndAlpha(color:number, alpha:number):number {
            // make sure the alpha is a valid number [0-1]
            if (isNaN(alpha)) {
                alpha = 1;
            } else {
                alpha = Math.max(0, Math.min(1, alpha));
            }

            // convert the [0-1] alpha value numbero [0-255]
            var alphaColor:number = alpha * 255;
            // bitshift it to come before the color
            alphaColor = alphaColor << 24;
            // combine the two values: #AARRGGBB
            var combined:number = alphaColor | color;
            return combined;
        }

        /**
         * Returns the average of the two colors.  Doesn't look at alpha values. */
        public static  average(c1:number, c2:number):number {
            var r:number = (ColorConstants.getRed(c1) + ColorConstants.getRed(c2)) / 2;
            var g:number = (ColorConstants.getGreen(c1) + ColorConstants.getGreen(c2)) / 2;
            var b:number = (ColorConstants.getBlue(c1) + ColorConstants.getBlue(c2)) / 2;
            return ColorConstants.combine(r, g, b);
        }

        // copied from java
        public static  brighter(rgb:number):number {

            if(rgb==0xFF9900)
                return ColorConstants.darker(rgb);

            var r:number = ColorConstants.getRed(rgb);
            var g:number = ColorConstants.getGreen(rgb);
            var b:number = ColorConstants.getBlue(rgb);

            /*
             * 1. black.brighter() should return grey
             * 2. applying brighter to blue will always return blue, brighter
             * 3. non pure color (non zero rgb) will eventually return white
             */
            var i:number = 1.0 / (1.0 - ColorConstants.FACTOR);
            if (r == 0 && g == 0 && b == 0) {
                return ColorConstants.combine(i, i, i);
            }
            if (r > 0 && r < i) {
                r = i;
            }
            if (g > 0 && g < i) {
                g = i;
            }
            if (b > 0 && b < i) {
                b = i;
            }
            var newRGB:number = ColorConstants.combine(r / ColorConstants.FACTOR, g / ColorConstants.FACTOR, b / ColorConstants.FACTOR);
            return newRGB;
        }

        // copied from Java
        public static  darker(rgb:number):number {
            var r:number = ColorConstants.getRed(rgb) * ColorConstants.FACTOR;
            var g:number = ColorConstants.getGreen(rgb) * ColorConstants.FACTOR;
            var b:number = ColorConstants.getBlue(rgb) * ColorConstants.FACTOR;
            var newRGB:number = ColorConstants.combine(r, g, b);
            return newRGB;
        }

        public static  invert(rgb:number):number {

            if(rgb==0x000000)
            {
                return 0x10E8CE;
            }
            var r:number = ColorConstants.getRed(rgb);
            var g:number = ColorConstants.getGreen(rgb);
            var b:number = ColorConstants.getBlue(rgb);
            var newRGB:number = ColorConstants.combine(255 - r, 255 - g, 255 - b);
            return newRGB;
        }

        /**
         * See mx.utils.ColorUtil.adjustBrightness2
         */
        public static  brightness(rgb:number, brite:number):number {
            return ColorConstants.brightenColor(rgb, brite);
        }

        /**
         * Returns either black or white depending on the bgColor to ensure
         * that the text will contrast on the background color.
         */
        public static  getTextColor(bgColor:number):number {
            var textColor:number = 0;        // black
            var r:number = ColorConstants.getRed(bgColor);
            var g:number = ColorConstants.getGreen(bgColor);
            var b:number = ColorConstants.getBlue(bgColor);
            var rgb:number = r + g + b;
            if (rgb < 400) {
                textColor = 0xffffff;    // white
            }
            return textColor;
        }
    }
}
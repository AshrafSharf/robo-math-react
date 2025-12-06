/**
 * Created by Mathdisk on 3/15/14.
 */
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.util {


    export class StyleConfig {

        public static POINT_STYLE: string = 'sphere' // The other value as of now is cross
        public static LINE_THICKNESS: number = 1

        /**
         * When loading the workSheet reset must be called
         */
        public static reset(): void {
            StyleConfig.POINT_STYLE = 'sphere'
            StyleConfig.LINE_THICKNESS = 1;
        }

        public static setPointStyle(str) {
            if (str == 'cross') {
                StyleConfig.POINT_STYLE = str;
            } else {
                StyleConfig.POINT_STYLE = 'sphere'
            }
        }
    }

}

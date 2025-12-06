/**
 * Created by Mathdisk on 3/23/14.
 */



///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {


    import GraphSheet3D = robo.geom.GraphSheet3D;

    export class ExpressionContext {
        private references: any = {};
        private graphSheet3D: GraphSheet3D;

        constructor(graphSheet3D: GraphSheet3D) {
            this.graphSheet3D = graphSheet3D;

        }

        public addReference(key: any, value: any): void {
            this.references[key] = value;
        }

        public hasReference(key: any): boolean {
            var retVal: any = this.references[key];

            if (retVal) {
                return true;
            }

            return false;
        }

        public getReference(key: any): any {
            return this.references[key];

        }

        public getGraphSheet3D(): GraphSheet3D {
            return this.graphSheet3D;
        }


        public getReferencesCopy(): any {
            var copyRefrences: any = {};
            for (var key in this.references) {
                var retVal: any = this.references[key];
                copyRefrences[key] = retVal;
            }
            return copyRefrences;
        }

        public getReferencesCopyAsPrimivitiveValues(): any {
            var copyRefrences: any = {};
            for (var key in this.references) {
                var retVal: any = this.references[key];
                if (retVal['value']) {
                    copyRefrences[key] = retVal['value']; // Numeric Expression values
                }
                if(retVal['quotedComment']) {
                    copyRefrences[key] = retVal['quotedComment']; // Numeric Expression values
                }

            }
            return copyRefrences;
        }

    }


}
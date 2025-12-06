/**
 * Created by Mathdisk on 3/18/14.
 */

// This class defines a module name robosys.lang but it is placed under robo.util package ... this is ok
// as Typescript doesnt care about the actual file folder



var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

(function (robo) {

    (function (polyclipping) {
        var ExPolygons = (function (_super) {
            __extends(ExPolygons, _super);
            function ExPolygons() {  // due to  funtion hoisting this statement autmatically gets definied first
                _super.apply(this, arguments);
            }

            ExPolygons.prototype.addExPolygon = function (exPolygon) {
                this.push(exPolygon);
            };

            return ExPolygons;

        })(Array); //extend the native array

        polyclipping.ExPolygons = ExPolygons;

    })(robo.polyclipping || (robo.polyclipping = {}));

})(robo);


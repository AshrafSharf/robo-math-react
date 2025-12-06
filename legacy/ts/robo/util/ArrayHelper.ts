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
var robosys;
(function (robosys) {
    (function (lang) {

        var ArrayHelper = (function (_super) {
            __extends(ArrayHelper, _super);
            function ArrayHelper() {  // due to  funtion hoisting this statement autmatically gets definied first
                _super.apply(this, arguments);
            }
            ArrayHelper.prototype.removeAll = function () {
                this.splice(0);
            };

            ArrayHelper.prototype.addItem = function (object) {
                this.push(object);
            };

            ArrayHelper.prototype.removeItem = function (object) {
                if (!this.contains(object))
                    return;

                var index = this.getItemIndex(object);
                this.removeItemAt(index);
            };

            ArrayHelper.prototype.contains = function (object) {
                var index;
                index = this.indexOf(object);
                return index != -1 ? true : false;
            };

            ArrayHelper.prototype.addAll = function (object) {
                if (object.length == 0) {
                    for (var key in object) {
                        this[key] = object[key];
                    }
                    return;
                }

                for (var i = 0; i < object.length; i++) {
                    this.push(object[i]);
                }
            };

            ArrayHelper.prototype.addItemAt = function (item, index) {
                this.splice(index, 0, item);
            };

            ArrayHelper.prototype.removeItemAt = function (index) {
                this.splice(index, 1);
            };

            ArrayHelper.prototype.getItemAt = function (index) {
                return this[index];
            };

            ArrayHelper.prototype.getItemIndex = function (object) {
                return this.indexOf(object);
            };

            ArrayHelper.prototype.setItemAt = function (object, index) {
                this[index] = object;
            };

            ArrayHelper.prototype.add = function (object) {
                this.addItem(object);
            };

            ArrayHelper.prototype.remove = function (object) {
                this.removeItem(object);
            };

            ArrayHelper.prototype.addAt = function (item, index) {
                this.addItemAt(item, index);
            };

            ArrayHelper.prototype.removeAt = function (index) {
                this.removeItemAt(index);
            };
            return ArrayHelper;

        })(Array); //extend the native array
        lang.ArrayHelper = ArrayHelper;
    })(robosys.lang || (robosys.lang = {}));
    var lang = robosys.lang;
})(robosys||(robosys = {}));


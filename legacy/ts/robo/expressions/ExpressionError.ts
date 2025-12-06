/**
 * Created by Mathdisk on 3/18/14.
 */


var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};


var roboexpressions;
(function (roboexpressions) {

    var ExpressionError = (function (_super) {

        __extends(ExpressionError, _super);

        function ExpressionError(expressionId,expressionType,message) {

            this.expressionType = expressionType;
            this.expressionId = expressionId;
            this.message = message;

            _super.apply(this,[message]);
        }

        return ExpressionError;

    })(Error);


    roboexpressions.ExpressionError = ExpressionError;
})(roboexpressions || (roboexpressions = {}));







var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};



var ClipperException = (function (_super) {

        __extends(ClipperException, _super);

        function ClipperException(message) {


            this.message = message;

            _super.apply(this,[message]);
        }



        return ClipperException;



    })(Error);









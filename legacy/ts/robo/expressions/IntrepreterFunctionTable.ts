/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import ExpressionIntrepreter = robo.expressions.ExpressionIntrepreter;
    import MultiplicationExpression = robo.expressions.MultiplicationExpression;
    import AdditionExpression = robo.expressions.AdditionExpression;
    import SubtractionExpression = robo.expressions.SubtractionExpression;
    import DivisionExpression = robo.expressions.DivisionExpression;
    import VariableReferenceExpression = robo.expressions.VariableReferenceExpression;
    import NumericExpression = robo.expressions.NumericExpression;
    import PointExpression = robo.expressions.PointExpression;
    import LineExpression = robo.expressions.LineExpression;
    import ArcExpression = robo.expressions.ArcExpression;
    import PerpExpression = robo.expressions.PerpExpression;
    import ParallelExpression = robo.expressions.ParallelExpression;
    import AngleExpression = robo.expressions.AngleExpression;
    import FindAngleExpression = robo.expressions.FindAngleExpression;
    import QuotedStringExpression = robo.expressions.QuotedStringExpression;
    import ProjectExpression = robo.expressions.ProjectExpression;
    import ReflectExpression = robo.expressions.ReflectExpression;
    import RotateExpression = robo.expressions.RotateExpression;
    import TraceExpression = robo.expressions.TraceExpression;
    import InterpolateExpression = robo.expressions.InterpolateExpression;
    import PositionExpression = robo.expressions.PositionExpression;
    import RepeatExpression = robo.expressions.RepeatExpression;
    import PartExpression = robo.expressions.PartExpression;
    import FadeExpression = robo.expressions.FadeExpression;

    import PointTypeExpression = robo.expressions.PointTypeExpression;
    import DashLineExpression = robo.expressions.DashLineExpression;
    import StrokeExpression = robo.expressions.StrokeExpression;

    export class IntrepreterFunctionTable {
        constructor() {
        }

        static defineMathFunction(functionName: string) {
            ExpressionIntrepreter.expTable[functionName] = function (e) {
                var args = e.args;
                var mathTrigFunctionExpression: MathTrigFunctionExpression = new MathTrigFunctionExpression(functionName, args);
                return mathTrigFunctionExpression;
            };
        }

        public static populateFunctionTable(): void {
            ExpressionIntrepreter.expTable['*'] = function (e) {

                var args = e.args;
                var lhs: IBaseExpression = <IBaseExpression>args[0];
                var rhs: IBaseExpression = <IBaseExpression>args[1];

                var multiplicationExpression: MultiplicationExpression = new MultiplicationExpression(lhs, rhs);
                return multiplicationExpression;
            };

            ExpressionIntrepreter.expTable["/"] = function (e) {

                var args = e.args;
                var lhs: IBaseExpression = <IBaseExpression>args[0];
                var rhs: IBaseExpression = <IBaseExpression>args[1];

                var divisionExpression: DivisionExpression = new DivisionExpression(lhs, rhs);
                return divisionExpression;
            };


            ExpressionIntrepreter.expTable["+"] = function (e) {

                var args = e.args;
                var lhs: IBaseExpression = <IBaseExpression>args[0];
                var rhs: IBaseExpression = <IBaseExpression>args[1];

                var additionExpression: AdditionExpression = new AdditionExpression(lhs, rhs);
                return additionExpression;
            };

            ExpressionIntrepreter.expTable["-"] = function (e) {

                var args = e.args;
                var lhs: IBaseExpression = <IBaseExpression>args[0];
                var rhs: IBaseExpression = <IBaseExpression>args[1];

                var subtractionExpression: SubtractionExpression = new SubtractionExpression(lhs, rhs);
                return subtractionExpression;
            };


            ExpressionIntrepreter.expTable["^"] = function (e) {

                var args = e.args;
                var lhs: IBaseExpression = <IBaseExpression>args[0];
                var rhs: IBaseExpression = <IBaseExpression>args[1];

                var powerExpression: PowerExpression = new PowerExpression(lhs, rhs);
                return powerExpression;
            };


            ExpressionIntrepreter.expTable["assignment"] = function (e) {

                var args = e.args;
                var lhs: IBaseExpression = <IBaseExpression>args[0];
                var rhs: IBaseExpression = <IBaseExpression>args[1];

                var assignmentExpression: AssignmentExpression = new AssignmentExpression(lhs, rhs);
                return assignmentExpression;
            };

            ExpressionIntrepreter.expTable["string"] = function (e) {

                var variableName = <string>e.args[0];
                return new VariableReferenceExpression(variableName);
            };

            ExpressionIntrepreter.expTable["quotedstring"] = function (e) {

                var quotedComment = <string>e.args[0];
                return new QuotedStringExpression(quotedComment);
            };


            ExpressionIntrepreter.expTable["numeric"] = function (e) {

                var args = e.args;
                var value = args[0];

                return new NumericExpression(value);
            };

            ExpressionIntrepreter.expTable["line"] = function (e) {

                var args = e.args;
                var lineExpression: LineExpression = new LineExpression(args); // This could be array of 2 point expression or 4 variable or numeric expressions..
                return lineExpression;
            };

            ExpressionIntrepreter.expTable["point"] = function (e) {
                var args = e.args;
                var pointExpression: PointExpression = new PointExpression(args); // This could be array of 2 point expression or 4 variable or numeric expressions..
                return pointExpression;
            };


            ExpressionIntrepreter.expTable["arc"] = function (e) {

                var args = e.args;
                var arcExpression: ArcExpression = new ArcExpression(args);
                return arcExpression;
            };


            ExpressionIntrepreter.expTable["perp"] = function (e) {

                var args = e.args;
                var perpExpression: PerpExpression = new PerpExpression(args);
                return perpExpression;
            };

            ExpressionIntrepreter.expTable["parallel"] = function (e) {

                var args = e.args;
                var parallelExpression: ParallelExpression = new ParallelExpression(args);
                return parallelExpression;
            };

            ExpressionIntrepreter.expTable["angle"] = function (e) {

                var args = e.args;
                var parallelExpression: AngleExpression = new AngleExpression(args);
                return parallelExpression;
            };

            ExpressionIntrepreter.expTable["mid"] = function (e) {

                var args = e.args;
                var midPointExpression: MidPointExpression = new MidPointExpression(args);
                return midPointExpression;
            };


            ExpressionIntrepreter.expTable["start"] = function (e) {

                var args = e.args;
                var startPointExpression: StartPointExpression = new StartPointExpression(args);
                return startPointExpression;
            };


            ExpressionIntrepreter.expTable["end"] = function (e) {

                var args = e.args;
                var endPointExpression: EndPointExpression = new EndPointExpression(args);
                return endPointExpression;
            };

            ExpressionIntrepreter.expTable["x"] = function (e) {

                var args = e.args;
                var xExpression: XPointExpression = new XPointExpression(args);
                return xExpression;
            };

            ExpressionIntrepreter.expTable["y"] = function (e) {

                var args = e.args;
                var xExpression: YPointExpression = new YPointExpression(args);
                return xExpression;
            };

            ExpressionIntrepreter.expTable["dist"] = function (e) {

                var args = e.args;
                var distanceExpression: DistanceExpression = new DistanceExpression(args);
                return distanceExpression;
            };

            ExpressionIntrepreter.expTable["intersect"] = function (e) {

                var args = e.args;
                var intersectExpression: IntersectExpression = new IntersectExpression(args);
                return intersectExpression;
            };

            ExpressionIntrepreter.expTable["text"] = function (e) {

                var args = e.args;
                var textExpression: TextExpression = new TextExpression(args);
                return textExpression;
            };

            ExpressionIntrepreter.expTable["show"] = function (e) {

                var args = e.args;
                var showExpression: ShowExpression = new ShowExpression(args);
                return showExpression;
            };

            ExpressionIntrepreter.expTable["hide"] = function (e) {

                var args = e.args;
                var hideExpression: HideExpression = new HideExpression(args);
                return hideExpression;
            };

            ExpressionIntrepreter.expTable["findangle"] = function (e) {

                var args = e.args;
                var findAngleExpression: FindAngleExpression = new FindAngleExpression(args);
                return findAngleExpression;
            };

            ExpressionIntrepreter.expTable["polygon"] = function (e) {

                var args = e.args;
                var polygonExpression: PolygonExpression = new PolygonExpression(args);
                return polygonExpression;
            };


            ExpressionIntrepreter.expTable["trace"] = function (e) {

                var args = e.args;
                var traceExpression: TraceExpression = new TraceExpression(args);
                return traceExpression;
            };

            ExpressionIntrepreter.expTable["plot"] = function (e) {
                var args = e.args;
                var plotExpression: PlotExpression = new PlotExpression(args);
                return plotExpression;
            };


            ExpressionIntrepreter.expTable["para"] = function (e) {
                var args = e.args;
                var parametricPlotExpression: ParametricPlotExpression = new ParametricPlotExpression(args);
                return parametricPlotExpression;
            };


            ExpressionIntrepreter.expTable["project"] = function (e) {

                var args = e.args;
                var projectExpression: ProjectExpression = new ProjectExpression(args);
                return projectExpression;
            };

            ExpressionIntrepreter.expTable["reflect"] = function (e) {

                var args = e.args;
                var projectExpression: ReflectExpression = new ReflectExpression(args);
                return projectExpression;
            };

            ExpressionIntrepreter.expTable["rotate"] = function (e) {

                var args = e.args;
                var rotateExpression: RotateExpression = new RotateExpression(args);
                return rotateExpression;
            };


            ExpressionIntrepreter.expTable["translate"] = function (e) {

                var args = e.args;
                var translateExpression: TranslateExpression = new TranslateExpression(args);
                return translateExpression;
            };

            ExpressionIntrepreter.expTable["interpolate"] = function (e) {

                var args = e.args;
                var interpolateExpression: InterpolateExpression = new InterpolateExpression(args);
                return interpolateExpression;
            };


            ExpressionIntrepreter.expTable["group"] = function (e) {

                var args = e.args;
                var groupExpression: GroupExpression = new GroupExpression(args);
                return groupExpression;
            };


            ExpressionIntrepreter.expTable["repeat"] = function (e) {

                var args = e.args;
                var repeatExpression: RepeatExpression = new RepeatExpression(args);
                return repeatExpression;
            };


            ExpressionIntrepreter.expTable["and"] = function (e) {

                var args = e.args;
                var andExpression: AndExpression = new AndExpression(args);
                return andExpression;
            };

            ExpressionIntrepreter.expTable["or"] = function (e) {

                var args = e.args;
                var orExpression: OrExpression = new OrExpression(args);
                return orExpression;
            };

            ExpressionIntrepreter.expTable["diff"] = function (e) {

                var args = e.args;
                var diffExpression: DiffExpression = new DiffExpression(args);
                return diffExpression;
            };

            ExpressionIntrepreter.expTable["xor"] = function (e) {

                var args = e.args;
                var xorExpression: XORExpression = new XORExpression(args);
                return xorExpression;
            };

            ExpressionIntrepreter.expTable["subtract"] = function (e) {
                var args = e.args;
                var subExpression: SubtractExpression = new SubtractExpression(args);
                return subExpression;
            };


            var mathFunctions = ["sin", "cos", "tan", "cosec", "sec", "cot", "cosh", "sinh", "tanh",
                "exp", "sqrt", "min", "max", "log", "sqrt", "acos", "asin", "atan"];
            for (var i = 0; i < mathFunctions.length; i++) {
                this.defineMathFunction(mathFunctions[i]);
            }

            ExpressionIntrepreter.expTable["fill"] = function (e) {
                var args = e.args;
                var fillExpression: FillExpression = new FillExpression(args);
                return fillExpression;
            };

            ExpressionIntrepreter.expTable["dilate"] = function (e) {

                var args = e.args;
                var dilateExpression: DilateExpression = new DilateExpression(args);
                return dilateExpression;
            };

            ExpressionIntrepreter.expTable["pos"] = function (e) {

                var args = e.args;
                var positionExpression: PositionExpression = new PositionExpression(args);
                return positionExpression;
            };

            ExpressionIntrepreter.expTable["range"] = function (e) {
                var args = e.args;
                var rangeExpression: RangeExpression = new RangeExpression(args);
                return rangeExpression;
            };


            ExpressionIntrepreter.expTable["part"] = function (e) {
                var args = e.args;
                var partExpression: PartExpression = new PartExpression(args);
                return partExpression;
            };


            ExpressionIntrepreter.expTable["reverse"] = function (e) {
                var args = e.args;
                var reverseExpression: ReverseExpression = new ReverseExpression(args);
                return reverseExpression;
            };

            ExpressionIntrepreter.expTable["marker"] = function (e) {
                var args = e.args;
                var markerExpression: MarkerExpression = new MarkerExpression(args);
                return markerExpression;
            };

            ExpressionIntrepreter.expTable["fade"] = function (e) {
                var args = e.args;
                var fadeExpression: FadeExpression = new FadeExpression(args);
                return fadeExpression;
            };

            ExpressionIntrepreter.expTable["pointtype"] = function (e) {
                var args = e.args;
                var expression: PointTypeExpression = new PointTypeExpression(args);
                return expression;
            };

            ExpressionIntrepreter.expTable["dash"] = function (e) {
                var args = e.args;
                var expression: DashLineExpression = new DashLineExpression(args);
                return expression;
            };

            ExpressionIntrepreter.expTable["stroke"] = function (e) {
                var args = e.args;
                var expression: StrokeExpression = new StrokeExpression(args);
                return expression;
            };


        }// end of Populate Function table
    }

}

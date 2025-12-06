/**
 * Created by Mathdisk on 3/17/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *  Responsible for creating command Objects based on  expression
 *
 */
module robo.command {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import IRoboCommand = robo.command.IRoboCommand;
    import PointExpression = robo.expressions.PointExpression;
    import PerpExpression = robo.expressions.PerpExpression;
    import ParallelExpression = robo.expressions.ParallelExpression;
    import LineExpression = robo.expressions.LineExpression;
    import AssignmentExpression = robo.expressions.AssignmentExpression;
    import AngleExpression = robo.expressions.AngleExpression;
    import VariableReferenceExpression = robo.expressions.VariableReferenceExpression;
    import Point = away.geom.Point;
    import ArcExpression = robo.expressions.ArcExpression;
    import TextExpression = robo.expressions.TextExpression;
    import HideExpression = robo.expressions.HideExpression;
    import ShowExpression = robo.expressions.ShowExpression;
    import FindAngleExpression = robo.expressions.FindAngleExpression;
    import PolygonExpression = robo.expressions.PolygonExpression;
    import DistanceExpression = robo.expressions.DistanceExpression;
    import FillExpression = robo.expressions.FillExpression;
    import TraceExpression = robo.expressions.TraceExpression;
    import PlotExpression = robo.expressions.PlotExpression;
    import ExpressionError = roboexpressions.ExpressionError;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import RotateExpression = robo.expressions.RotateExpression;
    import TranslateExpression = robo.expressions.TranslateExpression;
    import DilateExpression = robo.expressions.DilateExpression;
    import ReflectExpression = robo.expressions.ReflectExpression;
    import ProjectExpression = robo.expressions.ProjectExpression;
    import RepeatExpression = robo.expressions.RepeatExpression;
    import ParametricPlotExpression = robo.expressions.ParametricPlotExpression;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import PartExpression = robo.expressions.PartExpression;
    import FadeExpression = robo.expressions.FadeExpression;
    import DashLineExpression = robo.expressions.DashLineExpression;
    import StrokeExpression = robo.expressions.StrokeExpression;
    import MarkerExpression = robo.expressions.MarkerExpression;

    export class CommandFactory {
        constructor() {

        }

        public static populateCommands(expression: IBaseExpression, commands: IRoboCommand[]): void {
            var executableExpression: IBaseExpression = expression;
            var expressionId: number = executableExpression.getExpresionId();
            var expressionCommandTxt: string = executableExpression.getExpressionCommandText();

            var command: IRoboCommand = null;
            var labelName: string = "";
            var expressionName: string = expression.getName();

            //If it is a assignment expression,, the right side is what matters...
            if (expressionName == AssignmentExpression.NAME) {
                var assignmentExpression: AssignmentExpression = <AssignmentExpression>expression;
                var variableReferenceExpression: VariableReferenceExpression = <VariableReferenceExpression>assignmentExpression.lhsExpression;
                labelName = variableReferenceExpression.getVariableName();
                executableExpression = (<AssignmentExpression>expression).rhsExpression;
                expressionName = executableExpression.getName();
            }


            switch (expressionName) {
                case PointExpression.NAME:

                    var ptExpression: PointExpression = <PointExpression>executableExpression;
                    command = new PointCommand(ptExpression.getPoint());
                    break;

                case LineExpression.NAME:
                    var lineExpression: LineExpression = <LineExpression>executableExpression;
                    var pts: Point[] = lineExpression.getLinePoints();
                    command = new LineCommand(pts[0], pts[1]);
                    break;

                case ArcExpression.NAME:
                    var arcExpression: ArcExpression = <ArcExpression>executableExpression;
                    command = CommandFactory.getArcCommand(arcExpression);
                    break;

                case  PerpExpression.NAME:
                    var perpExpression: PerpExpression = <PerpExpression>executableExpression;
                    var points = perpExpression.getPerpPoints();
                    command = new PerpCommand(points[0], points[1], points[2], perpExpression.getLineLength());
                    break;

                case ParallelExpression.NAME:
                    var paralelExpression: ParallelExpression = <ParallelExpression>executableExpression;
                    var points = paralelExpression.getParallelPoints();
                    command = new ParallelCommand(points[0], points[1], points[2], paralelExpression.getLineLength());
                    break;

                case AngleExpression.NAME:
                    var angleExpression: AngleExpression = <AngleExpression>executableExpression;
                    var points = angleExpression.getLinePoints();
                    var angleToMeasure = angleExpression.getAngleToMeasure();
                    var posRatio = angleExpression.getPositionRatio();
                    command = new AngleCommand(points[0], points[1], angleToMeasure, posRatio);
                    break;

                case TextExpression.NAME:
                    var textExpression: TextExpression = <TextExpression>executableExpression;
                    command = CommandFactory.getTextCommand(textExpression);
                    break;

                case HideExpression.NAME:
                    var hideExpression: HideExpression = <HideExpression>executableExpression;
                    command = new HideCommand(hideExpression.getHideExpressionLabels());
                    break;

                case ShowExpression.NAME:
                    var showExpression: ShowExpression = <ShowExpression>executableExpression;
                    command = new ShowCommand(showExpression.getShowExpressionLabels(), showExpression.getAlphaValue());
                    break;

                case FindAngleExpression.NAME:
                    var findAngleExpression: FindAngleExpression = <FindAngleExpression>executableExpression;
                    command = CommandFactory.getFindAngleCommand(findAngleExpression);
                    break;

                case PolygonExpression.NAME:
                    var polygonExpression: PolygonExpression = <PolygonExpression>executableExpression;
                    var points: Point[] = polygonExpression.getPoints();
                    command = new PolygonCommand(points);
                    break;

                case FillExpression.NAME:
                    var fillExpression: FillExpression = <FillExpression>executableExpression;
                    command = new FillRoboCommand(fillExpression.getFillableGroup());
                    break;

                case PlotExpression.NAME:
                    var plotExpression: PlotExpression = <PlotExpression>executableExpression;
                    command = new ExplicitGraphCommand(plotExpression.getProcessingPointPair2D());
                    break;

                case ParametricPlotExpression.NAME:
                    var parametricPlotExpression: ParametricPlotExpression = <ParametricPlotExpression>executableExpression;
                    command = new TraceCommand(parametricPlotExpression.getSplineCurve());
                    break;

                case TraceExpression.NAME: //Trace expression extends the polygon expression,the getPoints returns the given input which is converted into spline points in TraceCommand
                    var traceExpression: TraceExpression = <TraceExpression>executableExpression;
                    command = new TraceCommand(traceExpression.getSplineCurve());
                    break;

                case PartExpression.NAME: //Trace expression extends the polygon expression,the getPoints returns the given input which is converted into spline points in TraceCommand
                    var partExpression: PartExpression = <PartExpression>executableExpression;
                    command = new PartCommand(<ProcessingGroup>partExpression.getTransformable());
                    break;
                case FadeExpression.NAME:
                    var fadeExpression: FadeExpression = <FadeExpression>executableExpression;
                    command = new FadeCommand(fadeExpression.getExpressionLabels(),
                        fadeExpression.getAlphaValue());
                    break;
                case StrokeExpression.NAME:
                    var strokeExpression: StrokeExpression = <StrokeExpression>executableExpression;
                    command = new StrokeCommand(strokeExpression.getExpressionLabels(),
                        strokeExpression.getThickness());
                    break;

                case DashLineExpression.NAME:
                    var dashExpression: DashLineExpression = <DashLineExpression>executableExpression;
                    command = new DashLineCommand(dashExpression.processingPointPair2D, dashExpression.getLinePoints());
                    break;

                case MarkerExpression.NAME:
                    var markerExpression: MarkerExpression = <MarkerExpression>executableExpression;
                    command = new MarkerCommand(markerExpression.getMarkers());
                    break;

                case RotateExpression.NAME: //Trace expression extends the polygon expression,the getPoints returns the given input which is converted into spline points in TraceCommand
                    var rotateExpression: RotateExpression = <RotateExpression>executableExpression;
                    command = new RotateCommand(rotateExpression.getTransformable(), rotateExpression.getRotateInDegress(), rotateExpression.getRotateAbout());
                    break;
                case TranslateExpression.NAME: //Trace expression extends the polygon expression,the getPoints returns the given input which is converted into spline points in TraceCommand
                    var translateExpression: TranslateExpression = <TranslateExpression>executableExpression;
                    command = new TranslateCommand(translateExpression.getTransformable(), translateExpression.getTranslateValue(), translateExpression.getTranslateAbout());
                    break;

                case DilateExpression.NAME:
                    var dilateExpression: DilateExpression = <DilateExpression>executableExpression;
                    command = new DilateCommand(dilateExpression.getTransformable(), dilateExpression.getScaleValue(), dilateExpression.getDilateAbout());
                    break;

                case ReflectExpression.NAME: //Trace expression extends the polygon expression,the getPoints returns the given input which is converted into spline points in TraceCommand
                    var feflectExpression: ReflectExpression = <ReflectExpression>executableExpression;
                    command = new ReflectCommand(feflectExpression.getTransformable(), feflectExpression.getReflectAbout());
                    break;

                case RepeatExpression.NAME: //Trace expression extends the polygon expression,the getPoints returns the given input which is converted into spline points in TraceCommand
                    var repeatExpression: RepeatExpression = <RepeatExpression>executableExpression;
                    command = new RepeatCommand(repeatExpression.getProcessingGroup());
                    break;


                case DistanceExpression.NAME:
                    var distanceExpr: DistanceExpression = <DistanceExpression>executableExpression;

                    if (distanceExpr.getDistance() != 0) {
                        var pnt: Point[] = distanceExpr.getPoints();
                        command = new DistanceCommand(pnt[0], pnt[1]);
                        break;
                    }


                case ProjectExpression.NAME: //Trace expression extends the polygon expression,the getPoints returns the given input which is converted into spline points in TraceCommand
                    var projectExpression: ProjectExpression = <ProjectExpression>executableExpression;
                    command = new ProjectCommand(projectExpression.getTransformable(), projectExpression.getProjectAbout());
                    break;


                default: {
                    var utilityCmdNames: ArrayHelper = BaseRoboCommand.getUtilityCmdNames();

                    if (utilityCmdNames.contains(expressionName))
                        break;

                    //now throw error for invalid expression names
                    throw new ExpressionError(expressionId, 'Expression Error', "No Such command. Click the How-To menu for Samples.");

                }

            }


            if (command != null) {
                command.setExpressionId(expressionId);
                command.setCommandText(expressionCommandTxt);

                command.setLabelName(labelName);
                commands.push(command);
            }
        }

        private static getArcCommand(arcExpression: ArcExpression): IRoboCommand {
            var arcCommand: IRoboCommand;
            var arcCoordinates: number[] = arcExpression.getInputCoordinates();

            if (arcCoordinates.length == 5) {
                var originPt: Point = new Point(arcCoordinates[0], arcCoordinates[1]);
                var arcRadius: number = arcCoordinates[2];
                var fromAngle: number = arcCoordinates[3];
                var toAngle: number = arcCoordinates[4];
                arcCommand = new ArcCommand(originPt, arcRadius, fromAngle, toAngle);
            }

            if (arcCoordinates.length == 8) {
                var copyStartPt: Point = new Point(arcCoordinates[0], arcCoordinates[1]);
                var copyEndPt: Point = new Point(arcCoordinates[2], arcCoordinates[3]);
                var originPt: Point = new Point(arcCoordinates[4], arcCoordinates[5]);
                var fromAngle: number = arcCoordinates[6];
                var toAngle: number = arcCoordinates[7];
                arcCommand = new ArcByDistanceCommand(copyStartPt, copyEndPt, originPt, fromAngle, toAngle);
            }
            return arcCommand;

        }


        private static getFindAngleCommand(findAngleExpression: FindAngleExpression): IRoboCommand {
            var angleCommand: IRoboCommand;
            var points: Point[] = findAngleExpression.getInputPoints();

            if (findAngleExpression.containsPolyAngleExpression()) {
                angleCommand = new FindPolyAngleCommand(points);

            } else {

                angleCommand = new FindAngleCommand(points[0], points[1], points[2], points[3]);
            }
            return angleCommand;
        }

        private static getTextCommand(textExpression: TextExpression): IRoboCommand {
            var textCommand: IRoboCommand;
            var displayText: string = textExpression.getDisplayText();

            if (textExpression.isSimpleTextExpression()) {
                textCommand = new TextCommand(displayText);

            } else {

                var textPosition: Point = textExpression.getTextPosition();
                textCommand = new TextOnGraphsheetCommand(displayText, textPosition);
            }
            return textCommand;
        }
    }
}


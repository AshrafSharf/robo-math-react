
/**
* Created by Mathdisk on 3/10/14.
*/

/// <reference path="util/ArrayHelper.d.ts" />
/// <reference path="util/ArrayHelper.ts" />
/// <reference path="expressions/ExpressionError.ts" />
/// <reference path="expressions/ExpressionError.d.ts" />
/// <reference path="expressions/ExpressionIntrepreter.ts" />


/// <reference path="util/ColorConstants.ts" />
/// <reference path="util/DelaunayMesh.ts" />
/// <reference path="util/PMath.ts" />
/// <reference path="util/StyleConfig.ts" />
/// <reference path="util/MathSystem.ts" />
/// <reference path="util/Vector3DUtils.ts" />
/// <reference path="util/BoundryConstrainer.ts" />
/// <reference path="util/StringUtil.ts" />
/// <reference path="core/Point3D.ts" />
/// <reference path="core/Geometric2DUtil.ts" />
/// <reference path="core/Geometric3DUtil.ts" />
/// <reference path="core/IIntersectable.ts" />
/// <reference path="core/ITransformable.ts" />
/// <reference path="core/TransformablePoint.ts" />
/// <reference path="core/ProcessingLine2D.ts" />
/// <reference path="core/ProcessingLine3D.ts" />
/// <reference path="core/ProcessingCircle.ts" />
/// <reference path="core/ProcessingSpline2D.ts" />
/// <reference path="core/ProcessingPointPair2D.ts" />
/// <reference path="core/ProcessingGraphTrace.ts" />
/// <reference path="core/ProcessingParametricGraphTrace.ts" />

/// <reference path="core/RotationInfo.ts" />
/// <reference path="core/ProcessingPolygon2D.ts" />
/// <reference path="core/FIlledPolygon2D.ts" />
/// <reference path="shapeitems/BaseShapeItem.ts" />
/// <reference path="shapeitems/ArcByDistanceShapeItem.ts" />
/// <reference path="core/ProcessingGroup.ts" />


/// <reference path="polyclipping/IntPoint.ts" />
/// <reference path="polyclipping/IntRect.ts" />
/// <reference path="polyclipping/OutPt.ts" />
/// <reference path="polyclipping/OutPtRef.ts" />
/// <reference path="polyclipping/OutRec.ts" />
/// <reference path="polyclipping/PolyFillType.ts" />
/// <reference path="polyclipping/PolyType.ts" />
/// <reference path="polyclipping/ClipType.ts" />
/// <reference path="polyclipping/ClipResult.ts" />
/// <reference path="polyclipping/TEdge.ts" />
/// <reference path="polyclipping/Segment.ts" />
/// <reference path="polyclipping/ClipperException.d.ts" />
/// <reference path="polyclipping/ClipperException.ts" />
/// <reference path="polyclipping/EdgeSide.ts" />
/// <reference path="polyclipping/JoinRec.ts" />
/// <reference path="polyclipping/JoinType.ts" />
/// <reference path="polyclipping/LocalMinima.ts" />
/// <reference path="polyclipping/Polygon.ts" />
/// <reference path="polyclipping/Polygons.ts" />
/// <reference path="polyclipping/ExPolygon.ts" />
/// <reference path="polyclipping/ExPolygons.ts" />
/// <reference path="polyclipping/HorzJoinRec.ts" />
/// <reference path="polyclipping/IntersectNode.ts" />
/// <reference path="polyclipping/ClipperBase.ts" />
/// <reference path="polyclipping/Clipper.ts" />
/// <reference path="extrusions/DelanauyPoint.ts" />
/// <reference path="extrusions/DelanayTriangle.ts" />
/// <reference path="extrusions/DelanuayEdge.ts" />
/// <reference path="extrusions/Delaunay.ts" />
/// <reference path="extrusions/DelaunayMeshBuilder.ts" />
/// <reference path="extrusions/b2Vec2.ts" />
/// <reference path="polyclipping/ISetItem.ts" />
/// <reference path="polyclipping/SimpleSetItem.ts" />
/// <reference path="polyclipping/ISetProcessor.ts" />
/// <reference path="polyclipping/ClipResultPolyItem.ts" />
/// <reference path="polyclipping/ClipOperation.ts" />
/// <reference path="polyclipping/IntersectOperation.ts" />
/// <reference path="polyclipping/DifferenceOperation.ts" />
/// <reference path="polyclipping/XOROperation.ts" />
/// <reference path="polyclipping/UnionOperation.ts" />
/// <reference path="extrusions/Triangulator2D.ts" />




/// <reference path="extrusions/FourPoints.ts" />
/// <reference path="extrusions/Line.ts" />
/// <reference path="extrusions/RenderSide.ts" />
/// <reference path="extrusions/Vertex.ts" />
/// <reference path="extrusions/LinearExtrudeBuilder.ts" />
/// <reference path="extrusions/WireFrameObjects3D.ts" />
/// <reference path="primitivies/FaceHelper.ts" />
/// <reference path="primitivies/ThreeJSToAway3DConverter.ts" />
/// <reference path="primitivies/ThreeJSShapeAdapter.ts" />
/// <reference path="primitivies/Text3DFactory.ts" />
/// <reference path="primitivies/Cylinder.ts" />
/// <reference path="primitivies/Sphere.ts" />
/// <reference path="primitivies/Torus.ts" />
/// <reference path="primitivies/Cube.ts" />
/// <reference path="primitivies/Capsule.ts" />
/// <reference path="primitivies/Cone.ts" />
/// <reference path="primitivies/Capsule.ts" />
/// <reference path="primitivies/Cone.ts" />
/// <reference path="geom/Object3DFactory.ts" />


//The below order is defined based on which objects creates the other one (hard references)
/// <reference path="geom/ICoordinateSystemMapper.ts" />
/// <reference path="geom/LHSCoordinateSystemMapper.ts" />
/// <reference path="geom/GraphSheet3DBounds.ts" />
/// <reference path="geom/HoverDragController.ts" />


/// <reference path="geom/GraphSheet3D.ts" />
/// <reference path="geom/UI3DScript.ts" />
/// <reference path="geom/GeometryGroup.ts" />
/// <reference path="geom/GeometryPart.ts" />
/// <reference path="geom/HeightBasedGeometryPart.ts" />
/// <reference path="geom/AxisAlignedGeometryPart.ts" />
/// <reference path="geom/AxisAlignedCuboidGeometryPart.ts" />


/// <reference path="twod/AxisRenderer.ts" />
/// <reference path="twod/GraphSheet2D.ts" />
/// <reference path="twod/GraphSheet2DAxes.ts" />
/// <reference path="twod/GraphSheet2DBounds.ts" />
/// <reference path="geom/ClipBuilder.ts" />
/// <reference path="geom/PolyClipping.ts" />


//once geometry objects are defined, now use the virtual objects which instantiates (hard references to Constructor function)
/// <reference path="geom/GeomPartInstanceRemoveManager.ts" />
/// <reference path="virtualobjects/VirtualObjectsExecutionContext.ts" />
/// <reference path="virtualobjects/BaseVirtualObject.ts" />
/// <reference path="virtualobjects/UVMapContainer.ts" />
/// <reference path="virtualobjects/Paper3D.ts" />
/// <reference path="virtualobjects/Pencil3D.ts" />
/// <reference path="virtualobjects/Ruler3D.ts" />
/// <reference path="virtualobjects/Protractor3D.ts" />
/// <reference path="virtualobjects/SetSquareUVMapper.ts" />
/// <reference path="virtualobjects/SetSquare3D.ts" />
/// <reference path="virtualobjects/Compass3D.ts" />
/// <reference path="virtualobjects/CompassEdge.ts" />
/// <reference path="virtualobjects/PolygonBuilder.ts" />
/// <reference path="virtualobjects/Indicator3D.ts" />
/// <reference path="virtualobjects/FillVirtualObject.ts" />
/// <reference path="virtualobjects/ProcessingGroupBuilder.ts" />
/// <reference path="virtualobjects/PointPairBuilder.ts" />
/// <reference path="virtualobjects/MarkerBuilder.ts" />
/// <reference path="virtualobjects/VirtualTracer.ts" />




/// <reference path="virtualobjects/rotator/VirtualRotator.ts" />
/// <reference path="virtualobjects/rotator/RotatePartHandler.ts" />
/// <reference path="virtualobjects/rotator/ArcRotatePartHandler.ts" />
/// <reference path="virtualobjects/rotator/LineRotatePartHandler.ts" />
/// <reference path="virtualobjects/rotator/PointRotateHandler.ts" />
/// <reference path="virtualobjects/rotator/PolygonRotateHandler.ts" />

/// <reference path="virtualobjects/translator/VirtualTranslator.ts" />
/// <reference path="virtualobjects/translator/TranslatePartHandler.ts" />
/// <reference path="virtualobjects/translator/ArcTranslatePartHandler.ts" />
/// <reference path="virtualobjects/translator/LineTranslatePartHandler.ts" />
/// <reference path="virtualobjects/translator/PointTranslateHandler.ts" />
/// <reference path="virtualobjects/translator/PolygonTranslateHandler.ts" />
/// <reference path="virtualobjects/translator/GroupTranslateHandler.ts" />
/// <reference path="virtualobjects/translator/ProcessingPair2DTranslateHandler.ts" />

/// <reference path="virtualobjects/dilator/VirtualDilator.ts" />
/// <reference path="virtualobjects/dilator/DilatePartHandler.ts" />
/// <reference path="virtualobjects/dilator/ArcDilatePartHandler.ts" />
/// <reference path="virtualobjects/dilator/LineDilatePartHandler.ts" />
/// <reference path="virtualobjects/dilator/PointDilateHandler.ts" />
/// <reference path="virtualobjects/dilator/PolygonDilateHandler.ts" />
/// <reference path="virtualobjects/dilator/GroupDilateHandler.ts" />
/// <reference path="virtualobjects/dilator/ProcessingPair2DDilateHandler.ts" />

/// <reference path="virtualobjects/reflector/VirtualReflector.ts" />
/// <reference path="virtualobjects/reflector/ReflectPartHandler.ts" />
/// <reference path="virtualobjects/reflector/ArcReflectPartHandler.ts" />
/// <reference path="virtualobjects/reflector/LineReflectPartHandler.ts" />
/// <reference path="virtualobjects/reflector/PointReflectHandler.ts" />
/// <reference path="virtualobjects/reflector/PolygonReflectHandler.ts" />
/// <reference path="virtualobjects/reflector/GroupReflectHandler.ts" />
/// <reference path="virtualobjects/reflector/ProcessingPair2DReflectHandler.ts" />

/// <reference path="virtualobjects/dilator/SplineDilateHandler.ts" />
/// <reference path="virtualobjects/reflector/SplineReflectHandler.ts" />
/// <reference path="virtualobjects/rotator/SplineRotateHandler.ts" />
/// <reference path="virtualobjects/translator/SplineTranslateHandler.ts" />
/// <reference path="virtualobjects/rotator/GroupRotateHandler.ts" />
/// <reference path="virtualobjects/rotator/ProcessingPair2DRotateHandler.ts" />


/// <reference path="virtualobjects/projector/VirtualProjector.ts" />
/// <reference path="virtualobjects/projector/ProjectPartHandler.ts" />
/// <reference path="virtualobjects/projector/PointProjectHandler.ts" />
/// <reference path="virtualobjects/projector/GroupProjectHandler.ts" />



/// <reference path="expressions/IBaseExpression.ts" />
/// <reference path="expressions/ExpressionError.ts" />
/// <reference path="expressions/ExpressionContext.ts" />
/// <reference path="expressions/AbstractArithmeticExpression.ts" />
/// <reference path="expressions/AbstractNonArithmeticExpression.ts" />
/// <reference path="expressions/VariableReferenceExpression.ts" />
/// <reference path="expressions/NumericExpression.ts" />
/// <reference path="expressions/AssignmentExpression.ts" />
/// <reference path="expressions/AdditionExpression.ts" />
/// <reference path="expressions/SubtractionExpression.ts" />
/// <reference path="expressions/DivisionExpression.ts" />
/// <reference path="expressions/MultiplicationExpression.ts" />
/// <reference path="expressions/PowerExpression.ts" />
/// <reference path="expressions/MathFunctionExpression.ts" />
/// <reference path="expressions/PointExpression.ts" />
/// <reference path="expressions/LineExpression.ts" />
/// <reference path="expressions/DashLineExpression.ts" />
/// <reference path="expressions/PointTypeExpression.ts" />
/// <reference path="expressions/ArcExpression.ts" />
/// <reference path="expressions/PerpExpression.ts" />
/// <reference path="expressions/ParallelExpression.ts" />
/// <reference path="expressions/AngleExpression.ts" />
/// <reference path="expressions/MidPointExpression.ts" />
/// <reference path="expressions/EndPointExpression.ts" />
/// <reference path="expressions/StartPointExpression.ts" />
/// <reference path="expressions/XPointExpression.ts" />
/// <reference path="expressions/YPointExpression.ts" />
/// <reference path="expressions/QuotedStringExpression.ts" />
/// <reference path="expressions/TextExpression.ts" />
/// <reference path="expressions/DistanceExpression.ts" />
/// <reference path="expressions/PolygonExpression.ts" />
/// <reference path="expressions/IntersectExpression.ts" />
/// <reference path="expressions/HideExpression.ts" />
/// <reference path="expressions/ShowExpression.ts" />
/// <reference path="expressions/FindAngleExpression.ts" />
/// <reference path="expressions/TransformationExpression.ts" />
/// <reference path="expressions/ProjectExpression.ts" />
/// <reference path="expressions/ReflectExpression.ts" />
/// <reference path="expressions/TransformableToExpressionFactory.ts" />
/// <reference path="expressions/RotateExpression.ts" />
/// <reference path="expressions/InterpolateExpression.ts" />
/// <reference path="expressions/MathTrigFunctionExpression.ts" />
/// <reference path="expressions/GroupExpression.ts" />
/// <reference path="expressions/ClipperExpression.ts" />
/// <reference path="expressions/AndExpression.ts" />
/// <reference path="expressions/DiffExpression.ts" />
/// <reference path="expressions/SubtractExpression.ts" />
/// <reference path="expressions/OrExpression.ts" />
/// <reference path="expressions/XORExpression.ts" />
/// <reference path="expressions/FillExpression.ts" />
/// <reference path="expressions/TranslateExpression.ts" />
/// <reference path="expressions/DilateExpression.ts" />
/// <reference path="expressions/TraceExpression.ts" />
/// <reference path="expressions/FadeExpression.ts" />
/// <reference path="expressions/StrokeExpression.ts" />
/// <reference path="expressions/PlotExpression.ts" />
/// <reference path="expressions/ParametricPlotExpression.ts" />
/// <reference path="expressions/PointPair2DExpression.ts" />
/// <reference path="expressions/PositionExpression.ts" />
/// <reference path="expressions/RepeatExpression.ts" />
/// <reference path="expressions/RangeExpression.ts" />
/// <reference path="expressions/PartExpression.ts" />
/// <reference path="expressions/ReverseExpression.ts" />
/// <reference path="expressions/MarkerExpression.ts" />
/// <reference path="expressions/ExpressionToTransformableFactory.ts" />


//Command class refers to virtal objects (soft reference)
/// <reference path="command/BaseRoboCommand.ts" />
/// <reference path="command/AngleCommand.ts" />
/// <reference path="command/ArcCommand.ts" />
/// <reference path="command/IRoboCommand.ts" />
/// <reference path="command/CommandFactory.ts" />
/// <reference path="command/LineCommand.ts" />
/// <reference path="command/ParallelCommand.ts" />
/// <reference path="command/PerpCommand.ts" />
/// <reference path="command/PointCommand.ts" />
/// <reference path="command/TextCommand.ts" />
/// <reference path="command/BaseRoboCommand.ts" />
/// <reference path="command/HideCommand.ts" />
/// <reference path="command/ShowCommand.ts" />
/// <reference path="command/FadeCommand.ts" />
/// <reference path="command/DashLineCommand.ts" />
/// <reference path="command/MarkerCommand.ts" />
/// <reference path="command/StrokeCommand.ts" />
/// <reference path="command/FindAngleCommand.ts" />
/// <reference path="command/ArcByDistanceCommand.ts" />
/// <reference path="command/PolygonCommand.ts" />
/// <reference path="command/DistanceCommand.ts" />
/// <reference path="command/FindPolyAngleCommand.ts" />
/// <reference path="command/TextOnGraphsheetCommand.ts" />
/// <reference path="command/FillRoboCommand.ts" />
/// <reference path="command/TraceCommand.ts" />
/// <reference path="command/ExplicitGraphCommand.ts" />
/// <reference path="command/RotateCommand.ts" />
/// <reference path="command/TranslateCommand.ts" />
/// <reference path="command/DilateCommand.ts" />
/// <reference path="command/ReflectCommand.ts" />
/// <reference path="command/DistanceCommand.ts" />
/// <reference path="command/RepeatCommand.ts" />
/// <reference path="command/ProjectCommand.ts" />
/// <reference path="command/PartCommand.ts" />
/// <reference path="command/RoboCommandSummary.ts" />



/// <reference path="sequence/CallBackContext.ts" />
/// <reference path="sequence/SequenceContext.ts" />
/// <reference path="sequence/AbstractSequenceController.ts" />
/// <reference path="sequence/ISequenceController.ts" />
/// <reference path="sequence/ISequenceEffect.ts" />
/// <reference path="sequence/TimerSequenceController.ts" />
/// <reference path="command/CommandAnimater.ts" />
//Command Sequence creates CommandAnimator so it has to get defined after CommandAnimator
/// <reference path="sequence/CommandSequenceEffect.ts"/>
/// <reference path="sequence/DirectCommandSeqEffect.ts"/>



/// <reference path="expressions/IntrepreterFunctionTable.ts" />
/// <reference path="command/TimedDirectDrawExecutor.ts" />
/// <reference path="command/PlayCommandHandler.ts" />
/// <reference path="test/MaterialTester.ts" />
/// <reference path="geom/Engine3D.ts" />

//grunt-start
/// <reference path="_definitions.d.ts" />
//grunt-end




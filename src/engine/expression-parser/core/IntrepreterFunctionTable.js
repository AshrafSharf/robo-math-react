/**
 * Interpreter Function Table - populates the expression table with all available functions
 */
import { ExpressionInterpreter } from './ExpressionInterpreter.js';
import { NumericExpression } from '../expressions/NumericExpression.js';
import { PointExpression } from '../expressions/PointExpression.js';
import { LineExpression } from '../expressions/LineExpression.js';
import { VectorExpression } from '../expressions/VectorExpression.js';
import { VLineExpression } from '../expressions/VLineExpression.js';
import { HLineExpression } from '../expressions/HLineExpression.js';
import { ExtendlineExpression } from '../expressions/ExtendlineExpression.js';
import { PolarlineExpression } from '../expressions/PolarlineExpression.js';
import { PLLExpression } from '../expressions/PLLExpression.js';
import { PerpExpression } from '../expressions/PerpExpression.js';
import { PolarvectorExpression } from '../expressions/PolarvectorExpression.js';
import { PolarpointExpression } from '../expressions/PolarpointExpression.js';
import { ForwardExpression } from '../expressions/ForwardExpression.js';
import { BackwardExpression } from '../expressions/BackwardExpression.js';
import { PerpShiftExpression } from '../expressions/PerpShiftExpression.js';
import { PlaceAtExpression } from '../expressions/PlaceAtExpression.js';
import { ReverseExpression } from '../expressions/ReverseExpression.js';
import { ChainExpression } from '../expressions/ChainExpression.js';
import { VecSumExpression } from '../expressions/VecSumExpression.js';
import { VecDiffExpression } from '../expressions/VecDiffExpression.js';
import { ScaleExpression } from '../expressions/ScaleExpression.js';
import { VecProjectExpression } from '../expressions/VecProjectExpression.js';
import { DecomposeExpression } from '../expressions/DecomposeExpression.js';
import { AngleExpression } from '../expressions/AngleExpression.js';
import { Angle2Expression } from '../expressions/Angle2Expression.js';
import { Angle3Expression } from '../expressions/Angle3Expression.js';
import { Angle4Expression } from '../expressions/Angle4Expression.js';
import { RightAngleExpression } from '../expressions/RightAngleExpression.js';
import { Angle5Expression } from '../expressions/Angle5Expression.js';
import { ArcExpression } from '../expressions/ArcExpression.js';
import { IntersectExpression } from '../expressions/IntersectExpression.js';
import { ProjectExpression } from '../expressions/ProjectExpression.js';
import { ReflectExpression } from '../expressions/ReflectExpression.js';
import { RotateExpression } from '../expressions/RotateExpression.js';
import { TranslateExpression } from '../expressions/TranslateExpression.js';
import { CircleExpression } from '../expressions/CircleExpression.js';
import { PolygonExpression } from '../expressions/PolygonExpression.js';
import { XPointExpression } from '../expressions/XPointExpression.js';
import { YPointExpression } from '../expressions/YPointExpression.js';
import { StartPointExpression } from '../expressions/StartPointExpression.js';
import { EndPointExpression } from '../expressions/EndPointExpression.js';
import { MidExpression } from '../expressions/MidExpression.js';
import { PointAtRatioExpression } from '../expressions/PointAtRatioExpression.js';
import { A2PExpression } from '../expressions/A2PExpression.js';
import { MagExpression } from '../expressions/MagExpression.js';
import { NormExpression } from '../expressions/NormExpression.js';
import { MapExpression } from '../expressions/MapExpression.js';
import { HideExpression } from '../expressions/visibility/HideExpression.js';
import { ShowExpression } from '../expressions/visibility/ShowExpression.js';
import { FadeInExpression } from '../expressions/visibility/FadeInExpression.js';
import { FadeOutExpression } from '../expressions/visibility/FadeOutExpression.js';
import { StrokeExpression } from '../expressions/StrokeExpression.js';
import { FillExpression } from '../expressions/FillExpression.js';
import { StrokeWidthExpression } from '../expressions/StrokeWidthExpression.js';
import { PosExpression } from '../expressions/PosExpression.js';
import { SizeExpression } from '../expressions/SizeExpression.js';
import { Graph2DExpression } from '../expressions/Graph2DExpression.js';
import { Polar2DExpression } from '../expressions/Polar2DExpression.js';
import { Graph3DExpression } from '../expressions/Graph3DExpression.js';
import { Point3DExpression } from '../expressions/3d/Point3DExpression.js';
import { Line3DExpression } from '../expressions/3d/Line3DExpression.js';
import { Vector3DExpression } from '../expressions/3d/Vector3DExpression.js';
import { Sphere3DExpression } from '../expressions/3d/Sphere3DExpression.js';
import { Cylinder3DExpression } from '../expressions/3d/Cylinder3DExpression.js';
import { Cube3DExpression } from '../expressions/3d/Cube3DExpression.js';
import { Cone3DExpression } from '../expressions/3d/Cone3DExpression.js';
import { Torus3DExpression } from '../expressions/3d/Torus3DExpression.js';
import { Prism3DExpression } from '../expressions/3d/Prism3DExpression.js';
import { Frustum3DExpression } from '../expressions/3d/Frustum3DExpression.js';
import { Pyramid3DExpression } from '../expressions/3d/Pyramid3DExpression.js';
import { Plane3DExpression } from '../expressions/3d/Plane3DExpression.js';
import { Polygon3DExpression } from '../expressions/3d/Polygon3DExpression.js';
import { Forward3DExpression } from '../expressions/3d/Forward3DExpression.js';
import { Backward3DExpression } from '../expressions/3d/Backward3DExpression.js';
import { ShiftTo3DExpression } from '../expressions/3d/ShiftTo3DExpression.js';
import { Reverse3DExpression } from '../expressions/3d/Reverse3DExpression.js';
import { Rotate3DExpression } from '../expressions/3d/Rotate3DExpression.js';
import { Translate3DExpression } from '../expressions/3d/Translate3DExpression.js';
import { Scale3DExpression } from '../expressions/3d/Scale3DExpression.js';
import { PLL3DExpression } from '../expressions/3d/PLL3DExpression.js';
import { Perp3DExpression } from '../expressions/3d/Perp3DExpression.js';
import { PerpShift3DExpression } from '../expressions/3d/PerpShift3DExpression.js';
import { PlaceAt3DExpression } from '../expressions/3d/PlaceAt3DExpression.js';
import { Chain3DExpression } from '../expressions/3d/Chain3DExpression.js';
import { VecSum3DExpression } from '../expressions/3d/VecSum3DExpression.js';
import { VecDiff3DExpression } from '../expressions/3d/VecDiff3DExpression.js';
import { VecProject3DExpression } from '../expressions/3d/VecProject3DExpression.js';
import { Project3DExpression } from '../expressions/3d/Project3DExpression.js';
import { Reflect3DExpression } from '../expressions/3d/Reflect3DExpression.js';
import { Intersect3DExpression } from '../expressions/3d/Intersect3DExpression.js';
import { Decompose3DExpression } from '../expressions/3d/Decompose3DExpression.js';
import { Angle3DExpression } from '../expressions/3d/Angle3DExpression.js';
import { Angle3D2Expression } from '../expressions/3d/Angle3D2Expression.js';
import { RightAngle3DExpression } from '../expressions/3d/RightAngle3DExpression.js';
import { Sector3DExpression } from '../expressions/3d/Sector3DExpression.js';
import { Plot3DExpression } from '../expressions/3d/Plot3DExpression.js';
import { Para3DExpression } from '../expressions/3d/Para3DExpression.js';
import { Curve3DExpression } from '../expressions/3d/Curve3DExpression.js';
import { PlotExpression } from '../expressions/PlotExpression.js';
import { ParametricPlotExpression } from '../expressions/ParametricPlotExpression.js';
import { FunctionDefinitionExpression } from '../expressions/FunctionDefinitionExpression.js';
import { FunctionCallExpression } from '../expressions/FunctionCallExpression.js';
import { VariableReferenceExpression } from '../expressions/VariableReferenceExpression.js';
import { QuotedStringExpression } from '../expressions/QuotedStringExpression.js';
import { LabelExpression } from '../expressions/LabelExpression.js';
import { MathTextExpression } from '../expressions/MathTextExpression.js';
import { WriteExpression } from '../expressions/WriteExpression.js';
import { WriteOnlyExpression } from '../expressions/WriteOnlyExpression.js';
import { WriteWithoutExpression } from '../expressions/WriteWithoutExpression.js';
import { SelectExpression } from '../expressions/SelectExpression.js';
import { SelectExceptExpression } from '../expressions/SelectExceptExpression.js';
import { SurroundExpression } from '../expressions/SurroundExpression.js';
import { MoveToExpression } from '../expressions/MoveToExpression.js';
import { ItemExpression } from '../expressions/ItemExpression.js';
import { ReplaceTextItemExpression } from '../expressions/ReplaceTextItemExpression.js';
import { TopWriteExpression } from '../expressions/TopWriteExpression.js';
import { BottomWriteExpression } from '../expressions/BottomWriteExpression.js';
import { CancelExpression } from '../expressions/CancelExpression.js';
import { ArrowExpression } from '../expressions/ArrowExpression.js';
import { DistanceMarkerExpression } from '../expressions/DistanceMarkerExpression.js';
import { SequenceExpression } from '../expressions/SequenceExpression.js';
import { ParallelExpression } from '../expressions/ParallelExpression.js';
import { RefExpression } from '../expressions/RefExpression.js';
import { TableExpression } from '../expressions/TableExpression.js';
import { AssignmentExpression } from '../expressions/AssignmentExpression.js';
import { AdditionExpression } from '../expressions/AdditionExpression.js';
import { ChangeExpression } from '../../change/ChangeExpression.js';
import { CopyExpression } from '../expressions/CopyExpression.js';
import { SubtractionExpression } from '../expressions/SubtractionExpression.js';
import { MultiplicationExpression } from '../expressions/MultiplicationExpression.js';
import { DivisionExpression } from '../expressions/DivisionExpression.js';
import { PowerExpression } from '../expressions/PowerExpression.js';
import { resolveExpressionDependencies } from './ExpressionDependencyResolver.js';
import { registerCustomFunctions } from './CustomFunctionDefinitions.js';

export class IntrepreterFunctionTable {
    constructor() {}

    /**
     * Populate the function table with all available expressions
     */
    static populateFunctionTable() {
        // Resolve circular dependencies between expression classes
        resolveExpressionDependencies();

        // Helper: register binary expression (lhs op rhs)
        const registerBinary = (symbol, ExprClass) => {
            ExpressionInterpreter.expTable[symbol] = (e) =>
                new ExprClass(e.args[0], e.args[1]);
        };

        // Arithmetic operators
        registerBinary('*', MultiplicationExpression);
        registerBinary('/', DivisionExpression);
        registerBinary('+', AdditionExpression);
        registerBinary('-', SubtractionExpression);
        registerBinary('^', PowerExpression);
        registerBinary('assignment', AssignmentExpression);

        // Helper: register unary expression (single arg)
        const registerUnary = (symbol, ExprClass) => {
            ExpressionInterpreter.expTable[symbol] = (e) =>
                new ExprClass(e.args[0]);
        };

        // Helper: register expression that takes all args
        const registerMultiArg = (symbol, ExprClass) => {
            ExpressionInterpreter.expTable[symbol] = (e) => new ExprClass(e.args);
        };

        // Primitives
        registerUnary('string', VariableReferenceExpression);
        registerUnary('numeric', NumericExpression);
        registerUnary('quotedstring', QuotedStringExpression);

        // Geometry expressions
        registerMultiArg('point', PointExpression);
        registerMultiArg('line', LineExpression);
        registerMultiArg('vector', VectorExpression);
        registerMultiArg('arc', ArcExpression);
        registerMultiArg('circle', CircleExpression);
        registerMultiArg('polygon', PolygonExpression);
        registerMultiArg('g2d', Graph2DExpression);
        registerMultiArg('p2d', Polar2DExpression);
        registerMultiArg('g3d', Graph3DExpression);
        registerMultiArg('point3d', Point3DExpression);
        registerMultiArg('line3d', Line3DExpression);
        registerMultiArg('vector3d', Vector3DExpression);
        registerMultiArg('sphere', Sphere3DExpression);
        registerMultiArg('cylinder', Cylinder3DExpression);
        registerMultiArg('cube', Cube3DExpression);
        registerMultiArg('cone', Cone3DExpression);
        registerMultiArg('torus', Torus3DExpression);
        registerMultiArg('prism', Prism3DExpression);
        registerMultiArg('frustum', Frustum3DExpression);
        registerMultiArg('pyramid', Pyramid3DExpression);
        registerMultiArg('plane3d', Plane3DExpression);
        registerMultiArg('polygon3d', Polygon3DExpression);

        // 3D vector operations
        registerMultiArg('forward3d', Forward3DExpression);     // animate vector/line sliding forward
        registerMultiArg('backward3d', Backward3DExpression);   // animate vector/line sliding backward
        registerMultiArg('shiftTo3d', ShiftTo3DExpression);     // shift vector/line to new position (preserves direction/magnitude)
        registerMultiArg('reverse3d', Reverse3DExpression);     // create reversed vector/line
        registerMultiArg('pll3d', PLL3DExpression);             // parallel line/vector through point
        registerMultiArg('perp3d', Perp3DExpression);           // perpendicular line/vector through point
        registerMultiArg('perpshift3d', PerpShift3DExpression); // shift vector perpendicular (animated)
        registerMultiArg('placeat3d', PlaceAt3DExpression);     // copy vector/line to new position
        registerMultiArg('chain3d', Chain3DExpression);         // tail-to-tip positioning (animated)
        registerMultiArg('vecsum3d', VecSum3DExpression);       // add two vectors
        registerMultiArg('vecdiff3d', VecDiff3DExpression);     // subtract two vectors
        registerMultiArg('vecproject3d', VecProject3DExpression); // project vector onto another
        registerMultiArg('project3d', Project3DExpression);     // project point onto plane
        registerMultiArg('reflect3d', Reflect3DExpression);     // reflect shape across plane
        registerMultiArg('intersect3d', Intersect3DExpression); // intersect 3D shapes
        registerMultiArg('decompose3d', Decompose3DExpression); // decompose vector to components

        // 3D shape transformations
        registerMultiArg('rotate3d', Rotate3DExpression);       // rotate shape around axis
        registerMultiArg('translate3d', Translate3DExpression); // translate shape by delta
        registerMultiArg('scale3d', Scale3DExpression);         // scale shape by factor

        // 3D angle expressions
        // angle3d      = interior (angle arc between two rays from vertex)
        // angle3d2     = reflex (the larger angle, >180 degrees)
        // rightangle3d = right angle marker (90 degree square)
        // sector3d     = filled pie-slice sector
        registerMultiArg('angle3d', Angle3DExpression);           // interior angle arc
        registerMultiArg('angle3d2', Angle3D2Expression);         // reflex angle arc
        registerMultiArg('rightangle3d', RightAngle3DExpression); // right angle marker (90 degree square)
        registerMultiArg('sector3d', Sector3DExpression);         // filled pie-slice sector

        // 3D plotting expressions
        registerMultiArg('plot3d', Plot3DExpression);              // surface plot z = f(x, y)
        registerMultiArg('para3d', Para3DExpression);              // parametric surface (u,v) → (x,y,z)
        registerMultiArg('curve3d', Curve3DExpression);            // parametric curve t → (x,y,z)

        registerMultiArg('plot', PlotExpression);
        registerMultiArg('paraplot', ParametricPlotExpression);
        registerMultiArg('label', LabelExpression);
        registerMultiArg('mathtext', MathTextExpression);
        registerMultiArg('write', WriteExpression);
        registerMultiArg('writeonly', WriteOnlyExpression);
        registerMultiArg('writewithout', WriteWithoutExpression);
        registerMultiArg('select', SelectExpression);
        registerMultiArg('selectexcept', SelectExceptExpression);
        registerMultiArg('surround', SurroundExpression);
        registerMultiArg('moveto', MoveToExpression);
        registerMultiArg('item', ItemExpression);
        registerMultiArg('replace', ReplaceTextItemExpression);
        registerMultiArg('topw', TopWriteExpression);
        registerMultiArg('bottomw', BottomWriteExpression);
        registerMultiArg('cancel', CancelExpression);
        registerMultiArg('arrow', ArrowExpression);
        registerMultiArg('dm', DistanceMarkerExpression);
        registerMultiArg('seq', SequenceExpression);
        registerMultiArg('para', ParallelExpression);
        registerMultiArg('ref', RefExpression);
        registerMultiArg('table', TableExpression);

        // Function definition and calling
        registerMultiArg('def', FunctionDefinitionExpression);
        registerMultiArg('fun', FunctionCallExpression);

        // Line utilities
        registerMultiArg('vline', VLineExpression);      // vertical line
        registerMultiArg('hline', HLineExpression);      // horizontal line
        registerMultiArg('extendline', ExtendlineExpression);      // extend line
        registerMultiArg('polarline', PolarlineExpression);    // line from length and angle
        registerMultiArg('pll', PLLExpression);    // parallel (line or vector based on input)
        registerMultiArg('perp', PerpExpression);  // perpendicular (line or vector based on input)

        // Vector utilities
        registerMultiArg('polarvector', PolarvectorExpression);    // vector from length and angle
        registerMultiArg('polarpoint', PolarpointExpression);      // point from radius and angle
        registerMultiArg('forward', ForwardExpression);    // shift vector forward
        registerMultiArg('backward', BackwardExpression);    // shift vector backward
        registerMultiArg('perpshift', PerpShiftExpression);    // shift vector perpendicular
        registerMultiArg('placeat', PlaceAtExpression);    // copy vector at new position
        registerMultiArg('reverse', ReverseExpression);    // reverse vector at position
        registerMultiArg('chain', ChainExpression);    // tail at tip (for vector addition)
        registerMultiArg('vecsum', VecSumExpression);  // add vectors
        registerMultiArg('vecdiff', VecDiffExpression);  // subtract vectors
        registerMultiArg('vecproject', VecProjectExpression);  // project onto vector
        registerMultiArg('decompose', DecomposeExpression);    // decompose vector

        // Angle expressions
        // angle  = interior (default angle between two rays)
        // angle2 = exterior-first (exterior angle at first vector)
        // angle3 = exterior-second (exterior angle at second vector)
        // angle4 = reflex (angle > 180 degrees)
        // rightangle = right angle marker (90 degree square)
        // angle5 = opposite/vertical (angle across when two lines cross)
        registerMultiArg('angle', AngleExpression);         // interior angle (default)
        registerMultiArg('angle2', Angle2Expression);       // exterior angle (first)
        registerMultiArg('angle3', Angle3Expression);       // exterior angle (second)
        registerMultiArg('angle4', Angle4Expression);       // reflex angle
        registerMultiArg('rightangle', RightAngleExpression); // right angle (90 degree square)
        registerMultiArg('angle5', Angle5Expression);       // opposite/vertical angle

        // Coordinate extraction
        registerMultiArg('x', XPointExpression);
        registerMultiArg('y', YPointExpression);
        registerMultiArg('st', StartPointExpression);
        registerMultiArg('ed', EndPointExpression);
        registerMultiArg('mid', MidExpression);     // midpoint
        registerMultiArg('pointatratio', PointAtRatioExpression);     // point at ratio along any shape
        registerMultiArg('a2p', A2PExpression);     // angle to point (point on circle at angle)

        // Measurement utilities
        registerMultiArg('mag', MagExpression);     // magnitude/distance
        registerMultiArg('norm', NormExpression);   // normalized direction
        registerMultiArg('map', MapExpression);     // linear interpolation

        // Visibility controls
        registerMultiArg('hide', HideExpression);     // hide shapes instantly
        registerMultiArg('show', ShowExpression);     // show shapes instantly
        registerMultiArg('fadein', FadeInExpression); // fade in with animation
        registerMultiArg('fadeout', FadeOutExpression); // fade out with animation

        // Style controls
        registerMultiArg('stroke', StrokeExpression);           // animate stroke color
        registerMultiArg('fill', FillExpression);               // animate fill color
        registerMultiArg('strokewidth', StrokeWidthExpression); // animate stroke width

        // Reposition controls
        registerMultiArg('pos', PosExpression);       // shift containers by dRow, dCol
        registerMultiArg('size', SizeExpression);     // scale containers by width/height ratio

        // Intersection
        registerMultiArg('intersect', IntersectExpression);

        // Point transformations
        registerMultiArg('project', ProjectExpression);   // project point onto line
        registerMultiArg('reflect', ReflectExpression);   // reflect point across line

        // Shape transformations
        registerMultiArg('rotate', RotateExpression);     // rotate shape around center
        registerMultiArg('translate', TranslateExpression); // translate shape by dx, dy
        registerMultiArg('scale', ScaleExpression);       // scale shape around center

        // Animation - unified change for scalars, points, lines, vectors
        registerMultiArg('change', ChangeExpression);

        // Page copy - copy expressions from another page
        // Syntax: copy("Page 1", 1, 2, 3) or copy(1, "ALL")
        ExpressionInterpreter.expTable['copy'] = (e) => {
            if (e.args.length < 2) {
                throw new Error('copy requires at least 2 arguments: page reference and indices');
            }
            const pageRef = e.args[0];  // string or number expression
            const indices = e.args.slice(1);  // remaining args

            // Check if last arg is the string "ALL"
            const lastArg = indices[indices.length - 1];
            if (indices.length === 1 && lastArg.name === 'quotedstring' && lastArg.value === 'ALL') {
                return new CopyExpression(pageRef, 'ALL');
            }

            return new CopyExpression(pageRef, indices);
        };

        // Custom functions (math, utility, etc.)
        registerCustomFunctions(ExpressionInterpreter.expTable);
    }
}

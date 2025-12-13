/**
 * Interpreter Function Table - populates the expression table with all available functions
 */
import { ExpressionInterpreter } from './ExpressionInterpreter.js';
import { NumericExpression } from '../expressions/NumericExpression.js';
import { PointExpression } from '../expressions/PointExpression.js';
import { LineExpression } from '../expressions/LineExpression.js';
import { VecExpression } from '../expressions/VecExpression.js';
import { VLExpression } from '../expressions/VLExpression.js';
import { HLExpression } from '../expressions/HLExpression.js';
import { XLExpression } from '../expressions/XLExpression.js';
import { RALExpression } from '../expressions/RALExpression.js';
import { PerpLExpression } from '../expressions/PerpLExpression.js';
import { PLLExpression } from '../expressions/PLLExpression.js';
import { PerpVExpression } from '../expressions/PerpVExpression.js';
import { PLVExpression } from '../expressions/PLVExpression.js';
import { RAVExpression } from '../expressions/RAVExpression.js';
import { FWVExpression } from '../expressions/FWVExpression.js';
import { BWVExpression } from '../expressions/BWVExpression.js';
import { PMVExpression } from '../expressions/PMVExpression.js';
import { CPVExpression } from '../expressions/CPVExpression.js';
import { RVVExpression } from '../expressions/RVVExpression.js';
import { TTVExpression } from '../expressions/TTVExpression.js';
import { ADDVExpression } from '../expressions/ADDVExpression.js';
import { SUBVExpression } from '../expressions/SUBVExpression.js';
import { SCALEVExpression } from '../expressions/SCALEVExpression.js';
import { PROVExpression } from '../expressions/PROVExpression.js';
import { DCVExpression } from '../expressions/DCVExpression.js';
import { AngleExpression } from '../expressions/AngleExpression.js';
import { AngleXExpression } from '../expressions/AngleXExpression.js';
import { AngleX2Expression } from '../expressions/AngleX2Expression.js';
import { AngleRExpression } from '../expressions/AngleRExpression.js';
import { AngleRtExpression } from '../expressions/AngleRtExpression.js';
import { AngleOExpression } from '../expressions/AngleOExpression.js';
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
import { R2PExpression } from '../expressions/R2PExpression.js';
import { A2PExpression } from '../expressions/A2PExpression.js';
import { MagExpression } from '../expressions/MagExpression.js';
import { UVExpression } from '../expressions/UVExpression.js';
import { Graph2DExpression } from '../expressions/Graph2DExpression.js';
import { Graph3DExpression } from '../expressions/Graph3DExpression.js';
import { Point3DExpression } from '../expressions/3d/Point3DExpression.js';
import { Line3DExpression } from '../expressions/3d/Line3DExpression.js';
import { PlotExpression } from '../expressions/PlotExpression.js';
import { VariableReferenceExpression } from '../expressions/VariableReferenceExpression.js';
import { QuotedStringExpression } from '../expressions/QuotedStringExpression.js';
import { LabelExpression } from '../expressions/LabelExpression.js';
import { AssignmentExpression } from '../expressions/AssignmentExpression.js';
import { AdditionExpression } from '../expressions/AdditionExpression.js';
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
        registerMultiArg('vec', VecExpression);
        registerMultiArg('arc', ArcExpression);
        registerMultiArg('circle', CircleExpression);
        registerMultiArg('polygon', PolygonExpression);
        registerMultiArg('g2d', Graph2DExpression);
        registerMultiArg('g3d', Graph3DExpression);
        registerMultiArg('point3d', Point3DExpression);
        registerMultiArg('line3d', Line3DExpression);
        registerMultiArg('plot', PlotExpression);
        registerMultiArg('label', LabelExpression);

        // Line utilities (short aliases)
        registerMultiArg('vl', VLExpression);      // vertical line
        registerMultiArg('hl', HLExpression);      // horizontal line
        registerMultiArg('xl', XLExpression);      // extend line
        registerMultiArg('ral', RALExpression);    // line from radius and angle (polar)
        registerMultiArg('perpl', PerpLExpression); // perpendicular line
        registerMultiArg('pll', PLLExpression);    // parallel line

        // Vector utilities (short aliases)
        registerMultiArg('perpv', PerpVExpression); // perpendicular vector
        registerMultiArg('plv', PLVExpression);    // parallel vector
        registerMultiArg('rav', RAVExpression);    // vector from radius and angle (polar)
        registerMultiArg('fwv', FWVExpression);    // shift vector forward
        registerMultiArg('bwv', BWVExpression);    // shift vector backward
        registerMultiArg('pmv', PMVExpression);    // shift vector perpendicular
        registerMultiArg('cpv', CPVExpression);    // copy vector at new position
        registerMultiArg('rvv', RVVExpression);    // reverse vector at position
        registerMultiArg('ttv', TTVExpression);    // tail at tip (for vector addition)
        registerMultiArg('addv', ADDVExpression);  // add vectors
        registerMultiArg('subv', SUBVExpression);  // subtract vectors
        registerMultiArg('scalev', SCALEVExpression); // scale vector
        registerMultiArg('prov', PROVExpression);  // project onto vector
        registerMultiArg('dcv', DCVExpression);    // decompose vector

        // Angle expressions
        registerMultiArg('angle', AngleExpression);     // interior angle (default)
        registerMultiArg('anglex', AngleXExpression);   // exterior angle (first)
        registerMultiArg('anglex2', AngleX2Expression); // exterior angle (second)
        registerMultiArg('angler', AngleRExpression);   // reflex angle
        registerMultiArg('anglert', AngleRtExpression); // right angle (90°)
        registerMultiArg('angleo', AngleOExpression);   // opposite/vertical angle

        // Coordinate extraction
        registerMultiArg('x', XPointExpression);
        registerMultiArg('y', YPointExpression);
        registerMultiArg('st', StartPointExpression);
        registerMultiArg('ed', EndPointExpression);
        registerMultiArg('mid', MidExpression);     // midpoint
        registerMultiArg('r2p', R2PExpression);     // ratio to point (point at proportion along line)
        registerMultiArg('a2p', A2PExpression);     // angle to point (point on circle at angle)

        // Measurement utilities
        registerMultiArg('mag', MagExpression);     // magnitude/distance
        registerMultiArg('uv', UVExpression);       // unit vector

        // Intersection
        registerMultiArg('intersect', IntersectExpression);

        // Point transformations
        registerMultiArg('project', ProjectExpression);   // project point onto line
        registerMultiArg('reflect', ReflectExpression);   // reflect point across line

        // Shape transformations
        registerMultiArg('rotate', RotateExpression);     // rotate shape around center
        registerMultiArg('translate', TranslateExpression); // translate shape by dx, dy

        // Custom functions (math, utility, etc.)
        registerCustomFunctions(ExpressionInterpreter.expTable);
    }
}

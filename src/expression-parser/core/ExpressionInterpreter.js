/**
 * Expression Interpreter - evaluates AST (Abstract Syntax Tree) expressions
 *
 * The interpreter doesn't depend on any external classes except the expression table
 * which defines all available expression functions/constructors
 */
export class ExpressionInterpreter {
    static expTable = {};

    constructor() {
        // The expression table will be populated by IntrepreterFunctionTable
    }

    /**
     * Evaluates an AST node recursively
     * The AST has either 'args' (for expressions) or 'value' (for terminals)
     *
     * @param {Object} ast - Abstract Syntax Tree node
     * @param {Object} scope - Optional scope for evaluation
     * @returns {*} The evaluated expression result
     */
    evalExpression(ast, scope) {
        const args = [];

        if (ast.args) {
            // If the ast has args then it is an expression, if not it is a terminal
            // Resolve each arg (nested expressions like line(point(0,0),2,3))
            for (let i = 0; i < ast.args.length; i++) {
                const innerAst = ast.args[i];
                args[i] = this.evalExpression(innerAst, scope);
            }
        } else {
            // If args is not there then at least value must be there (terminal node)
            args[0] = ast.value;
        }

        const normalizedName = ast.name.toLowerCase();
        let result;

        if (ExpressionInterpreter.expTable[normalizedName]) {
            result = ExpressionInterpreter.expTable[normalizedName].call(this, { args, scope });
        } else {
            throw new Error(`No command by the name "${normalizedName}" is found`);
        }

        return result;
    }
}

import * as math from 'mathjs';
import algebrite from 'algebrite';

export const mathUtils = {
    calculateComplexExpression(expression) {
        try {
            return math.evaluate(expression);
        } catch (error) {
            console.error('Math evaluation error:', error);
            return null;
        }
    },
    
    solveAlgebraicExpression(expression) {
        try {
            return algebrite.run(expression);
        } catch (error) {
            console.error('Algebrite evaluation error:', error);
            return null;
        }
    },
    
    createMatrix(rows, cols, fillValue = 0) {
        return math.matrix(math.zeros(rows, cols).map(() => fillValue));
    },
    
    performMatrixOperations(matrixA, matrixB, operation = 'multiply') {
        const operations = {
            multiply: () => math.multiply(matrixA, matrixB),
            add: () => math.add(matrixA, matrixB),
            subtract: () => math.subtract(matrixA, matrixB)
        };
        
        return operations[operation] ? operations[operation]() : null;
    }
};
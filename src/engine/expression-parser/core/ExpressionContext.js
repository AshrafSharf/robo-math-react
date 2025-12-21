/**
 * Context for expression evaluation - stores variable references and state
 * Also tracks dependencies between expressions for reactive updates (fromTo)
 */
export class ExpressionContext {
    constructor() {
        this.references = {};
        this.dependents = {};       // variableName → Set<expression>
        this.currentCaller = null;  // expression currently being resolved
    }

    // Dependency tracking: set/get current caller
    setCaller(expression) {
        this.currentCaller = expression;
    }

    getCaller() {
        return this.currentCaller;
    }

    addReference(key, value) {
        this.references[key] = value;
    }

    updateReference(key, value) {
        this.references[key] = value;
    }

    hasReference(key) {
        return this.references[key] !== undefined;
    }

    // Auto-register dependency when variable is accessed
    getReference(key) {
        const value = this.references[key];

        // Register caller as dependent of this variable
        if (this.currentCaller && value !== undefined) {
            this.addDependent(key, this.currentCaller);
        }

        return value;
    }

    // Dependency tracking: add/get dependents
    addDependent(variableName, expression) {
        if (!this.dependents[variableName]) {
            this.dependents[variableName] = new Set();
        }
        this.dependents[variableName].add(expression);
    }

    getDependents(variableName) {
        return this.dependents[variableName] || new Set();
    }

    getAllDependents() {
        return this.dependents;
    }

    getReferencesCopy() {
        const copyReferences = {};
        for (const key in this.references) {
            copyReferences[key] = this.references[key];
        }
        return copyReferences;
    }

    getReferencesCopyAsPrimitiveValues() {
        const copyReferences = {};
        for (const key in this.references) {
            const retVal = this.references[key];
            if (retVal && retVal.value !== undefined) {
                copyReferences[key] = retVal.value; // Numeric Expression values
            }
            if (retVal && retVal.quotedComment !== undefined) {
                copyReferences[key] = retVal.quotedComment; // String values
            }
        }
        return copyReferences;
    }
}

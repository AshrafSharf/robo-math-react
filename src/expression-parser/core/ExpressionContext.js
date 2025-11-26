/**
 * Context for expression evaluation - stores variable references and state
 */
export class ExpressionContext {
    constructor() {
        this.references = {};
    }

    addReference(key, value) {
        this.references[key] = value;
    }

    hasReference(key) {
        return this.references[key] !== undefined;
    }

    getReference(key) {
        return this.references[key];
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

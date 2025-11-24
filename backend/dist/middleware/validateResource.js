"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResource = void 0;
const validateResource = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        if (!result.success) {
            const issues = result.error.issues.map((issue) => issue.message);
            return res.status(400).json({ message: issues.join(', ') });
        }
        const data = result.data;
        req.body = data.body;
        // In Express 5, req.query and req.params are read-only getters
        // We need to replace them entirely instead of modifying in place
        req.query = data.query;
        req.params = data.params;
        next();
    };
};
exports.validateResource = validateResource;
//# sourceMappingURL=validateResource.js.map
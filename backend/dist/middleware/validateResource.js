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
        const currentQuery = req.query;
        Object.keys(currentQuery).forEach((key) => delete currentQuery[key]);
        Object.assign(currentQuery, data.query);
        const currentParams = req.params;
        Object.keys(currentParams).forEach((key) => delete currentParams[key]);
        Object.assign(currentParams, data.params);
        next();
    };
};
exports.validateResource = validateResource;
//# sourceMappingURL=validateResource.js.map
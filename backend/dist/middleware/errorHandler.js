"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
const notFoundHandler = (_req, res, next) => {
    next(new ApiError(404, 'Resource not found'));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, _req, res, _next) => {
    console.log(err);
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({ message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
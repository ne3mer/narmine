"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/* Simple structured logger for consistent server logs. */
exports.logger = {
    info: (message, meta) => {
        console.log(JSON.stringify({ level: 'info', message, ...(meta ?? {}) }));
    },
    error: (message, meta) => {
        console.error(JSON.stringify({ level: 'error', message, ...(meta ?? {}) }));
    },
    warn: (message, meta) => {
        console.warn(JSON.stringify({ level: 'warn', message, ...(meta ?? {}) }));
    }
};
//# sourceMappingURL=logger.js.map
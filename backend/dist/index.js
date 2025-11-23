"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const bootstrap = async () => {
    await (0, database_1.connectDatabase)();
    const app = (0, app_1.createApp)();
    const server = (0, http_1.createServer)(app);
    server.listen(env_1.env.port, () => {
        logger_1.logger.info(`🚀 API server listening on http://localhost:${env_1.env.port}`);
    });
};
bootstrap().catch((error) => {
    logger_1.logger.error('Unexpected bootstrap error', { error });
    process.exit(1);
});
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const fs_1 = __importDefault(require("fs"));
const createApp = () => {
    const app = (0, express_1.default)();
    // CORS configuration - support multiple origins in production
    const allowedOrigins = [
        'https://narmineh.com',
        'https://www.narmineh.com',
        ...(env_1.env.CLIENT_URL ? env_1.env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
        'http://localhost:3000'
    ];
    const corsOptions = {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'x-client-version', 'x-requested-with'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        preflightContinue: false,
        optionsSuccessStatus: 200
    };
    // CORS MUST be the first middleware to ensure headers are always present
    app.use((0, cors_1.default)(corsOptions));
    // Security Headers
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" } // Allow loading images from uploads
    }));
    // Rate Limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Increased limit for SPA: 1000 requests per 15 mins
        message: 'Too many requests from this IP, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api', limiter);
    app.use((_req, res, next) => {
        res.header('Vary', 'Origin');
        next();
    });
    // Body parsers and cookie parser MUST come before other middleware
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.get('/', (_req, res) => {
        res.json({ message: 'Narmine Backend API is running', version: '1.0.0' });
    });
    // Resolve uploads directory relative to compiled dist folder
    const uploadsDir = path_1.default.join(__dirname, '../public/uploads');
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    // Serve static files from uploads directory with Cache-Control for Cloudflare
    app.use('/uploads', express_1.default.static(uploadsDir, {
        maxAge: '7d', // Cache for 7 days
        setHeaders: (res) => {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        }
    }));
    app.use('/api', routes_1.default);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map
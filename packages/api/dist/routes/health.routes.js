"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
router.get('/deep', (0, errors_1.asyncHandler)(async (_req, res) => {
    // Check database connection
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        const dbOk = true;
        res.json({ status: 'ok', database: dbOk, timestamp: new Date().toISOString() });
    }
    catch (err) {
        res.status(503).json({
            status: 'degraded',
            database: false,
            error: err.message,
            timestamp: new Date().toISOString(),
        });
    }
}));
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const verify_controller_1 = require("../controllers/verify.controller");
const router = (0, express_1.Router)();
router.use((0, rateLimit_middleware_1.rateLimit)(100, 60 * 1000, (req) => req.ip || 'unknown'));
router.get('/:shortCode', verify_controller_1.verifyByShortCode);
exports.default = router;

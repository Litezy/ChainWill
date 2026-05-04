"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const platform_controller_1 = require("../controllers/platform.controller");
const router = (0, express_1.Router)();
router.get('/stats', platform_controller_1.getPlatformStats);
exports.default = router;

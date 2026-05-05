"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const will_controller_1 = require("../controllers/will.controller");
const router = (0, express_1.Router)();
router.get('/:walletAddress/wills', will_controller_1.getSignerWills);
exports.default = router;

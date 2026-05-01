"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const will_controller_1 = require("../controllers/will.controller");
const router = (0, express_1.Router)();
router.get('/:willId/approval-history', will_controller_1.getApprovalHistory);
router.post('/:willId/refresh-effective-amount', will_controller_1.refreshEffectivePullAmount);
router.get('/:willId', will_controller_1.getWillDetails);
exports.default = router;

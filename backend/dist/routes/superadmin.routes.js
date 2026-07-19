"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superadmin_controller_1 = require("../controllers/superadmin.controller");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const router = (0, express_1.Router)();
// Protect all super admin routes
router.use(auth_1.authMiddleware);
router.use((0, roleGuard_1.requireRole)('SUPER_ADMIN'));
router.get('/admins', superadmin_controller_1.getAdmins);
router.post('/admins', superadmin_controller_1.createAdmin);
exports.default = router;
//# sourceMappingURL=superadmin.routes.js.map
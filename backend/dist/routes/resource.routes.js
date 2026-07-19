"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const resource_controller_1 = require("../controllers/resource.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', resource_controller_1.getResources);
router.post('/', upload_1.upload.single('file'), resource_controller_1.uploadResource);
router.delete('/:id', resource_controller_1.deleteResource);
exports.default = router;
//# sourceMappingURL=resource.routes.js.map
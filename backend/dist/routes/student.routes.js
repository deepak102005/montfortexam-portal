"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const student_controller_1 = require("../controllers/student.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware, (0, roleGuard_1.requireRole)('STUDENT'));
// Dashboard
router.get('/dashboard', student_controller_1.getStudentDashboard);
// Subjects
router.get('/subjects', student_controller_1.getSubjects);
// Tests
router.get('/tests', student_controller_1.getStudentTests);
router.get('/tests/:testId/attempt', student_controller_1.getTestForAttempt);
router.post('/tests/:testId/submit', student_controller_1.submitTest);
// Reports
router.get('/reports', student_controller_1.getStudentReports);
router.get('/reports/:testId', student_controller_1.getTestReport);
// Notifications
router.get('/notifications', student_controller_1.getNotifications);
router.patch('/notifications/:id/read', student_controller_1.markNotificationRead);
router.patch('/notifications/read-all', student_controller_1.markAllNotificationsRead);
exports.default = router;
//# sourceMappingURL=student.routes.js.map
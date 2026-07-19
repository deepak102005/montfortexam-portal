"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const teacher_controller_1 = require("../controllers/teacher.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware, (0, roleGuard_1.requireRole)('TEACHER'));
// Dashboard
router.get('/dashboard', teacher_controller_1.getTeacherDashboard);
// Tests
router.get('/tests', teacher_controller_1.getTeacherTests);
router.post('/tests', teacher_controller_1.createTest);
router.put('/tests/:id', teacher_controller_1.updateTest);
router.post('/tests/:id/publish', teacher_controller_1.publishTest);
// Questions
router.get('/tests/:testId/questions', teacher_controller_1.getTestQuestions);
router.post('/tests/:testId/questions', teacher_controller_1.addQuestion);
router.put('/tests/:testId/questions/:questionId', teacher_controller_1.updateQuestion);
router.delete('/tests/:testId/questions/:questionId', teacher_controller_1.deleteQuestion);
// Reports
router.get('/reports', teacher_controller_1.getTeacherReports);
// Grade
router.get('/grade', teacher_controller_1.getGradedTests);
router.get('/grade/:testId', teacher_controller_1.getTestStudentScores);
// Remarks
router.post('/remarks', teacher_controller_1.addRemark);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map
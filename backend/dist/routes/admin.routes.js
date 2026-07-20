"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const upload_1 = require("../middleware/upload");
const admin_controller_1 = require("../controllers/admin.controller");
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = (0, express_1.Router)();
// All admin routes require authentication + ADMIN role
router.use(auth_1.authMiddleware, (0, roleGuard_1.requireRole)('ADMIN'));
// Dashboard
router.get('/dashboard', admin_controller_1.getDashboardStats);
// Students
router.get('/students', admin_controller_1.getStudents);
router.post('/students', admin_controller_1.createStudent);
router.post('/students/bulk', upload_1.upload.single('file'), admin_controller_1.bulkCreateStudents);
router.put('/students/:id', admin_controller_1.updateStudent);
router.patch('/students/:id/toggle-active', admin_controller_1.toggleStudentActive);
router.delete('/students/:id', admin_controller_1.deleteStudent);
// Reports & Resources
// Attendance
router.get('/attendance', attendance_controller_1.getAdminAttendance);
// Tests & Grading
router.get('/tests', admin_controller_1.getAllTests);
router.post('/upload-image', upload_1.upload.single('file'), admin_controller_1.uploadImage);
router.post('/tests', admin_controller_1.createTest);
router.get('/tests/:testId', admin_controller_1.getTestById);
router.post('/tests/:testId/upload-paper', upload_1.upload.single('file'), admin_controller_1.uploadPaper);
router.get('/tests/:testId/questions', admin_controller_1.getTestQuestions);
router.post('/tests/:testId/answer-key', admin_controller_1.submitAnswerKey);
router.post('/tests/:testId/auto-grade', admin_controller_1.autoGradeTest);
router.post('/tests/:testId/manual-questions', admin_controller_1.saveManualQuestions);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map
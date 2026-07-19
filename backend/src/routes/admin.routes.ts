import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { upload } from '../middleware/upload';
import {
  getDashboardStats,
  getStudents,
  createStudent,
  bulkCreateStudents,
  updateStudent,
  toggleStudentActive,
  deleteStudent,
  getAllTests,
  createTest,
  uploadPaper,
  getTestById,
  submitAnswerKey,
  autoGradeTest,
  getTestQuestions,
  saveManualQuestions,
  uploadImage,
} from '../controllers/admin.controller';
import { getAdminAttendance } from '../controllers/attendance.controller';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authMiddleware, requireRole('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Students
router.get('/students', getStudents);
router.post('/students', createStudent);
router.post('/students/bulk', upload.single('file'), bulkCreateStudents);
router.put('/students/:id', updateStudent);
router.patch('/students/:id/toggle-active', toggleStudentActive);
router.delete('/students/:id', deleteStudent);

// Reports & Resources

// Attendance
router.get('/attendance', getAdminAttendance);

// Tests & Grading
router.get('/tests', getAllTests);
router.post('/upload-image', upload.single('file'), uploadImage);
router.post('/tests', createTest);
router.get('/tests/:testId', getTestById);
router.post('/tests/:testId/upload-paper', upload.single('file'), uploadPaper);
router.get('/tests/:testId/questions', getTestQuestions);
router.post('/tests/:testId/answer-key', submitAnswerKey);
router.post('/tests/:testId/auto-grade', autoGradeTest);
router.post('/tests/:testId/manual-questions', saveManualQuestions);

export default router;

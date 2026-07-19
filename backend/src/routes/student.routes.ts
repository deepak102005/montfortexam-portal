import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import {
  getStudentDashboard,
  getSubjects,
  getStudentTests,
  getTestForAttempt,
  submitTest,
  getStudentReports,
  getTestReport,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/student.controller';

const router = Router();

router.use(authMiddleware, requireRole('STUDENT'));

// Dashboard
router.get('/dashboard', getStudentDashboard);

// Subjects
router.get('/subjects', getSubjects);

// Tests
router.get('/tests', getStudentTests);
router.get('/tests/:testId/attempt', getTestForAttempt);
router.post('/tests/:testId/submit', submitTest);

// Reports
router.get('/reports', getStudentReports);
router.get('/reports/:testId', getTestReport);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.patch('/notifications/read-all', markAllNotificationsRead);

export default router;

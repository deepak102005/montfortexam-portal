import { Router } from 'express';
import { getAdmins, createAdmin } from '../controllers/superadmin.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

// Protect all super admin routes
router.use(authMiddleware);
router.use(requireRole('SUPER_ADMIN'));

router.get('/admins', getAdmins);
router.post('/admins', createAdmin);

export default router;

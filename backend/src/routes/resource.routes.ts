import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { getResources, uploadResource, deleteResource } from '../controllers/resource.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getResources);
router.post('/', upload.single('file'), uploadResource);
router.delete('/:id', deleteResource);

export default router;

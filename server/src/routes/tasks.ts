import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/tasksController.js';

// mergeParams: true allows accessing :id (projectId) from parent router
const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', listTasks);
router.post('/', createTask);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

// POST /auth/login
router.post('/login', AuthController.login);

// POST /auth/logout
router.post('/logout', AuthController.logout);

// GET /auth/verify
router.get('/verify', AuthController.verify);

// GET /auth/me
router.get('/me', AuthController.getCurrentUser);

export default router;

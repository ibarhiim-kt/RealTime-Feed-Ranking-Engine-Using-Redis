import express from 'express';
import { signup, login, getProfile, logout, verifyEmail} from '../controllers/authController.js';

const router = express.Router();


router.post('/signup', signup);
router.get("/verify-email", verifyEmail);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getProfile);

export default router;

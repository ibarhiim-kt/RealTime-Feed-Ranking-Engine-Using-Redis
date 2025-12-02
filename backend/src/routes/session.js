import express from 'express';
import { refreshSession } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/refresh', refreshSession);

export default router;

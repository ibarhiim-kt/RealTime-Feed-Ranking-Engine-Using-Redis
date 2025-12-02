import express from 'express';
import { requestMagicLink, loginWithMagicLink } from '../controllers/magicController.js';

const router = express.Router();

router.post('/request', requestMagicLink);  // user submits email
router.get('/login', loginWithMagicLink);   // user clicks link

export default router;

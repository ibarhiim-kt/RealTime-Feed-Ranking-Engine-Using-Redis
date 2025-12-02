import express from "express";
import { requestPasswordReset, resetPassword } from "../controllers/passwordController.js";

const router = express.Router();

// User requests password reset email
router.post("/request", requestPasswordReset);

// User clicks link and submits new password
router.post("/reset", resetPassword);

export default router;

import express from "express";
import { googleLogin, googleCallback } from "../controllers/oauthController.js";

const router = express.Router();

router.get("/google", googleLogin);          // redirect to Google
router.get("/google/callback", googleCallback); // Google redirect back

export default router;

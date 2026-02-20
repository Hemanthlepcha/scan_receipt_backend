import express from "express";
import { getMe, login, signup } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  loginValidation,
  signupValidation,
  validate,
} from "../utils/validators.js";

const router = express.Router();

// Public routes
router.post("/signup", signupValidation, validate, signup);
router.post("/login", loginValidation, validate, login);

// Protected routes
router.get("/me", authMiddleware, getMe);

export default router;

import express from "express";
import {
  confirmTransaction,
  uploadAndSave,
  uploadReceipt,
} from "../controllers/receipt.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { confirmTransactionValidation, validate } from "../utils/validators.js";

const router = express.Router();

// All receipt routes require authentication
router.use(authMiddleware);

// Upload and scan receipt (returns extracted data for verification)
router.post("/upload", upload.single("receipt"), uploadReceipt);

// Confirm and save transaction (after user verification)
router.post(
  "/confirm",
  confirmTransactionValidation,
  validate,
  confirmTransaction,
);

// Upload and directly save (if auto-save needed)
router.post("/upload-and-save", upload.single("receipt"), uploadAndSave);

export default router;

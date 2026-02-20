import express from "express";
import {
  getDashboardStats,
  getRecentTransactions,
  getTransactionsWithFilter,
} from "../controllers/dashboard.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// Get transactions with filters
// Query params: filter (daily/weekly/monthly/custom/all), start_date, end_date, page, limit
router.get("/transactions", getTransactionsWithFilter);

// Get dashboard statistics
// Query params: filter (daily/weekly/monthly/custom/all), start_date, end_date
router.get("/stats", getDashboardStats);

// Get recent transactions
// Query params: limit (default: 10)
router.get("/recent", getRecentTransactions);

export default router;

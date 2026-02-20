import {
  getAllTransactions,
  getTransactions,
  getTransactionStats,
} from "../services/database.service.js";
import { getDateRange } from "../utils/helpers.js";

/**
 * Get transactions with filters
 */
const getTransactionsWithFilter = async (req, res) => {
  try {
    const {
      filter = "daily",
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = req.query;
    const userId = req.user.id;

    let transactions;
    let dateRange;

    // Get date range based on filter
    if (filter === "all") {
      transactions = await getAllTransactions(userId);
    } else {
      try {
        dateRange = getDateRange(filter, start_date, end_date);
        transactions = await getTransactions(
          userId,
          dateRange.startDate,
          dateRange.endDate,
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    // Calculate total amount
    const totalAmount = transactions.reduce(
      (sum, t) => sum + parseFloat(t.amount || 0),
      0,
    );

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        summary: {
          total_transactions: transactions.length,
          total_amount: totalAmount,
          filter: filter,
          date_range: dateRange
            ? {
                start: dateRange.startDate,
                end: dateRange.endDate,
              }
            : null,
        },
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(transactions.length / limitNum),
          total_items: transactions.length,
          items_per_page: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const { filter = "monthly", start_date, end_date } = req.query;
    const userId = req.user.id;

    let dateRange;
    let stats;

    if (filter === "all") {
      const allTransactions = await getAllTransactions(userId);
      stats = {
        total_transactions: allTransactions.length,
        total_amount: allTransactions.reduce(
          (sum, t) => sum + parseFloat(t.amount || 0),
          0,
        ),
        verified_count: allTransactions.filter((t) => t.verified).length,
        by_bank: {},
      };

      // Group by bank
      allTransactions.forEach((t) => {
        const bank = t.bank_name || "Unknown";
        if (!stats.by_bank[bank]) {
          stats.by_bank[bank] = { count: 0, amount: 0 };
        }
        stats.by_bank[bank].count++;
        stats.by_bank[bank].amount += parseFloat(t.amount || 0);
      });
    } else {
      try {
        dateRange = getDateRange(filter, start_date, end_date);
        stats = await getTransactionStats(
          userId,
          dateRange.startDate,
          dateRange.endDate,
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        statistics: stats,
        filter: filter,
        date_range: dateRange
          ? {
              start: dateRange.startDate,
              end: dateRange.endDate,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * Get recent transactions
 */
const getRecentTransactions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const allTransactions = await getAllTransactions(userId);
    const recentTransactions = allTransactions.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions: recentTransactions,
        count: recentTransactions.length,
      },
    });
  } catch (error) {
    console.error("Get recent transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent transactions",
      error: error.message,
    });
  }
};

export { getDashboardStats, getRecentTransactions, getTransactionsWithFilter };

import supabase from "../config/database.js";

/**
 * Create a new user
 * @param {Object} userData - User data (user_name, password, business_name)
 * @returns {Promise<Object>} Created user
 */
const createUser = async (userData) => {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Find user by username
 * @param {string} user_name
 * @returns {Promise<Object|null>} User object or null
 */
const findUserByUsername = async (user_name) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_name", user_name)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
  return data;
};

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Created transaction
 */
const createTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([transactionData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get transactions with filters
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of transactions
 */
const getTransactions = async (userId, startDate, endDate) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("transaction_date", startDate.toISOString())
    .lte("transaction_date", endDate.toISOString())
    .order("transaction_date", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get all transactions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of transactions
 */
const getAllTransactions = async (userId) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Calculate total amount from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Total amount
 */
const calculateTotalAmount = (transactions) => {
  return transactions.reduce((sum, transaction) => {
    return sum + parseFloat(transaction.amount || 0);
  }, 0);
};

/**
 * Get transaction statistics
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Statistics object
 */
const getTransactionStats = async (userId, startDate, endDate) => {
  const transactions = await getTransactions(userId, startDate, endDate);

  const stats = {
    total_transactions: transactions.length,
    total_amount: calculateTotalAmount(transactions),
    verified_count: transactions.filter((t) => t.verified).length,
    by_bank: {},
  };

  // Group by bank
  transactions.forEach((t) => {
    const bank = t.bank_name || "Unknown";
    if (!stats.by_bank[bank]) {
      stats.by_bank[bank] = {
        count: 0,
        amount: 0,
      };
    }
    stats.by_bank[bank].count++;
    stats.by_bank[bank].amount += parseFloat(t.amount || 0);
  });

  return stats;
};

export {
  calculateTotalAmount,
  createTransaction,
  createUser,
  findUserByUsername,
  getAllTransactions,
  getTransactionStats,
  getTransactions,
};

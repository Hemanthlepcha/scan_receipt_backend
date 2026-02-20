/**
 * Parse date range based on filter type
 * @param {string} filterType - daily, weekly, monthly, custom
 * @param {string} customStartDate - ISO date string for custom range
 * @param {string} customEndDate - ISO date string for custom range
 * @returns {Object} Object with startDate and endDate
 */
const getDateRange = (
  filterType,
  customStartDate = null,
  customEndDate = null,
) => {
  const now = new Date();
  let startDate, endDate;

  switch (filterType) {
    case "daily":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;

    case "weekly":
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      break;

    case "custom":
      if (!customStartDate || !customEndDate) {
        throw new Error("Custom date range requires both start and end dates");
      }
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error("Invalid filter type");
  }

  return { startDate, endDate };
};

/**
 * Format currency amount
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-BT", {
    style: "currency",
    currency: "BTN",
  }).format(amount);
};

/**
 * Sanitize extracted data from Gemini API
 * @param {string} extractedText
 * @returns {Object}
 */
const parseReceiptData = (extractedText) => {
  // This is a basic parser - you might need to adjust based on actual receipt formats
  const data = {
    journal_number: null,
    amount: null,
    bank_name: null,
    transaction_date: null,
  };

  try {
    // Try to parse as JSON first (if Gemini returns structured data)
    const parsed = JSON.parse(extractedText);
    return { ...data, ...parsed };
  } catch {
    // If not JSON, parse text manually
    const lines = extractedText.split("\n");

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Extract journal/RR/RE number
      if (
        lowerLine.includes("journal") ||
        lowerLine.includes("rr number") ||
        lowerLine.includes("re number")
      ) {
        const match = line.match(/[A-Z0-9]+/g);
        if (match) data.journal_number = match[match.length - 1];
      }

      // Extract amount
      if (
        lowerLine.includes("amount") ||
        lowerLine.includes("nu.") ||
        lowerLine.includes("ngultrum")
      ) {
        const amountMatch = line.match(/[\d,]+\.?\d*/);
        if (amountMatch) {
          data.amount = parseFloat(amountMatch[0].replace(/,/g, ""));
        }
      }

      // Extract bank name
      const banks = [
        "mbob",
        "gobob",
        "bnb",
        "dk bank",
        "t bank",
        "tpay",
        "eteeru",
        "drukpay",
        "bdblepay",
      ];
      for (const bank of banks) {
        if (lowerLine.includes(bank)) {
          data.bank_name = bank.toUpperCase();
          break;
        }
      }

      // Extract date
      const dateMatch = line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
      if (dateMatch) {
        data.transaction_date = new Date(dateMatch[0]);
      }
    }
  }

  return data;
};

export { formatCurrency, getDateRange, parseReceiptData };

import { model } from "../config/gemini.js";
import { parseReceiptData } from "../utils/helpers.js";

/**
 * Extract receipt data from image using Gemini API
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} Extracted receipt data
 */
const extractReceiptData = async (imageBuffer, mimeType) => {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");

    // Prepare image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    // Create detailed prompt for receipt extraction
    const prompt = `
You are an expert at analyzing payment receipts from Bhutanese mobile banking apps (mBOB, GoBOB, BNB mPay, DK Bank, TPay, eteeru, Drukpay, BDBLePay).

Please extract the following information from this receipt image and return it as a JSON object:

{
  "journal_number": "The journal/RR/RE number from the receipt",
  "amount": "The transaction amount (numeric value only, no currency symbols)",
  "bank_name": "Name of the bank/payment app",
  "transaction_date": "Date of transaction in YYYY-MM-DD format",
}

Important:
- Return ONLY valid JSON, no additional text
- Use null for any field that is not clearly visible or present
- For amount, extract only the numeric value (remove currency symbols like Nu., BTN, etc.)
- Be precise and accurate with the journal number as it's critical for verification

If you cannot read the receipt clearly or it's not a valid payment receipt, return:
{"error": "Unable to extract data from image"}
`;

    // Generate content using Gemini
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean the response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    // Parse the JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      // If JSON parsing fails, try manual parsing as fallback
      console.error("JSON parse error, attempting manual parsing:", parseError);
      extractedData = parseReceiptData(text);
    }

    // Check for error in extraction
    if (extractedData.error) {
      throw new Error(extractedData.error);
    }

    return {
      success: true,
      data: extractedData,
      raw_response: text,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to extract receipt data: ${error.message}`);
  }
};

/**
 * Verify receipt data quality
 * @param {Object} data - Extracted data
 * @returns {Object} Verification result
 */
const verifyReceiptData = (data) => {
  const issues = [];

  if (!data.journal_number) {
    issues.push("Journal number is missing");
  }

  if (!data.amount || data.amount <= 0) {
    issues.push("Valid amount is missing");
  }

  if (!data.bank_name) {
    issues.push("Bank name is missing");
  }

  return {
    is_valid: issues.length === 0,
    issues: issues,
    confidence:
      issues.length === 0 ? "high" : issues.length === 1 ? "medium" : "low",
  };
};

export { extractReceiptData, verifyReceiptData };

import { createTransaction } from "../services/database.service.js";
import {
  extractReceiptData,
  verifyReceiptData,
} from "../services/gemini.service.js";
import { uploadReceiptImage } from "../services/storage.service.js";

/**
 * Upload and scan receipt
 */
const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Upload receipt image to Supabase Storage
    const uploadResult = await uploadReceiptImage(
      req.file.buffer,
      req.file.mimetype,
      req.user.id,
    );

    // Extract data from receipt using Gemini API
    const extractionResult = await extractReceiptData(
      req.file.buffer,
      req.file.mimetype,
    );

    if (!extractionResult.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to extract data from receipt",
      });
    }

    // Verify the extracted data quality
    const verification = verifyReceiptData(extractionResult.data);

    // Get mobile number from request body (optional)
    const mobileNumber = req.body.mobile_number || null;

    res.json({
      success: true,
      message: "Receipt scanned successfully",
      data: {
        extracted_data: extractionResult.data,
        verification: verification,
        raw_response: extractionResult.raw_response,
        receipt_image_url: uploadResult.url,
        mobile_number: mobileNumber,
      },
    });
  } catch (error) {
    console.error("Upload receipt error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing receipt",
      error: error.message,
    });
  }
};

/**
 * Confirm and save transaction
 */
const confirmTransaction = async (req, res) => {
  try {
    const {
      journal_number,
      amount,
      bank_name,
      mobile_number,
      transaction_date,
      raw_extracted_data,
      receipt_image_url,
    } = req.body;

    // Prepare transaction data
    const transactionData = {
      user_id: req.user.id,
      journal_number,
      amount: parseFloat(amount),
      bank_name: bank_name || null,
      mobile_number: mobile_number || null,
      transaction_date: transaction_date
        ? new Date(transaction_date)
        : new Date(),
      receipt_image_url: receipt_image_url || null,
      raw_extracted_data: raw_extracted_data || null,
      verified: true,
    };

    // Save to database
    const transaction = await createTransaction(transactionData);

    res.status(201).json({
      success: true,
      message: "Transaction saved successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Confirm transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving transaction",
      error: error.message,
    });
  }
};

/**
 * Upload and directly save (combined operation)
 */
const uploadAndSave = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Upload receipt image to Supabase Storage
    const uploadResult = await uploadReceiptImage(
      req.file.buffer,
      req.file.mimetype,
      req.user.id,
    );

    // Extract data from receipt
    const extractionResult = await extractReceiptData(
      req.file.buffer,
      req.file.mimetype,
    );

    if (!extractionResult.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to extract data from receipt",
      });
    }

    const extractedData = extractionResult.data;

    // Verify the data
    const verification = verifyReceiptData(extractedData);

    if (!verification.is_valid) {
      return res.status(400).json({
        success: false,
        message: "Extracted data is incomplete",
        data: {
          extracted_data: extractedData,
          verification: verification,
        },
      });
    }

    // Save transaction
    const transactionData = {
      user_id: req.user.id,
      journal_number: extractedData.journal_number,
      amount: parseFloat(extractedData.amount),
      bank_name: extractedData.bank_name || null,
      mobile_number: req.body.mobile_number || null,
      transaction_date: extractedData.transaction_date
        ? new Date(extractedData.transaction_date)
        : new Date(),
      receipt_image_url: uploadResult.url,
      raw_extracted_data: extractionResult.raw_response,
      verified: true,
    };

    const transaction = await createTransaction(transactionData);

    res.status(201).json({
      success: true,
      message: "Receipt processed and transaction saved",
      data: {
        transaction,
        verification,
      },
    });
  } catch (error) {
    console.error("Upload and save error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing and saving receipt",
      error: error.message,
    });
  }
};

export { confirmTransaction, uploadAndSave, uploadReceipt };

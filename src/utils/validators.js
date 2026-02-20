import { body, validationResult } from "express-validator";

// Validation rules for signup
const signupValidation = [
  body("user_name")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("business_name")
    .trim()
    .notEmpty()
    .withMessage("Business name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),
];

// Validation rules for login
const loginValidation = [
  body("user_name").trim().notEmpty().withMessage("Username is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

// Validation rules for transaction confirmation
const confirmTransactionValidation = [
  body("journal_number")
    .trim()
    .notEmpty()
    .withMessage("Journal number is required"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => value > 0)
    .withMessage("Amount must be greater than 0"),

  body("bank_name").optional().trim(),

  body("mobile_number").optional().trim(),

  body("transaction_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  body("raw_extracted_data").optional(),
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

export {
  confirmTransactionValidation,
  loginValidation,
  signupValidation,
  validate,
};

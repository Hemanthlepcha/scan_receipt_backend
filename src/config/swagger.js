import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Receipt Scanner API",
      version: "1.0.0",
      description:
        "Backend API for Bhutanese payment receipt scanning and management system. Upload receipt images and extract transaction data using AI.",
      contact: {
        name: "API Support",
        email: "support@receiptscan.bt",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.receiptscan.bt",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication endpoints",
      },
      {
        name: "Receipts",
        description: "Receipt upload and processing endpoints",
      },
      {
        name: "Dashboard",
        description: "Transaction data and analytics endpoints",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from login/signup",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            user_name: {
              type: "string",
              example: "john_doe",
            },
            business_name: {
              type: "string",
              example: "John's Shop",
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2026-02-20T10:00:00.000Z",
            },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            journal_number: {
              type: "string",
              example: "RR123456789",
            },
            amount: {
              type: "number",
              format: "float",
              example: 1500.0,
            },
            bank_name: {
              type: "string",
              example: "mBOB",
            },
            mobile_number: {
              type: "string",
              example: "17123456",
            },
            transaction_date: {
              type: "string",
              format: "date-time",
            },
            receipt_image_url: {
              type: "string",
              format: "uri",
            },
            verified: {
              type: "boolean",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        ExtractedData: {
          type: "object",
          properties: {
            journal_number: {
              type: "string",
              example: "RR123456789",
              description: "Transaction reference number",
            },
            amount: {
              type: "string",
              example: "1500.00",
              description: "Transaction amount",
            },
            bank_name: {
              type: "string",
              example: "mBOB",
              description: "Bank or payment app name",
            },
            transaction_date: {
              type: "string",
              format: "date",
              example: "2026-02-20",
              description: "Transaction date",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                  },
                  message: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          description: "Check if the API is running",
          tags: ["System"],
          responses: {
            200: {
              description: "API is running",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: {
                        type: "string",
                        example: "ok",
                      },
                      message: {
                        type: "string",
                        example: "Receipt Scanner API is running",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/signup": {
        post: {
          summary: "Register new user",
          description: "Create a new user account",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["user_name", "password", "business_name"],
                  properties: {
                    user_name: {
                      type: "string",
                      minLength: 3,
                      maxLength: 50,
                      example: "john_doe",
                      description:
                        "Username (alphanumeric and underscores only)",
                    },
                    password: {
                      type: "string",
                      minLength: 6,
                      example: "password123",
                      description: "Password (minimum 6 characters)",
                    },
                    business_name: {
                      type: "string",
                      minLength: 2,
                      maxLength: 100,
                      example: "John's Shop",
                      description: "Business name",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "User created successfully",
                      },
                      data: {
                        type: "object",
                        properties: {
                          user: {
                            $ref: "#/components/schemas/User",
                          },
                          token: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            description: "JWT authentication token",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Login user",
          description: "Authenticate user and get JWT token",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["user_name", "password"],
                  properties: {
                    user_name: {
                      type: "string",
                      example: "john_doe",
                    },
                    password: {
                      type: "string",
                      example: "password123",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Login successful",
                      },
                      data: {
                        type: "object",
                        properties: {
                          user: {
                            $ref: "#/components/schemas/User",
                          },
                          token: {
                            type: "string",
                            description: "JWT authentication token",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/me": {
        get: {
          summary: "Get current user",
          description: "Get currently authenticated user information",
          tags: ["Authentication"],
          security: [
            {
              BearerAuth: [],
            },
          ],
          responses: {
            200: {
              description: "User information retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Unauthorized - Invalid or missing token",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/receipts/upload": {
        post: {
          summary: "Upload and scan receipt",
          description:
            "Upload a receipt image and extract transaction data using AI. Returns extracted data for user verification before saving.",
          tags: ["Receipts"],
          security: [
            {
              BearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["receipt"],
                  properties: {
                    receipt: {
                      type: "string",
                      format: "binary",
                      description:
                        "Receipt image file (JPEG, PNG, JPG - max 5MB)",
                    },
                    mobile_number: {
                      type: "string",
                      description:
                        "Customer mobile number (optional - not extracted from receipt)",
                      example: "17123456",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Receipt scanned successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Receipt scanned successfully",
                      },
                      data: {
                        type: "object",
                        properties: {
                          extracted_data: {
                            $ref: "#/components/schemas/ExtractedData",
                          },
                          verification: {
                            type: "object",
                            properties: {
                              is_valid: {
                                type: "boolean",
                                example: true,
                              },
                              issues: {
                                type: "array",
                                items: {
                                  type: "string",
                                },
                              },
                              confidence: {
                                type: "string",
                                enum: ["high", "medium", "low"],
                                example: "high",
                              },
                            },
                          },
                          receipt_image_url: {
                            type: "string",
                            format: "uri",
                            example:
                              "https://project.supabase.co/storage/v1/object/public/receipts/user-id/timestamp.jpg",
                          },
                          mobile_number: {
                            type: "string",
                            example: "17123456",
                            description: "Customer mobile number if provided",
                          },
                          raw_response: {
                            type: "string",
                            description: "Raw AI response",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad request - Invalid file or extraction failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/receipts/confirm": {
        post: {
          summary: "Confirm and save transaction",
          description:
            "Confirm extracted transaction data after user verification and save to database. Use this after /upload endpoint.",
          tags: ["Receipts"],
          security: [
            {
              BearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["journal_number", "amount"],
                  properties: {
                    journal_number: {
                      type: "string",
                      example: "RR123456789",
                      description: "Transaction reference number",
                    },
                    amount: {
                      type: "number",
                      example: 1500.0,
                      description: "Transaction amount",
                    },
                    bank_name: {
                      type: "string",
                      example: "mBOB",
                      description: "Bank or payment app name",
                    },
                    mobile_number: {
                      type: "string",
                      example: "17123456",
                      description:
                        "Customer mobile number (not extracted from receipt)",
                    },
                    transaction_date: {
                      type: "string",
                      format: "date-time",
                      example: "2026-02-20T10:00:00.000Z",
                      description: "Transaction date",
                    },
                    receipt_image_url: {
                      type: "string",
                      format: "uri",
                      description: "URL of the uploaded receipt image",
                    },
                    raw_extracted_data: {
                      type: "object",
                      description: "Raw extracted data from AI",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Transaction saved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Transaction saved successfully",
                      },
                      data: {
                        $ref: "#/components/schemas/Transaction",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/receipts/upload-and-save": {
        post: {
          summary: "Upload and auto-save receipt",
          description:
            "Upload receipt, extract data, and automatically save to database if extraction is successful. Skips user verification step.",
          tags: ["Receipts"],
          security: [
            {
              BearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["receipt"],
                  properties: {
                    receipt: {
                      type: "string",
                      format: "binary",
                      description: "Receipt image file (JPEG, PNG, JPG)",
                    },
                    mobile_number: {
                      type: "string",
                      description: "Customer mobile number (optional)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Receipt processed and saved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Receipt processed and transaction saved",
                      },
                      data: {
                        type: "object",
                        properties: {
                          transaction: {
                            $ref: "#/components/schemas/Transaction",
                          },
                          verification: {
                            type: "object",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Extraction failed or incomplete data",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/api/dashboard/transactions": {
        get: {
          summary: "Get transactions with filters",
          description:
            "Retrieve transactions with flexible filtering options (daily, weekly, monthly, or custom date range) and calculate totals",
          tags: ["Dashboard"],
          security: [
            {
              BearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "query",
              name: "filter",
              schema: {
                type: "string",
                enum: ["daily", "weekly", "monthly", "custom"],
                default: "daily",
              },
              description: "Filter type for transactions",
            },
            {
              in: "query",
              name: "start_date",
              schema: {
                type: "string",
                format: "date",
              },
              description:
                "Start date for custom filter (required if filter=custom)",
            },
            {
              in: "query",
              name: "end_date",
              schema: {
                type: "string",
                format: "date",
              },
              description:
                "End date for custom filter (required if filter=custom)",
            },
          ],
          responses: {
            200: {
              description: "Transactions retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "object",
                        properties: {
                          transactions: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/Transaction",
                            },
                          },
                          summary: {
                            type: "object",
                            properties: {
                              total_transactions: {
                                type: "integer",
                                example: 25,
                              },
                              total_amount: {
                                type: "number",
                                example: 45000.0,
                              },
                              filter_type: {
                                type: "string",
                                example: "daily",
                              },
                              date_range: {
                                type: "object",
                                properties: {
                                  start: {
                                    type: "string",
                                    format: "date-time",
                                  },
                                  end: {
                                    type: "string",
                                    format: "date-time",
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description:
                "Bad request - Invalid filter or missing required dates",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [], // We're defining everything in the definition above
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

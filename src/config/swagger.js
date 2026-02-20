import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bhutan Receipt Scanner API",
      version: "1.0.0",
      description:
        "Automated receipt scanning and transaction management system for Bhutan's digital payment ecosystem using AI-powered data extraction",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login or /api/auth/signup",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "User unique identifier",
            },
            user_name: {
              type: "string",
              description: "Username",
            },
            business_name: {
              type: "string",
              description: "Business name",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
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
              description: "Transaction journal/RR/RE number",
            },
            amount: {
              type: "number",
              format: "decimal",
              description: "Transaction amount",
            },
            bank_name: {
              type: "string",
              description: "Bank or payment app name",
            },
            mobile_number: {
              type: "string",
              description: "Customer mobile number",
            },
            transaction_date: {
              type: "string",
              format: "date-time",
            },
            receipt_image_url: {
              type: "string",
              format: "uri",
              description: "URL to the stored receipt image",
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
              nullable: true,
            },
            amount: {
              type: "string",
              nullable: true,
            },
            bank_name: {
              type: "string",
              nullable: true,
            },
            transaction_date: {
              type: "string",
              nullable: true,
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
            },
            error: {
              type: "string",
            },
          },
        },
      },
    },
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
        description: "Dashboard and analytics endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

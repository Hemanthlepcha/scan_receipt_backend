# Bhutan Receipt Scanner Backend

Automated receipt scanning and transaction management system for Bhutan's digital payment ecosystem.

## Features

- 🔐 User authentication (signup/login)
- 📸 Receipt image upload and scanning
- 🤖 AI-powered data extraction using Google Gemini API
- ✅ Transaction verification workflow
- 💾 Supabase database integration
- 📊 Dashboard with flexible filtering (daily, weekly, monthly, custom)
- 💰 Automatic transaction amount calculations
- 📚 Interactive Swagger API Documentation

## Supported Banks

- mBOB
- GoBOB
- BNB mPay
- DK Bank
- T Bank TPay
- eteeru
- Drukpay
- BDBLePay

## Tech Stack

- Node.js
- Express.js
- Supabase (PostgreSQL)
- Google Gemini API
- JWT Authentication
- Multer (File uploads)

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd scan
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your actual credentials:
   - Supabase URL and keys
   - Gemini API key
   - JWT secret

4. **Set up Supabase database**

   Create the following tables in your Supabase project:

   **users table:**

   ```sql
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_name VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     business_name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

   **transactions table:**

   ```sql
   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     journal_number VARCHAR(255) NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     bank_name VARCHAR(255),
     mobile_number VARCHAR(20),
     transaction_date TIMESTAMP,
     receipt_image_url TEXT,
     raw_extracted_data JSONB,
     verified BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_transactions_user_id ON transactions(user_id);
   CREATE INDEX idx_transactions_date ON transactions(transaction_date);
   CREATE INDEX idx_transactions_created_at ON transactions(created_at);
   ```

5. **Run the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

### 📚 **Interactive API Docs (Swagger UI)**

Once the server is running, access the **interactive API documentation**:

**🔗 http://localhost:3000/api-docs**

Features:

- ✅ **Try out all endpoints** directly from the browser
- ✅ Test with authentication (JWT)
- ✅ Upload files interactively
- ✅ See request/response examples
- ✅ Export OpenAPI spec for other tools

You can also get the raw OpenAPI JSON at: `http://localhost:3000/api-docs.json`

### API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Receipt Management

- `POST /api/receipts/upload` - Upload and scan receipt
- `POST /api/receipts/confirm` - Confirm and save transaction
- `POST /api/receipts/upload-and-save` - Upload and auto-save

### Dashboard

- `GET /api/dashboard/transactions` - Get transactions with filters

For detailed documentation of each endpoint, visit the **Swagger UI** at `/api-docs`.

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

### 🎯 **Best Option: Swagger UI (Recommended)**

The **easiest way** to test the API:

1. Start the server: `npm run dev`
2. Open browser: **http://localhost:3000/api-docs**
3. Click "Authorize" button and enter your JWT token
4. Try any endpoint directly from the browser!

**Benefits:**

- No additional tools needed
- Interactive interface
- Automatic request/response validation
- File upload support built-in
- Save authentication token across requests

---

### Quick Test with HTML Tool

Alternative simple testing:

1. Start the server: `npm run dev`
2. Open `test-upload.html` in your browser
3. Create an account and upload a receipt image

### Test with curl

```bash
# Upload receipt
curl -X POST http://localhost:3000/api/receipts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "receipt=@/path/to/image.jpg"
```

### Test with Postman

Import the endpoints from `postman_collection.json` or the Swagger JSON from `/api-docs.json`.

## License

ISC

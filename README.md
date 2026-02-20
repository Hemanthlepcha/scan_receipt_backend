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

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Receipt Management

- `POST /api/receipts/upload` - Upload and scan receipt
- `POST /api/receipts/confirm` - Confirm and save transaction

### Dashboard

- `GET /api/dashboard/transactions` - Get transactions with filters

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

### Quick Test with HTML Tool

The easiest way to test the API:

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

Import the endpoints from `postman_collection.json` or see detailed instructions in `SETUP_GUIDE.md`.

For complete testing documentation, see [SETUP_GUIDE.md](SETUP_GUIDE.md#step-6-test-the-api).

## License

ISC

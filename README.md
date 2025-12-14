


## Prerequisites

- Node.js (v16 or higher)
- Supabase account (free tier available at https://supabase.com)

## Database Setup

This application uses **Supabase** (PostgreSQL) for data persistence.

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### 2. Run Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL script
4. Verify that all tables were created successfully

### 2.1 If You Get RLS Error (Code 42501)

If you encounter "new row violates row-level security policy" error when creating users:

1. **Read:** `DATABASE_FIX_GUIDE.md`
2. **Quick Fix:** Run `database/migrations/fix_user_creation_rls.sql`
3. **Details:** See `database/README.md`

### 3. Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **anon/public** API key

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`

## Database Services

The application includes complete CRUD services for:

- **Users** (`services/userService.ts`) - User management
- **Products** (`services/productService.ts`) - Product catalog
- **Services** (`services/serviceService.ts`) - Professional services
- **Orders** (`services/orderService.ts`) - Order management

### Example Usage

```typescript
import { createProduct, listProducts } from './services/productService';
import { ProductCategory } from './types';

// Create a new product
const result = await createProduct({
  name: 'Pedra Portuguesa',
  description: 'Pedra ornamental clássica',
  usage: 'Calçadas e jardins',
  measurements: '10x10 cm',
  price: 45.00,
  category: ProductCategory.STONES,
  imageUrl: 'https://example.com/image.jpg',
  unit: 'm²',
  tags: ['branca', 'portuguesa']
});

// List all products
const products = await listProducts();
```

## Project Structure

```
├── database/
│   └── schema.sql          # Database schema and migrations
├── services/
│   ├── supabaseClient.ts   # Database connection
│   ├── userService.ts      # User CRUD operations
│   ├── productService.ts   # Product CRUD operations
│   ├── serviceService.ts   # Service CRUD operations
│   └── orderService.ts     # Order CRUD operations
├── types.ts                # TypeScript type definitions
└── .env.local              # Environment variables (not in git)
```

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

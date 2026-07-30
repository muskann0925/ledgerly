# Ledgerly — Enterprise Billing & Management Platform

Ledgerly is a full-stack, enterprise-grade billing management system designed for businesses to manage clients, quotations, invoices, payments, expenses, taxes, and role-based team management seamlessly.

---

## 🚀 Quick Start & Onboarding Guide

Follow these steps to set up and run Ledgerly on a fresh environment without requiring any manual database inserts or seed scripts.

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** (v14.x or higher running locally or hosted)

---

### 2. Clone the Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/muskann0925/ledgerly.git
cd billing-app

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

---

### 3. Configure Environment Variables

#### Backend Server Configuration (`server/.env`)
Copy the environment template in the `server` directory:

```bash
cd ../server
cp .env.example .env
```

Open `server/.env` and configure your local PostgreSQL database connection string and JWT secrets:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/billing_db?schema=public"

# Frontend Client URL
FRONTEND_URL=http://localhost:5173

# JWT Authentication Secrets (Min 32 characters)
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars_long_change_in_prod
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars_long_change_in_prod
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Development Overrides
ENABLE_REGISTRATION=false
```

#### Frontend Web Configuration (`client/.env`)
Copy the environment template in the `client` directory:

```bash
cd ../client
cp .env.example .env
```

Verify `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

### 4. Database Setup & Prisma Migrations

Make sure your PostgreSQL server is running and the target database exists (or will be created automatically by Prisma).

In the `server` directory, run:

```bash
cd ../server
npx prisma migrate dev --name init
```

*This creates all database tables, relations, and indexes defined in `prisma/schema.prisma` automatically.*

---

### 5. Start Application Servers

#### Start Backend Server
```bash
# In server directory
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

#### Start Frontend Client
In a new terminal:
```bash
# In client directory
npm run dev
```
*(Frontend application runs on `http://localhost:5173`)*

---

### 6. First-User Owner Account Setup

1. Open your browser and navigate to `http://localhost:5173`.
2. Because the database is clean and contains 0 users, the Login page will display a prominent **"Register Account"** button.
3. Click **"Register Account"** (or open `http://localhost:5173/register`).
4. Fill in your Name, Email, and Password, then submit.
5. **Initial Account Privileges**: The platform detects that this is the first user in the database and automatically assigns the **`OWNER`** role with active status.
6. You will be redirected to Sign In. Log in with your new Owner credentials.

---

### 7. Registration Lock & Security

- **Automatic Lock**: Once the first Owner account is registered, public registration is locked automatically.
- **UI Lock**: The **"Register Account"** button disappears from the Login page and is replaced with a notice: *"Registration is disabled. Please contact your administrator."*
- **API Guard**: Direct requests to `POST /auth/register` will be rejected with `403 Forbidden`:
  > `"Registration is disabled. Contact the administrator."`

---

### 8. Managing Additional Users (RBAC Governance)

As an **`OWNER`**, you can provision additional team members directly from the UI without manual database edits:

1. Log into Ledgerly as the **Owner**.
2. Navigate to **User Management** (`/users`) in the sidebar.
3. Click **"Add New User"** to invite team members and assign their specific role.

#### Role Permission Matrix

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **`OWNER`** | **Full System Control** | Complete administrative power, system settings, user management, and demotion/deletion protections. |
| **`ADMIN`** | **Full Operational Access** | Access to clients, quotations, invoices, payments, expenses, taxes, reports, and non-owner user management. |
| **`FINANCE`** | **Financial Operations** | Dedicated access to Payments, Expenses, Tax records, and Financial Reports. |
| **`SALES`** | **Commercial Operations** | Dedicated access to Clients, Quotations, Invoices, and Sales Reports. |
| **`VIEWER`** | **Read-Only Access** | Read-only inspection across business records without mutation rights. |

---

## 🛠️ Tech Stack Overview

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Query, Zustand, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT Authentication, Bcrypt.js, Zod validation.

---

## 🧪 Verification & Build Commands

```bash
# Verify Server Type Checking & Build
cd server
npm run build

# Verify Client Type Checking & Build
cd client
npm run build
```

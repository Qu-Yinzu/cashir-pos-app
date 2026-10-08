CASH-IR: POS & HPP Management System

This is a Next.js project bootstrapped with create-next-app.

🛠️ Tech Stack

Framework: Next.js (App Router, Turbopack)

Database & ORM: Prisma ORM with PostgreSQL / SQLite

Styling: Tailwind CSS

Language: TypeScript / JavaScript

📦 Installation & Setup Guide (How to Restore from GitHub)

If you are pulling this project from GitHub onto a new machine or restoring a backup, follow these steps to get it running:

1. Clone the Repository

Open your terminal and run:

git clone https://github.com/USERNAME_KAMU/cash-ir-pos.git
cd cash-ir-pos


2. Install Dependencies

Install all required project packages:

npm install
# or
yarn install
# or
pnpm install


3. Configure Environment Variables

Create a .env file in the root directory of the project and set your database connection string:

DATABASE_URL="postgresql://user:password@localhost:5432/cash_ir?schema=public"


4. Setup the Database

Generate the Prisma client and push the schema to your database:

npx prisma generate
npx prisma db push


5. Run the Development Server

Start the local development server:

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


Open http://localhost:3000 with your browser to see the application.

📖 How to Use the Application

Dashboard Navigation: Use the sidebar navigation menu to access modules such as POS (Kasir), Products & Stock, HPP & Production, and Business Analytics.

Stock Management: Navigate to Produk & Stok -> Stok tab to manage raw materials, track stock movements (In/Out), and record suppliers.

Product & Recipe Setup: Go to the Produk tab to create menu items, assign multiple categories, and define Bill of Materials (BOM) recipes to automate inventory deduction.

HPP & Costing Analysis: Access HPP & Produksi to monitor margins, check business health indicators, use the Margin Simulation calculator, and manage dynamic overhead costs.

Point of Sale (POS): Use the Kasir menu to process customer orders, select order types, and handle payments.

🚀 Deployment

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js. Make sure to configure your DATABASE_URL environment variable in your Vercel deployment settings.

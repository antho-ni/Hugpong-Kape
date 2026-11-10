# Hugpong Kape

Hugpong Kape is a cafe point-of-sale and student loyalty system built for a school project.

## Features

- PHP and SQLite authentication
- Student registration with school ID verification
- Staff dashboard with role-based access
- Student stamp cards and free-drink rewards
- POS checkout with customer linking and discounts
- Inventory stock management and restocking
- Sales history with customer, items, and cashier details
- Daily sales reports with print support

## Requirements

- Node.js and npm
- PHP 8.2 or newer with SQLite enabled
- XAMPP Apache

## Local setup

1. Clone the repository into the XAMPP `htdocs` directory.
2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Make sure Apache is running in XAMPP. The Vite proxy expects the PHP API at:

   `http://127.0.0.1/Hugpong-Kape/api`

The SQLite database and uploaded student IDs are created at runtime under `data/` and are intentionally excluded from Git.

## Production build

```bash
npm run build
```

## Security notes

- Do not commit `.env` files, databases, uploaded IDs, or credentials.
- Change any development credentials before using the project outside a local school project.
- Keep the `data/` directory protected by Apache configuration.

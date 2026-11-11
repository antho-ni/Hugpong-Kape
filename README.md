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

## Deployment

The React frontend is deployed to Vercel. The PHP API must be deployed separately
to a PHP host with PHP 8.2+, PDO SQLite, writable storage, and HTTPS. SQLite and
uploaded student IDs are persistent files, so do not deploy the API as an
ephemeral serverless function.

1. Deploy the project to Vercel with `npm run build` as the build command and
   `dist` as the output directory.
2. Set the Vercel environment variable `VITE_API_URL` to the public API URL
   including `/api`, for example `https://api.example.com/api`.
3. On the PHP host, set `HK_ALLOWED_ORIGIN` to the exact Vercel URL, for example
   `https://hugpong-kape.vercel.app`.
4. Deploy the `api/` and `data/` directories to the PHP host. Keep `data/`
   writable by PHP and protect the SQLite database and uploaded files from
   direct public access.
5. Redeploy the Vercel project after setting `VITE_API_URL`.

The Vercel frontend and PHP API must use HTTPS so cross-origin login sessions
and school-ID uploads work correctly.

## Security notes

- Do not commit `.env` files, databases, uploaded IDs, or credentials.
- Change any development credentials before using the project outside a local school project.
- Keep the `data/` directory protected by Apache configuration.

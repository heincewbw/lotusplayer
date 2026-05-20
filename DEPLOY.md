# Railway Deployment

## Setup Steps

1. **Create Railway project**
   - Go to [railway.app](https://railway.app) and create a new project
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Copy the `DATABASE_URL` from the PostgreSQL service variables

2. **Deploy the app**
   - Click "Add Service" → "GitHub Repo" → select this repository
   - Railway will auto-detect Next.js and build it

3. **Set environment variables** in Railway dashboard (Variables tab):
   ```
   DATABASE_URL=<paste from PostgreSQL service>
   AUTH_SECRET=<generate with: openssl rand -base64 32>
   AUTH_URL=https://<your-app>.railway.app
   ```

4. **Run migrations** after first deploy via Railway CLI or the service shell:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Default Admin Credentials
- Email: `admin@lotus.com`
- Password: `admin123`
- **Change the password after first login (update in DB directly for now)**

## Build Command (auto-detected)
```
npm run build
```
Which runs: `prisma generate && next build`

## Start Command
```
npm start
```

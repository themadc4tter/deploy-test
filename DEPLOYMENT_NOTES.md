# Deployment Notes

This app is currently built as two separate pieces:

- `client`: the React front end.
- `server`: the Express API and database connection.

Local development currently uses:

```text
React client:  http://localhost:5173
Express API:   http://localhost:3001
Database:      SQLite currently, migrating to PostgreSQL
```

The target deployment database is PostgreSQL.

## Local Development

Run the API server:

```powershell
cd C:\Users\Olivi\Documents\webapp-test\server
npm run dev
```

Run the React client in a second terminal:

```powershell
cd C:\Users\Olivi\Documents\webapp-test\client
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Environment Variables

Environment variables let the same code use different configuration in different places.

For local development, the client talks to:

```text
http://localhost:3001/api
```

For production, the client will need to talk to the deployed API URL instead, for example:

```text
https://your-api-host.example.com/api
```

The client reads this value from:

```text
VITE_API_BASE_URL
```

The server reads its port from:

```text
PORT
```

After the PostgreSQL migration, the server will also read:

```text
DATABASE_URL
```

Example files are included:

```text
client/.env.example
server/.env.example
```

Actual `.env` files are ignored by Git and should not be committed.

## Phase 1: Managed Platform Deployment

Phase 1 uses managed platforms so the first deployment focuses on application concepts instead of Linux server administration.

```text
Browser
  |
Hosted React front end
  |
Hosted Express API
  |
Hosted PostgreSQL database
```

Recommended shape:

```text
React client: Vercel or Netlify
Express API:  Render, Railway, Fly.io, or similar
Database:     hosted PostgreSQL
```

The React front end is built into static files with:

```powershell
cd client
npm run build
```

The result is:

```text
client/dist/
```

A front-end host such as Netlify or Vercel can serve those files.

The Express server stays a running Node.js process. A back-end host such as Render, Railway, or Fly.io can run it with:

```powershell
npm start
```

Phase 1 tasks:

1. Create a short-lived branch such as `deploy/vercel-render`.
2. Migrate the server database layer from SQLite to PostgreSQL.
3. Add `DATABASE_URL` to `server/.env.example`.
4. Configure API CORS for the deployed front-end URL.
5. Deploy the server to Render, Railway, Fly.io, or a similar host.
6. Deploy the client to Vercel or Netlify.
7. Set `VITE_API_BASE_URL` in the front-end host.
8. Test create, edit, complete, undo, and delete on the live app.
9. Merge the deployment branch back into `main`.

## Phase 2: Single VM Deployment

Phase 2 deploys the same app on one rented VM.

Common VM providers include DigitalOcean, Hetzner, Linode/Akamai, Vultr, and AWS Lightsail.

The VM deployment shape will look like this:

```text
One VM
  Reverse proxy: Caddy or Nginx
  React build files: served as static files
  Express API: running as a Node process
  Database: PostgreSQL
```

Phase 2 tasks:

1. Create a short-lived branch such as `deploy/vm`.
2. Choose a VM provider and create a Linux server.
3. Install Node.js, PostgreSQL, and a reverse proxy.
4. Build the React client with `npm run build`.
5. Serve `client/dist/` through the reverse proxy.
6. Run the Express API with systemd or PM2.
7. Configure the reverse proxy to route API traffic to Express.
8. Configure HTTPS.
9. Configure PostgreSQL backups.
10. Merge useful VM config/docs back into `main`.

## SQLite To PostgreSQL

SQLite was useful for learning and local development because it stores data in one file:

```text
server/data/todo-dashboard.sqlite
```

For the hosted app, we will migrate away from SQLite and use PostgreSQL.

Reasons:

- Many hosting platforms have temporary file systems.
- A SQLite file may disappear when the server restarts.
- Multiple server instances may not share the same SQLite file.
- PostgreSQL is designed to be a separate shared production database.

The PostgreSQL version will likely use:

```text
DATABASE_URL
```

as the server-side connection string.

The app concept stays the same:

```text
React calls API
API talks to database
Database stores todos
```

Only the database implementation changes.

## Branching Approach

Do not keep permanent branches for each hosting provider.

Use:

```text
main
  Stable app that should work in all environments.

deploy/vercel-render
  Temporary branch for Phase 1 deployment work.

deploy/vm
  Temporary branch for Phase 2 VM deployment work.
```

After each deployment phase works, merge the branch back into `main`.

## Deployment Preparation Checklist

Before Phase 1 deployment:

1. Migrate SQLite code to PostgreSQL.
2. Add `DATABASE_URL` to `server/.env.example`.
3. Confirm the server still supports `PORT`.
4. Set `VITE_API_BASE_URL` for the hosted client.
5. Configure CORS for the hosted client origin.
6. Run `npm run build` in the client.
7. Run the server with `npm start`.
8. Test the live app end to end.

## Current Status

The project is deployment-aware, but not fully production-deployed yet.

The next major production step is replacing SQLite with PostgreSQL, then deploying Phase 1 with managed platforms.

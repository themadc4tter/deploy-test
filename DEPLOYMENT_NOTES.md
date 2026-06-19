# Deployment Notes

This app is currently built as two separate pieces:

- `client`: the React front end.
- `server`: the Express API and database connection.

Local development currently uses:

```text
React client:  http://localhost:5173
Express API:   http://localhost:3001
Database:      PostgreSQL after the Phase 1 migration
```

SQLite was used earlier in the learning project. The Phase 1 deployment branch migrates the server code to PostgreSQL.

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

The server reads its PostgreSQL connection string from:

```text
DATABASE_URL
```

Some hosted PostgreSQL providers require SSL. The server can opt into that with:

```text
DATABASE_SSL=true
```

The server also reads the deployed client origin from:

```text
CLIENT_ORIGIN
```

Example files are included:

```text
client/.env.example
server/.env.example
```

Actual `.env` files are ignored by Git and should not be committed.

## Phase 1: Render Managed Platform Deployment

Phase 1 uses Render managed services so the first deployment focuses on application concepts instead of Linux server administration.

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
React client: Render Static Site
Express API:  Render Web Service
Database:     Render PostgreSQL
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

Render Static Site can serve those files.

The Express server stays a running Node.js process. Render Web Service can run it with:

```powershell
npm start
```

Phase 1 tasks:

1. Create a short-lived branch such as `deploy/render`.
2. Use the PostgreSQL server database layer.
3. Add `DATABASE_URL` to `server/.env.example`.
4. Configure API CORS with `CLIENT_ORIGIN` for the deployed Render Static Site URL.
5. Deploy the server to Render Web Service.
6. Deploy the client to Render Static Site.
7. Set `VITE_API_BASE_URL` in the Render Static Site environment.
8. Test create, edit, complete, undo, and delete on the live app.
9. Merge the deployment branch back into `main`.

Suggested Render Web Service settings:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Suggested Render Web Service environment variables:

```text
DATABASE_URL=<Render internal database URL>
DATABASE_SSL=false
CLIENT_ORIGIN=<Render Static Site URL after it exists>
```

Do not manually set `PORT` unless Render asks for it. The server already uses Render's provided `PORT`.

Suggested Render Static Site settings:

```text
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

Suggested Render Static Site environment variable:

```text
VITE_API_BASE_URL=<Render Web Service URL>/api
```

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

deploy/render
  Temporary branch for Phase 1 Render deployment work.

deploy/vm
  Temporary branch for Phase 2 VM deployment work.
```

After each deployment phase works, merge the branch back into `main`.

## Deployment Preparation Checklist

Before Phase 1 deployment:

1. Confirm the server uses PostgreSQL.
2. Add `DATABASE_URL` to `server/.env.example`.
3. Confirm the server still supports `PORT`.
4. Set `VITE_API_BASE_URL` for the Render Static Site.
5. Configure `CLIENT_ORIGIN` for the Render Static Site origin.
6. Run `npm run build` in the client.
7. Run the server with `npm start`.
8. Test the live app end to end.

## Current Status

The project is deployment-aware, but not fully production-deployed yet.

The next major production step is replacing SQLite with PostgreSQL, then deploying Phase 1 with managed platforms.

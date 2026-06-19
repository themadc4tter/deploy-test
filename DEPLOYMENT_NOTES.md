# Deployment Notes

This app is currently built as two separate pieces:

- `client`: the React front end.
- `server`: the Express API and SQLite database connection.

Local development uses:

```text
React client:  http://localhost:5173
Express API:   http://localhost:3001
SQLite file:   server/data/todo-dashboard.sqlite
```

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

Example files are included:

```text
client/.env.example
server/.env.example
```

Actual `.env` files are ignored by Git and should not be committed.

## Production Shape

A typical deployed version would look like this:

```text
Browser
  ↓
Hosted React front end
  ↓
Hosted Express API
  ↓
Hosted production database
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

## SQLite vs PostgreSQL

SQLite is useful for learning and local development because it stores data in one file:

```text
server/data/todo-dashboard.sqlite
```

For a real public deployment, PostgreSQL is usually a better fit.

Reasons:

- Many hosting platforms have temporary file systems.
- A SQLite file may disappear when the server restarts.
- Multiple server instances may not share the same SQLite file.
- PostgreSQL is designed to be a separate shared production database.

The app concept stays the same:

```text
React calls API
API talks to database
Database stores todos
```

Only the database implementation changes.

## Deployment Preparation Checklist

Before deploying publicly:

1. Choose a front-end host.
2. Choose a back-end host.
3. Choose a production database.
4. Set `VITE_API_BASE_URL` for the hosted client.
5. Set `PORT` if the back-end host requires it.
6. Replace local SQLite with PostgreSQL or confirm the host supports persistent SQLite storage.
7. Run `npm run build` in the client.
8. Run the server with `npm start`.

## Current Status

The project is deployment-aware, but not fully production-deployed yet.

The next major production step would be replacing SQLite with PostgreSQL or choosing a host that provides reliable persistent storage for SQLite.

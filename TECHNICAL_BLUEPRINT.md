# Technical Blueprint: Anonymous Dashboard To-Do App

## 1. Purpose

This blueprint turns the PRD into a concrete build plan.

The app will be a full-stack JavaScript project with:

- A React front end for the dashboard.
- An Express back end for the API.
- A database layer that started with SQLite for local learning and will migrate to PostgreSQL for deployment.

The first version is intentionally small, but it uses the same basic structure as many real web apps.

## 2. Project Structure

The project will use two main folders:

```text
webapp-test/
  PRD.md
  TECHNICAL_BLUEPRINT.md

  client/
    React front end

  server/
    Express API back end
```

The front end and back end will run as two separate local development servers:

```text
React/Vite front end:
  http://localhost:5173

Express API back end:
  http://localhost:3001
```

This separation makes it easier to understand which part of the app is responsible for which job.

## 3. Data Model

The app needs one database table: `todos`.

### Table: `todos`

Initial SQLite version:

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT
);
```

Target PostgreSQL version:

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);
```

### Field Meanings

- `id`: unique number for each to-do.
- `visitor_id`: anonymous browser ID that groups to-dos by visitor.
- `title`: the visible to-do text.
- `completed`: whether the to-do is active or completed.
- `created_at`: when the to-do was created.
- `completed_at`: when the to-do was completed, or `NULL` if it is active.

SQLite uses `0` and `1` for `completed`. PostgreSQL supports a real `BOOLEAN` type, so the migrated version will store `TRUE` or `FALSE`.

## 4. API Contract

The front end will talk to the back end using JSON over HTTP.

Every request that reads or changes to-dos must include a `visitorId`, so the server knows which anonymous visitor owns the data.

For the first version, the `visitorId` will be sent in a custom HTTP header:

```text
x-visitor-id: abc-123
```

Using a header keeps the request bodies focused on the actual to-do data.

## 5. API Routes

### Health Check

Used to confirm the server is running.

```text
GET /api/health
```

Example response:

```json
{
  "status": "ok"
}
```

### Get To-Dos

Gets all to-dos for the current anonymous visitor.

```text
GET /api/todos
```

Required header:

```text
x-visitor-id: abc-123
```

Example response:

```json
[
  {
    "id": 1,
    "visitorId": "abc-123",
    "title": "Book dentist appointment",
    "completed": false,
    "createdAt": "2026-05-18T10:00:00.000Z",
    "completedAt": null
  }
]
```

### Create To-Do

Creates a new active to-do.

```text
POST /api/todos
```

Required header:

```text
x-visitor-id: abc-123
```

Request body:

```json
{
  "title": "Book dentist appointment"
}
```

Example response:

```json
{
  "id": 1,
  "visitorId": "abc-123",
  "title": "Book dentist appointment",
  "completed": false,
  "createdAt": "2026-05-18T10:00:00.000Z",
  "completedAt": null
}
```

### Update To-Do

Updates a to-do title, completion state, or both.

```text
PATCH /api/todos/:id
```

Required header:

```text
x-visitor-id: abc-123
```

Request body examples:

```json
{
  "title": "Book annual dentist appointment"
}
```

```json
{
  "completed": true
}
```

```json
{
  "title": "Book annual dentist appointment",
  "completed": true
}
```

Example response:

```json
{
  "id": 1,
  "visitorId": "abc-123",
  "title": "Book annual dentist appointment",
  "completed": true,
  "createdAt": "2026-05-18T10:00:00.000Z",
  "completedAt": "2026-05-18T10:15:00.000Z"
}
```

### Delete To-Do

Deletes a to-do.

```text
DELETE /api/todos/:id
```

Required header:

```text
x-visitor-id: abc-123
```

Example response:

```json
{
  "success": true
}
```

## 6. API Validation Rules

The back end should reject invalid requests.

Rules:

- `visitorId` is required for all to-do routes.
- `title` must be a non-empty string.
- `title` should be trimmed before saving.
- `title` should have a maximum length, such as 120 characters.
- `completed` must be a boolean when provided.
- A visitor can only update or delete their own to-dos.

This prevents accidental bad data and makes the API behavior predictable.

## 7. Front-End Structure

The React app will be split into small components.

```text
client/src/
  App.jsx
  main.jsx
  api/
    todosApi.js
  components/
    DashboardHeader.jsx
    TodoForm.jsx
    TodoSection.jsx
    TodoItem.jsx
  utils/
    visitorId.js
  styles.css
```

### Component Responsibilities

`App.jsx`

- Main page component.
- Loads to-dos from the API.
- Stores the current list of to-dos in React state.
- Passes data and event functions to child components.

`DashboardHeader.jsx`

- Displays the dashboard title and summary counts.

`TodoForm.jsx`

- Contains the input for adding a new to-do.
- Calls a function from `App.jsx` when the user submits.

`TodoSection.jsx`

- Displays either active or completed to-dos.
- Receives a list of to-dos and renders `TodoItem` components.

`TodoItem.jsx`

- Displays one to-do.
- Handles edit mode for the title.
- Provides buttons for complete, undo, save, cancel, and delete.

`api/todosApi.js`

- Contains all `fetch()` calls to the Express API.
- Keeps API request details out of the UI components.

`utils/visitorId.js`

- Creates or retrieves the anonymous `visitorId` from `localStorage`.

## 8. React State Plan

The main app state will live in `App.jsx`.

```js
const [todos, setTodos] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState("");
```

Meaning:

- `todos`: the current list of to-dos from the database.
- `isLoading`: whether the app is waiting for the API.
- `errorMessage`: message to show if something goes wrong.

Derived values:

```js
const activeTodos = todos.filter((todo) => !todo.completed);
const completedTodos = todos.filter((todo) => todo.completed);
```

These are called derived values because they are calculated from existing state instead of stored separately.

## 9. Back-End Structure

The Express app will be organized like this:

```text
server/
  package.json
  src/
    server.js
    db.js
    routes/
      todos.js
```

### File Responsibilities

`server.js`

- Creates the Express app.
- Enables JSON request bodies.
- Enables CORS so the React dev server can call the API.
- Mounts API routes.
- Starts the server on port `3001`.

`db.js`

- Opens the database connection.
- Creates the `todos` table if it does not exist.
- Exports database helper functions.

`routes/todos.js`

- Defines all `/api/todos` routes.
- Validates request data.
- Calls the database.
- Sends JSON responses.

## 10. Local Development Flow

The app will run with two terminal commands:

```text
Terminal 1:
  cd server
  npm run dev

Terminal 2:
  cd client
  npm run dev
```

Then the user opens:

```text
http://localhost:5173
```

The browser loads the React app, and React calls the API at:

```text
http://localhost:3001
```

## 11. Implementation Order

We will build in small, understandable steps.

### Step 1: Create the Server

- Initialize the `server` package.
- Install Express, CORS, database dependencies, and a development runner.
- Add `GET /api/health`.
- Confirm the API returns `{ "status": "ok" }`.

### Step 2: Add the Database

- Create `db.js`.
- Connect to the database.
- Create the `todos` table.
- Confirm the server starts and initializes the database.

### Step 3: Add To-Do API Routes

- Add `GET /api/todos`.
- Add `POST /api/todos`.
- Add `PATCH /api/todos/:id`.
- Add `DELETE /api/todos/:id`.
- Test the routes before building the front end.

### Step 4: Create the React App

- Initialize the `client` package with Vite.
- Create the basic dashboard layout.
- Add placeholder active and completed sections.

### Step 5: Add Anonymous Visitor ID

- Create `visitorId.js`.
- Store the anonymous ID in browser `localStorage`.
- Include it in API requests.

### Step 6: Connect React to the API

- Fetch existing to-dos on page load.
- Add new to-dos.
- Complete and undo to-dos.
- Edit titles.
- Delete to-dos.

### Step 7: Polish the Dashboard UI

- Style the dashboard.
- Make active and completed sections visually distinct.
- Add loading and error states.
- Keep the layout responsive for smaller screens.

### Step 8: Prepare for Deployment

- Explain environment variables.
- Explain the two deployment phases.
- Migrate the server database layer from SQLite to PostgreSQL.
- Deploy the front end, back end, and PostgreSQL database on managed platforms.
- Later, deploy the same app on a rented VM.

## 12. Deployment Plan

The deployment plan has two phases.

### Phase 1: Managed Platforms

Use managed services so the first deployment focuses on application deployment rather than server administration.

```text
React client: Render Static Site
Express API: Render Web Service
Database: Render PostgreSQL
```

This phase will require:

- migrating the server from SQLite to PostgreSQL;
- adding a `DATABASE_URL` environment variable;
- setting `VITE_API_BASE_URL` on the Render Static Site to the deployed API URL;
- configuring `CLIENT_ORIGIN` on the Render Web Service so the API accepts browser requests from the Render Static Site;
- verifying the live app can create, update, complete, and delete to-dos.

### Phase 2: Single VM

After Phase 1 works, deploy the same application to a rented VM.

```text
One VM
  Reverse proxy: Caddy or Nginx
  React build files: served as static files
  Express API: running as a Node process
  Database: PostgreSQL
```

This phase will teach:

- Linux server setup;
- firewall basics;
- process management with systemd or PM2;
- reverse proxy routing;
- HTTPS certificates;
- PostgreSQL backups and maintenance.

The important concept will stay the same:

```text
React calls API
API talks to database
database stores to-dos
```

The same `main` branch should remain the stable app. Deployment work can happen on short-lived branches, such as `deploy/render` and `deploy/vm`, then merge back into `main` after each phase works.

## 13. Build Principles

While building, we will keep these principles:

- Write plain JavaScript, not TypeScript.
- Add clear comments where React or Express concepts are new.
- Keep files small and purposeful.
- Build one layer at a time.
- Test the back end before connecting the front end.
- Keep the first version focused on the agreed scope.

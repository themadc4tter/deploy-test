# PRD: Anonymous Dashboard To-Do App

## 1. Product Summary

The product is a simple anonymous to-do web app with a dashboard-style interface.

The first version allows a visitor to manage one-off to-dos without creating an account. The app will include a React front end, an Express API back end, and a database so the project teaches the core components of a real full-stack web application.

## 2. Learning Goals

This project is intended to teach the main parts of a modern web app:

- Front end: the browser interface the user sees and interacts with.
- Back end: the server that handles application logic.
- API: the contract between the front end and back end.
- Database: persistent storage for to-dos.
- Deployment: the process of making the app available online.

The app should be built in a beginner-friendly way, with clear comments in the code. The learner has experience with Python and JavaScript, but no prior experience with React, Express, or deployment platforms.

## 3. Target User

The target user is an individual who wants a lightweight personal to-do list without signing up or logging in.

For the learning version, the actual productivity value of the app is secondary. The app mainly exists as a clear, realistic teaching project.

## 4. Core User Experience

When a visitor opens the app, they see a dashboard with:

- A way to add a new to-do.
- A section for active to-dos.
- A separate section for completed to-dos.

The visitor can create, edit, complete, undo completion, and delete to-dos.

## 5. First Version Scope

The first version will include:

- Anonymous usage with no login.
- One-off to-dos, not repeatable habits.
- To-dos with a title only.
- Active and completed sections.
- Add to-do.
- Edit to-do title.
- Mark to-do as complete.
- Move completed to-dos into a completed section.
- Undo completion.
- Delete to-do.
- Persistent storage using a database.

## 6. Out of Scope for First Version

The first version will not include:

- User accounts.
- Login or authentication.
- Passwords.
- Email.
- Multiple lists or projects.
- Due dates.
- Priorities.
- Tags.
- Notes or descriptions.
- Notifications or reminders.
- Recurring habits.
- Streaks or analytics.

These features may be added later after the core full-stack flow is understood.

## 7. Anonymous Identity

Because the first version does not include user accounts, the app will identify each visitor with a browser-generated anonymous ID.

The planned approach is:

- When someone first visits the app, the front end creates a random `visitorId`.
- The front end stores that `visitorId` in browser `localStorage`.
- API requests include the `visitorId`.
- The database stores each to-do with the matching `visitorId`.

Later, this can evolve into a real account system by linking to-dos to a `userId` instead of, or in addition to, a `visitorId`.

## 8. Proposed Tech Stack

The agreed application stack is:

- Front end: React with Vite, using plain JavaScript.
- Back end: Node.js with Express.
- Database: PostgreSQL for deployment and production-like development.

SQLite was used as an early local learning database because it is simple and file-based. The project will now migrate away from SQLite so the deployed app uses the same kind of database that real hosted applications commonly use.

Deployment will use two learning phases:

- Front end hosting: Render Static Site.
- Back end hosting: Render Web Service.
- Database hosting: Render PostgreSQL.
- Later infrastructure practice: a single rented VM running the front end, API, and database stack.

## 9. Example To-Do Data

A to-do should have this general shape:

```js
{
  id: 1,
  visitorId: "abc-123",
  title: "Book dentist appointment",
  completed: false,
  createdAt: "2026-05-18T10:00:00.000Z",
  completedAt: null
}
```

## 10. High-Level Architecture

```text
React front end
  Displays the dashboard.
  Sends API requests when the user creates, edits, completes, or deletes a to-do.

Express API
  Receives requests from the front end.
  Validates the incoming data.
  Reads from and writes to the database.
  Sends JSON responses back to the front end.

PostgreSQL database
  Stores to-dos persistently for deployed use.

Browser localStorage
  Stores the anonymous visitorId.
```

## 11. Initial API Ideas

The exact API contract will be defined in the technical blueprint, but the expected routes are:

- `GET /api/todos`
- `POST /api/todos`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`

## 12. Success Criteria

The first version is successful when:

- A visitor can open the app and see a dashboard.
- A visitor can add a to-do with a title.
- Active to-dos appear in the active section.
- Completed to-dos appear in the completed section.
- A visitor can edit a to-do title.
- A visitor can delete a to-do.
- To-dos persist after refreshing the page.
- The code is clear enough for a beginner to follow.
- The app structure makes the roles of front end, back end, API, and database understandable.

## 13. Next Step

The next step is to create the technical blueprint:

1. Define the database table.
2. Define the API contract.
3. Define the React component structure.
4. Define the project folder structure.
5. Define the implementation order.

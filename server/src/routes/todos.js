import express from "express";
import { getDatabase } from "../db.js";

const router = express.Router();
const MAX_TITLE_LENGTH = 120;

function getVisitorId(request) {
  // Express lowercases request header names, so x-visitor-id is safe to read
  // even if the browser sends it with different capitalization.
  const visitorId = request.header("x-visitor-id");

  if (!visitorId || typeof visitorId !== "string" || visitorId.trim() === "") {
    return null;
  }

  return visitorId.trim();
}

function validateTitle(title) {
  // This helper keeps title rules in one place so create and update behave
  // consistently.
  if (typeof title !== "string") {
    return {
      isValid: false,
      message: "Title must be text."
    };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    return {
      isValid: false,
      message: "Title is required."
    };
  }

  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return {
      isValid: false,
      message: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`
    };
  }

  return {
    isValid: true,
    title: trimmedTitle
  };
}

function mapTodoRow(row) {
  // The database uses snake_case column names and 0/1 for booleans.
  // The API returns camelCase names and true/false for easier front-end use.
  return {
    id: row.id,
    visitorId: row.visitor_id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    completedAt: row.completed_at
  };
}

function requireVisitorId(request, response) {
  const visitorId = getVisitorId(request);

  if (!visitorId) {
    response.status(400).json({
      error: "x-visitor-id header is required."
    });
    return null;
  }

  return visitorId;
}

router.get("/", async (request, response) => {
  const visitorId = requireVisitorId(request, response);

  if (!visitorId) {
    return;
  }

  const database = getDatabase();
  const rows = await database.all(
    `
      SELECT id, visitor_id, title, completed, created_at, completed_at
      FROM todos
      WHERE visitor_id = ?
      ORDER BY completed ASC, created_at DESC
    `,
    visitorId
  );

  response.json(rows.map(mapTodoRow));
});

router.post("/", async (request, response) => {
  const visitorId = requireVisitorId(request, response);

  if (!visitorId) {
    return;
  }

  const titleResult = validateTitle(request.body.title);

  if (!titleResult.isValid) {
    response.status(400).json({
      error: titleResult.message
    });
    return;
  }

  const database = getDatabase();
  const createdAt = new Date().toISOString();

  const result = await database.run(
    `
      INSERT INTO todos (visitor_id, title, completed, created_at, completed_at)
      VALUES (?, ?, 0, ?, NULL)
    `,
    visitorId,
    titleResult.title,
    createdAt
  );

  const row = await database.get(
    `
      SELECT id, visitor_id, title, completed, created_at, completed_at
      FROM todos
      WHERE id = ? AND visitor_id = ?
    `,
    result.lastID,
    visitorId
  );

  response.status(201).json(mapTodoRow(row));
});

router.patch("/:id", async (request, response) => {
  const visitorId = requireVisitorId(request, response);

  if (!visitorId) {
    return;
  }

  const todoId = Number(request.params.id);

  if (!Number.isInteger(todoId)) {
    response.status(400).json({
      error: "To-do id must be a number."
    });
    return;
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(request.body, "title");
  const hasCompleted = Object.prototype.hasOwnProperty.call(
    request.body,
    "completed"
  );

  if (!hasTitle && !hasCompleted) {
    response.status(400).json({
      error: "Request must include title, completed, or both."
    });
    return;
  }

  const updates = [];
  const values = [];

  if (hasTitle) {
    const titleResult = validateTitle(request.body.title);

    if (!titleResult.isValid) {
      response.status(400).json({
        error: titleResult.message
      });
      return;
    }

    updates.push("title = ?");
    values.push(titleResult.title);
  }

  if (hasCompleted) {
    if (typeof request.body.completed !== "boolean") {
      response.status(400).json({
        error: "Completed must be true or false."
      });
      return;
    }

    updates.push("completed = ?");
    values.push(request.body.completed ? 1 : 0);

    updates.push("completed_at = ?");
    values.push(request.body.completed ? new Date().toISOString() : null);
  }

  const database = getDatabase();

  const result = await database.run(
    `
      UPDATE todos
      SET ${updates.join(", ")}
      WHERE id = ? AND visitor_id = ?
    `,
    ...values,
    todoId,
    visitorId
  );

  if (result.changes === 0) {
    response.status(404).json({
      error: "To-do not found."
    });
    return;
  }

  const row = await database.get(
    `
      SELECT id, visitor_id, title, completed, created_at, completed_at
      FROM todos
      WHERE id = ? AND visitor_id = ?
    `,
    todoId,
    visitorId
  );

  response.json(mapTodoRow(row));
});

router.delete("/:id", async (request, response) => {
  const visitorId = requireVisitorId(request, response);

  if (!visitorId) {
    return;
  }

  const todoId = Number(request.params.id);

  if (!Number.isInteger(todoId)) {
    response.status(400).json({
      error: "To-do id must be a number."
    });
    return;
  }

  const database = getDatabase();
  const result = await database.run(
    `
      DELETE FROM todos
      WHERE id = ? AND visitor_id = ?
    `,
    todoId,
    visitorId
  );

  if (result.changes === 0) {
    response.status(404).json({
      error: "To-do not found."
    });
    return;
  }

  response.json({
    success: true
  });
});

export default router;

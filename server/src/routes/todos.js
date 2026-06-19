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
  const createdAt =
    row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at;
  const completedAt =
    row.completed_at instanceof Date
      ? row.completed_at.toISOString()
      : row.completed_at;

  // The database uses snake_case column names.
  // The API returns camelCase names and true/false for easier front-end use.
  return {
    id: row.id,
    visitorId: row.visitor_id,
    title: row.title,
    completed: row.completed,
    createdAt,
    completedAt
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
  const result = await database.query(
    `
      SELECT id, visitor_id, title, completed, created_at, completed_at
      FROM todos
      WHERE visitor_id = $1
      ORDER BY completed ASC, created_at DESC
    `,
    [visitorId]
  );

  response.json(result.rows.map(mapTodoRow));
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
  const createdAt = new Date();

  const result = await database.query(
    `
      INSERT INTO todos (visitor_id, title, completed, created_at, completed_at)
      VALUES ($1, $2, FALSE, $3, NULL)
      RETURNING id, visitor_id, title, completed, created_at, completed_at
    `,
    [visitorId, titleResult.title, createdAt]
  );

  response.status(201).json(mapTodoRow(result.rows[0]));
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

    values.push(titleResult.title);
    updates.push(`title = $${values.length}`);
  }

  if (hasCompleted) {
    if (typeof request.body.completed !== "boolean") {
      response.status(400).json({
        error: "Completed must be true or false."
      });
      return;
    }

    values.push(request.body.completed);
    updates.push(`completed = $${values.length}`);

    values.push(request.body.completed ? new Date() : null);
    updates.push(`completed_at = $${values.length}`);
  }

  const database = getDatabase();
  values.push(todoId, visitorId);

  const result = await database.query(
    `
      UPDATE todos
      SET ${updates.join(", ")}
      WHERE id = $${values.length - 1} AND visitor_id = $${values.length}
      RETURNING id, visitor_id, title, completed, created_at, completed_at
    `,
    values
  );

  if (result.rowCount === 0) {
    response.status(404).json({
      error: "To-do not found."
    });
    return;
  }

  response.json(mapTodoRow(result.rows[0]));
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
  const result = await database.query(
    `
      DELETE FROM todos
      WHERE id = $1 AND visitor_id = $2
    `,
    [todoId, visitorId]
  );

  if (result.rowCount === 0) {
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

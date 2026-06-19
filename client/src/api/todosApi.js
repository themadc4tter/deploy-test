// Vite exposes client-side environment variables through import.meta.env.
// The fallback keeps local development working even before a .env file exists.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const { visitorId, headers, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-visitor-id": visitorId,
      ...headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    // The Express API returns errors as JSON, such as { error: "Title is required." }.
    // Throwing here lets App.jsx handle all API failures in one consistent way.
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export function getTodos(visitorId) {
  return request("/todos", {
    visitorId
  });
}

export function createTodo(visitorId, title) {
  return request("/todos", {
    method: "POST",
    visitorId,
    body: JSON.stringify({
      title
    })
  });
}

export function updateTodo(visitorId, todoId, updates) {
  return request(`/todos/${todoId}`, {
    method: "PATCH",
    visitorId,
    body: JSON.stringify(updates)
  });
}

export function deleteTodo(visitorId, todoId) {
  return request(`/todos/${todoId}`, {
    method: "DELETE",
    visitorId
  });
}

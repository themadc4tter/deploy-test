import { useState } from "react";

function TodoForm({ onCreateTodo, isSaving }) {
  const [title, setTitle] = useState("");

  async function handleSubmit(event) {
    // Forms normally reload the page when submitted.
    // React apps usually prevent that and handle the submission in JavaScript.
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const wasCreated = await onCreateTodo(trimmedTitle);

    if (wasCreated) {
      setTitle("");
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label htmlFor="new-todo">New to-do</label>

      <div className="todo-form-row">
        <input
          id="new-todo"
          name="title"
          type="text"
          placeholder="Add a one-off task..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSaving}
        />

        <button type="submit" disabled={isSaving || title.trim().length === 0}>
          {isSaving ? "Adding..." : "Add"}
        </button>
      </div>

      <p className="form-hint">Saved to the local SQLite-backed API.</p>
    </form>
  );
}

export default TodoForm;

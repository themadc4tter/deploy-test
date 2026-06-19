import { useState } from "react";

function TodoItem({
  todo,
  onToggleTodo,
  onRenameTodo,
  onDeleteTodo,
  isPending
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);

  async function handleSave() {
    const trimmedTitle = draftTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    const wasRenamed = await onRenameTodo(todo, trimmedTitle);

    if (wasRenamed) {
      setIsEditing(false);
    }
  }

  function handleCancel() {
    setDraftTitle(todo.title);
    setIsEditing(false);
  }

  return (
    <li className="todo-item">
      <span
        className={todo.completed ? "status-dot status-dot-complete" : "status-dot"}
        aria-hidden="true"
      />

      {isEditing ? (
        <label className="edit-field">
          <span className="sr-only">Edit title for {todo.title}</span>
          <input
            className="todo-edit-input"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSave();
              }

              if (event.key === "Escape") {
                handleCancel();
              }
            }}
            disabled={isPending}
            autoFocus
          />
        </label>
      ) : (
        <span className={todo.completed ? "todo-title todo-title-complete" : "todo-title"}>
          {todo.title}
        </span>
      )}

      <div className="todo-actions" aria-label={`Actions for ${todo.title}`}>
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || draftTitle.trim().length === 0}
              className="button-primary"
            >
              {isPending ? "Saving..." : "Save"}
            </button>

            <button type="button" onClick={handleCancel} disabled={isPending}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onToggleTodo(todo)}
              disabled={isPending}
              className={todo.completed ? "" : "button-primary"}
            >
              {isPending ? "Working..." : todo.completed ? "Undo" : "Complete"}
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isPending}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDeleteTodo(todo)}
              disabled={isPending}
              className="button-danger"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TodoItem;

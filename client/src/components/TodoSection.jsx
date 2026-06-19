import TodoItem from "./TodoItem.jsx";

function TodoSection({
  title,
  description,
  todos,
  emptyMessage,
  onToggleTodo,
  onRenameTodo,
  onDeleteTodo,
  pendingTodoId
}) {
  return (
    <section className="todo-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span className="count-badge">{todos.length}</span>
      </div>

      {todos.length === 0 ? (
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            // The key tells React which list item is which when the list changes.
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleTodo={onToggleTodo}
              onRenameTodo={onRenameTodo}
              onDeleteTodo={onDeleteTodo}
              isPending={pendingTodoId === todo.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default TodoSection;

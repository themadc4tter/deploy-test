import { useCallback, useEffect, useState } from "react";
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo
} from "./api/todosApi.js";
import DashboardHeader from "./components/DashboardHeader.jsx";
import TodoForm from "./components/TodoForm.jsx";
import TodoSection from "./components/TodoSection.jsx";
import { getOrCreateVisitorId } from "./utils/visitorId.js";

function App() {
  // useState lets React remember values between renders.
  // The function form runs only when the component first appears.
  const [visitorId] = useState(() => getOrCreateVisitorId());
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingTodoId, setPendingTodoId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const loadedTodos = await getTodos(visitorId);
      setTodos(loadedTodos);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [visitorId]);

  // useEffect runs after React draws the page.
  // Here, it loads the visitor's todos from the API when the app starts.
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function handleCreateTodo(title) {
    try {
      setIsSaving(true);
      setErrorMessage("");

      const createdTodo = await createTodo(visitorId, title);
      setTodos((currentTodos) => [createdTodo, ...currentTodos]);
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleTodo(todo) {
    try {
      setPendingTodoId(todo.id);
      setErrorMessage("");

      const updatedTodo = await updateTodo(visitorId, todo.id, {
        completed: !todo.completed
      });

      setTodos((currentTodos) =>
        currentTodos.map((currentTodo) =>
          currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setPendingTodoId(null);
    }
  }

  async function handleRenameTodo(todo, title) {
    try {
      setPendingTodoId(todo.id);
      setErrorMessage("");

      const updatedTodo = await updateTodo(visitorId, todo.id, {
        title
      });

      setTodos((currentTodos) =>
        currentTodos.map((currentTodo) =>
          currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo
        )
      );
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setPendingTodoId(null);
    }
  }

  async function handleDeleteTodo(todo) {
    try {
      setPendingTodoId(todo.id);
      setErrorMessage("");

      await deleteTodo(visitorId, todo.id);
      setTodos((currentTodos) =>
        currentTodos.filter((currentTodo) => currentTodo.id !== todo.id)
      );
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setPendingTodoId(null);
    }
  }

  // These are derived values: they are calculated from todos instead of stored
  // as separate state. That avoids keeping duplicate state in sync.
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <main className="app-shell">
      <DashboardHeader
        activeCount={activeTodos.length}
        completedCount={completedTodos.length}
        visitorId={visitorId}
      />

      {errorMessage ? (
        <div className="error-message" role="alert">
          <span>{errorMessage}</span>
          <button type="button" onClick={loadTodos}>
            Retry
          </button>
        </div>
      ) : null}

      <TodoForm onCreateTodo={handleCreateTodo} isSaving={isSaving} />

      {isLoading ? (
        <p className="loading-state">Loading your to-dos...</p>
      ) : (
        <section className="todo-grid" aria-label="To-do sections">
          <TodoSection
            title="Active"
            description="Work that still needs attention."
            todos={activeTodos}
            emptyMessage="No active to-dos yet."
            onToggleTodo={handleToggleTodo}
            onRenameTodo={handleRenameTodo}
            onDeleteTodo={handleDeleteTodo}
            pendingTodoId={pendingTodoId}
          />

          <TodoSection
            title="Completed"
            description="Finished items stay visible here."
            todos={completedTodos}
            emptyMessage="Completed to-dos will appear here."
            onToggleTodo={handleToggleTodo}
            onRenameTodo={handleRenameTodo}
            onDeleteTodo={handleDeleteTodo}
            pendingTodoId={pendingTodoId}
          />
        </section>
      )}
    </main>
  );
}

export default App;

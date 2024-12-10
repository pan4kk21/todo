import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8000"; // Адрес вашего FastAPI сервера

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isTaskAdding, setIsTaskAdding] = useState(false);

  // Получить список задач
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Ошибка при загрузке задач:", error);
    }
  };

  // Добавить новую задачу
  const addTask = async (e) => {
    e.preventDefault();
    setIsTaskAdding(true); // Начать анимацию добавления задачи
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        fetchTasks(); // Обновить список задач
      }
    } catch (error) {
      console.error("Ошибка при добавлении задачи:", error);
    } finally {
      setIsTaskAdding(false); // Завершить анимацию добавления задачи
    }
  };

  // Отметить задачу как выполненную
  const markAsCompleted = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchTasks(); // Обновить список задач
      } else {
        console.error("Не удалось обновить задачу");
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  // Удалить задачу
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchTasks(); // Обновить список задач
      } else {
        console.error("Не удалось удалить задачу");
      }
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  // Загрузка задач при загрузке приложения
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          {/* Список задач */}
          <div className="mb-6">
            {tasks.length > 0 ? (
                <ul className="space-y-4">
                  {tasks.map((task) => (
                      <li
                          key={task.id}
                          className="p-4 bg-gray-50 border rounded-lg shadow-md flex justify-between items-center transition-all duration-500 transform hover:scale-105"
                      >
                        <div>
                          <h3 className="font-bold text-gray-800">{task.title}</h3>
                          <p className="text-sm text-gray-500">
                            {task.description || "No description"}
                          </p>
                        </div>
                        <div className="flex space-x-2 items-center">
                    <span
                        className={`text-xs font-semibold px-3 py-1 rounded ${
                            task.completed
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                      {task.completed ? "Completed" : "Incomplete"}
                    </span>
                          {!task.completed && (
                              <button
                                  onClick={() => markAsCompleted(task.id)}
                                  className="text-xs px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-md hover:bg-green-200 transition"
                              >
                                Complete
                              </button>
                          )}
                          <button
                              onClick={() => deleteTask(task.id)}
                              className="text-xs px-3 py-1 bg-red-100 text-red-700 font-semibold rounded-md hover:bg-red-200 transition"
                          >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-4 h-4"
                            >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </li>
                  ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500">No tasks found.</p>
            )}
          </div>

          {/* Форма добавления задачи */}
          <form onSubmit={addTask} className="space-y-4">
            <div>
              <input
                  type="text"
                  placeholder="Task Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 transition-all"
                  required
              />
            </div>
            <div>
            <textarea
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 transition-all"
            ></textarea>
            </div>
            <button
                type="submit"
                disabled={isTaskAdding}
                className={`text-sm px-4 py-3 bg-blue-100 text-blue-700 font-semibold rounded-md hover:bg-blue-200 transition-all w-full ${
                    isTaskAdding ? "opacity-50 cursor-not-allowed" : "opacity-100"
                }`}
            >
              {isTaskAdding ? "Adding..." : "Add Task"}
            </button>
          </form>
        </div>
      </div>
  );
}

export default App;
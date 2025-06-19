'use client';

import { useState, useEffect } from 'react';

// Function to call Python API through Tauri
async function callPython(method, endpoint, payload = null) {
  try {
    // Dynamic import to avoid SSR issues
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke("py_api", {
      method,
      endpoint,
      payload,
    });
  } catch (error) {
    
    console.warn('Tauri not available, using mock data');
    return Promise.resolve({ data: [] });
  }
}

export default function TodoApp() {
  const [taskName, setTaskName] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await callPython("GET", "tasks");
        setTasks(response.data || []);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      }
    };

    loadTasks();
  }, []);

  const deleteTask = async (taskId) => {
    console.log("deleting task :" + `${taskId}`);
    try {
      await callPython("DELETE", "tasks", { taskId: taskId });
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Python call failed:", error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const task = {
      id: tasks.length + 1,
      createdAt: new Date().toISOString(),
      taskName: taskName,
    };

    try {
      await callPython("POST", "tasks", task);
      setTasks([...tasks, { ...task, name: task.taskName }]);
      setTaskName("");
    } catch (error) {
      console.error("Python call failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="flex flex-col items-center w-96">
        <h1 className="text-5xl text-gray-100 mb-2">Todo list demo</h1>
        <h2 className="text-gray-100 mb-8">Tauri + Next.js + Python</h2>

        <form className="flex" onSubmit={addTask}>
          <input
            id="add-task-input"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Add task name..."
            className="rounded-lg border border-transparent px-5 py-2.5 text-base font-medium text-gray-900 bg-white transition-colors shadow-md mr-4"
          />
          <button 
            type="submit"
            className="rounded-lg border border-transparent px-5 py-2.5 text-base font-medium text-white bg-green-600 transition-colors shadow-md cursor-pointer hover:outline-white hover:outline-1 active:border-blue-600 active:bg-gray-200 active:text-black"
          >
            Add task
          </button>
        </form>

        <div className="p-4 mt-8 w-full border border-dotted border-white rounded shadow-lg flex flex-col gap-4">
          {tasks.map((task) => (
            <div key={task.id}>
              <div className="bg-white py-1 flex rounded items-center">
                <div className="flex justify-center items-center flex-1 p-0.5 text-black uppercase text-xl">
                  {task.name}
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-600 p-0 m-0 w-1/5 py-1 mr-4 rounded-lg border border-transparent px-5 text-base font-medium text-white transition-colors shadow-md cursor-pointer  hover:outline-white hover:outline-1 active:border-blue-600 active:bg-gray-200 active:text-black"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 
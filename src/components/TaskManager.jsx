import React, { useEffect, useState } from "react";
import supabase from "../supabase/supabaseClient";

function TaskManager() {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTask] = useState([]);

  // Fetch tasks
  const fetchTask = async () => {
    const { error, data } = await supabase
      .from("task")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Can't select tasks", error.message);
      return;
    }
    setTask(data);
  };

  // Add task
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error, data } = await supabase
      .from("task")
      .insert(newTask)
      .select()
      .single();

    if (error) {
      console.log("Failed to add task:", error.message);
    } else {
      setTask((prev) => [...prev, data]); // optimistic update
      setNewTask({ title: "", description: "" });
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    const { error } = await supabase.from("task").delete().eq("id", id);

    if (error) {
      console.log("Failed to delete task:", error.message);
    } else {
      setTask((prev) => prev.filter((t) => t.id !== id)); // remove from UI
    }
  };

  // Update task description
  const updateTask = async (id, updatedDescription) => {
    const { error } = await supabase
      .from("task")
      .update({ description: updatedDescription })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.log("Failed to update task:", error.message);
    } else {
      setTask((prev) =>
        prev.map((t) => (t.id === id ? { ...t, description: updatedDescription } : t))
      );
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 ">
      <h2 className="text-2xl font-bold mb-4 text-center">Task Manager CRUD</h2>

      {/* Form to add a new task */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-3">
        <input
          type="text"
          value={newTask.title}
          placeholder="Task Title"
          className="w-full p-2 border rounded"
          onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
        />
        <textarea
          value={newTask.description}
          placeholder="Task Description"
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <input type="file" accept="image/*" className="block" />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </form>

      {/* List of Tasks */}
      <ul className="list-none p-0 space-y-3">
        {tasks.map((task) => (
          <li className="border rounded p-4" key={task.id}>
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
              <div className="mt-2 space-y-2">
                <textarea
                  defaultValue={task.description}
                  className="w-full p-2 border rounded"
                  onChange={(e) => (task._tempDesc = e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => updateTask(task.id, task._tempDesc || task.description)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManager;

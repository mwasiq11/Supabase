import React, { useEffect, useState } from "react";
import supabase from "../supabase/supabaseClient";

function TaskManager() {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState([]);
  const [newDescription, setNewDescription] = useState({});
  const [taskImage, setTaskImage] = useState(null);

  //  Fetch all tasks
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("task")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(" Error reading tasks:", error.message);
      return;
    }
    setTasks(data);
  };

  //  Upload image/ supabasr storage bucket
  const uploadImage = async (file) => {
    const filePath = `tasks/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("task-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error(" Error uploading image:", uploadError.message);
      return null;
    }
    //get URL
    const { data } = supabase.storage.from("task-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  //  Add task
  const handleSubmit = async (e) => {
    e.preventDefault();
    // handle image upload if any
    let imageUrl = null;
    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    const { data, error } = await supabase
      .from("task")
      .insert({
        ...newTask,
        images_url: imageUrl,
      })
      .select();

    if (error) {
      console.error(" Error adding task:", error.message);
      return;
    }

    //  Update local state immediately (so no refresh needed)
    setTasks((prev) => [...prev, ...data]);

    setNewTask({ title: "", description: "" });
    setTaskImage(null);
  };

  //  Delete task
  const deleteTask = async (id) => {
    const { error } = await supabase.from("task").delete().eq("id", id);
    if (error) {
      console.error(" Error deleting task:", error.message);
      return;
    }
    //  Remove locally too
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  //  Update task
  const updateTask = async (id, description) => {
    const { data, error } = await supabase
      .from("task")
      .update({ description })
      .eq("id", id)
      .select();

    if (error) {
      console.error(" Error updating task:", error.message);
      return;
    }

    //  Update locally
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data[0] } : t))
    );
    setNewDescription((prev) => ({ ...prev, [id]: "" }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("task-changes")
      // INSERT
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "task" }, (payload) => {
        setTasks((prev) => {
          if (prev.some((t) => t.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      // UPDATE
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "task" }, (payload) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === payload.new.id ? payload.new : t))
        );
      })
      // DELETE
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "task" }, (payload) => {
        setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
      })

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Task Manager CRUD</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-3">
        <input
          type="text"
          value={newTask.title}
          placeholder="Task Title"
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <textarea
          value={newTask.description}
          placeholder="Task Description"
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <input type="file" accept="image/*" className="block" onChange={handleFileChange} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Task
        </button>
      </form>

      {/* Task List */}
      <ul className="list-none p-0 space-y-3">
        {tasks.map((task) => (
          <li className="border rounded p-4" key={task.id}>
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-gray-600">{task.description}</p>

            {task.images_url && (
              <img src={task.images_url} alt="Task" className="mt-2 rounded" width={150} />
            )}

            <div className="mt-2 space-y-2">
              <textarea
                value={newDescription[task.id] ?? task.description}
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setNewDescription((prev) => ({ ...prev, [task.id]: e.target.value }))
                }
              />
              <div className="flex gap-2">
                <button
                  type="button" // prevent form submit
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={() =>
                    updateTask(task.id, newDescription[task.id] ?? task.description)
                  }
                >
                  Edit
                </button>
                <button
                  type="button" //  prevent form submit
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManager;




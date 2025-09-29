// frontend/src/App.js
import React, { useEffect, useState, useRef } from "react";
import "./index.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newDue, setNewDue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState("all");
  const [notifyEnabled, setNotifyEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notifyEnabled")) || false; } catch { return false; }
  });

  const notifiedRef = useRef(new Set(JSON.parse(localStorage.getItem("notifiedIds") || "[]")));

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    const id = setInterval(() => fetchTasks(), 60000);
    return () => clearInterval(id);
  }, []);

  // Notifications poll
  useEffect(() => {
    if (!notifyEnabled) return;
    const checkAndNotify = () => {
      const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
      const now = new Date();

      tasks.forEach(task => {
        if (!task.dueDate || task.completed) return;
        const due = new Date(task.dueDate + "T00:00:00"); // interpret string as date
        const diff = due - now;

        if (diff <= 10 * 60 * 1000 && diff >= -60 * 1000) {
          if (!notifiedRef.current.has(task._id)) {
            if (Notification.permission === "granted") {
              new Notification("Task due soon", {
                body: task.title + (task.dueDate ? ` — due ${task.dueDate}` : ""),
              });
            }
            notifiedRef.current.add(task._id);
            localStorage.setItem("notifiedIds", JSON.stringify(Array.from(notifiedRef.current)));
          }
        }
      });
    };

    checkAndNotify();
    const nid = setInterval(checkAndNotify, 30000);
    return () => clearInterval(nid);
  }, [tasks, notifyEnabled]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask.trim(), dueDate: newDue || null }),
      });
      const data = await res.json();
      setTasks(prev => [data, ...prev]);
      setNewTask("");
      setNewDue("");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditingText(task.title);
  };
  const cancelEdit = () => { setEditingId(null); setEditingText(""); };

  const saveEdit = async (id) => {
    const title = editingText.trim();
    if (!title) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const updated = await res.json();
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
      cancelEdit();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const updated = await res.json();
      setTasks(prev => prev.map(t => t._id === task._id ? updated : t));
    } catch (err) {
      console.error("Error toggling complete:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/api/tasks/${id}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t._id !== id));
      notifiedRef.current.delete(id);
      localStorage.setItem("notifiedIds", JSON.stringify(Array.from(notifiedRef.current)));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // Formatter: only date, no time
  const fmt = (d) => d ? d : "";

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filter === "all") return true;
    const today = new Date().toISOString().split("T")[0];
    if (filter === "upcoming") return !t.completed && (!t.dueDate || t.dueDate >= today);
    if (filter === "overdue") return !t.completed && t.dueDate && t.dueDate < today;
    return true;
  });

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }
    if (Notification.permission === "granted") {
      setNotifyEnabled(true);
      localStorage.setItem("notifyEnabled", "true");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifyEnabled(true);
      localStorage.setItem("notifyEnabled", "true");
    } else {
      setNotifyEnabled(false);
      localStorage.setItem("notifyEnabled", "false");
    }
  };

  const toggleNotify = () => {
    if (!notifyEnabled) {
      requestNotificationPermission();
    } else {
      setNotifyEnabled(false);
      localStorage.setItem("notifyEnabled", "false");
    }
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <div className="app-header">
          <h1 className="title-green">TASK MANAGER</h1>
          <p className="subtitle">Organize your day — due dates & reminders</p>
        </div>

        <div className="task-input-row">
          <input
            className="task-input"
            placeholder="Add task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
          />
          <input type="date" className="task-input small" value={newDue} onChange={e => setNewDue(e.target.value)} />
          <button className="btn primary" onClick={addTask}>Add</button>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
          <div>
            <button className={`btn ${filter === "all" ? "primary" : "ghost"} small`} onClick={() => setFilter("all")}>All</button>
            <button className={`btn ${filter === "upcoming" ? "primary" : "ghost"} small`} onClick={() => setFilter("upcoming")}>Upcoming</button>
            <button className={`btn ${filter === "overdue" ? "primary" : "ghost"} small`} onClick={() => setFilter("overdue")}>Overdue</button>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button className={`btn ${notifyEnabled ? "primary" : "ghost"} small`} onClick={toggleNotify}>
              {notifyEnabled ? "Notifications ON" : "Enable Alerts"}
            </button>
          </div>
        </div>

        <div className="task-list">
          {filteredTasks.length === 0 && <div className="empty">No tasks found</div>}

          {filteredTasks.map(task => {
            const isOverdue = !task.completed && task.dueDate && task.dueDate < new Date().toISOString().split("T")[0];
            return (
              <div key={task._id} className={`task-row ${task.completed ? "done" : ""} ${isOverdue ? "overdue" : ""}`}>
                <div className="task-left">
                  <input type="checkbox" checked={!!task.completed} onChange={() => toggleComplete(task)} />
                  <div style={{ minWidth: 0 }}>
                    {editingId === task._id ? (
                      <input className="edit-input" value={editingText} onChange={e => setEditingText(e.target.value)} />
                    ) : (
                      <div className="task-title">{task.title}</div>
                    )}
                    <div className="task-dates">
                      <small>Created: {new Date(task.createdAt).toLocaleString()}</small>
                      {task.dueDate ? <small> • Due: {fmt(task.dueDate)}</small> : null}
                      {task.completedAt ? <small> • Done: {new Date(task.completedAt).toLocaleString()}</small> : null}
                    </div>
                  </div>
                </div>

                <div className="task-actions">
                  {editingId === task._id ? (
                    <>
                      <button className="btn small" onClick={() => saveEdit(task._id)}>Save</button>
                      <button className="btn ghost small" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn ghost small" onClick={() => startEdit(task)}>Edit</button>
                      <button className="btn danger small" onClick={() => deleteTask(task._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="app-footer">Made with ❤️ — your Task Manager</footer>
      </div>
    </div>
  );
}

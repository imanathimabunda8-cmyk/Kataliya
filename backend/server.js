const path = require('path');
const Database = require('better-sqlite3');
const express = require('express');

const app = express();
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, '..', 'database', 'kataliya.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fact TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// TASKS ROUTES
// Get all tasks
app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json(tasks);
});

// Create a new task
app.post('/tasks', (req, res) => {
  const { title, priority } = req.body;
  const result = db.prepare('INSERT INTO tasks (title, priority) VALUES (?, ?)').run(title, priority);
  res.json({ id: result.lastInsertRowid, title, priority });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted' });
});

// MEMORIES ROUTES
// Get all memories
app.get('/memories', (req, res) => {
  const memories = db.prepare('SELECT * FROM memories').all();
  res.json(memories);
});

// Save a new memory
app.post('/memories', (req, res) => {
  const { fact } = req.body;
  const result = db.prepare('INSERT INTO memories (fact) VALUES (?)').run(fact);
  res.json({ id: result.lastInsertRowid, fact });
});

// Start server
app.listen(3000, () => {
  console.log('Kataliya backend is running on port 3000');
});
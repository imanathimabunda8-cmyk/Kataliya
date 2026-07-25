const API = 'https://kataliya-production.up.railway.app';
let selectedTaskId = null;

window.addEventListener('DOMContentLoaded', () => {
  // Loading → Sign in
  setTimeout(() => {
    switchScreen('loading-screen', 'signin-screen');
  }, 3000);

  // Sign in → Dashboard
  document.getElementById('signin-btn').addEventListener('click', () => {
    switchScreen('signin-screen', 'dashboard-screen');
    loadTasks();
  });

  // Open popup for new task
  document.getElementById('add-btn').addEventListener('click', () => {
    selectedTaskId = null;
    document.getElementById('popup-input').value = '';
    document.getElementById('popup-delete').style.display = 'none';
    openPopup();
  });

  // Add or update task
  document.getElementById('popup-add').addEventListener('click', () => {
    const title = document.getElementById('popup-input').value.trim();
    if (!title) return;
    if (selectedTaskId !== null) {
      updateTask(selectedTaskId, title);
    } else {
      saveTask(title);
    }
    closePopup();
  });

  // Delete task
  document.getElementById('popup-delete').addEventListener('click', () => {
    if (selectedTaskId !== null) {
      deleteTask(selectedTaskId);
    }
    closePopup();
  });

  // Close popup when clicking outside
  document.getElementById('popup-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('popup-overlay')) {
      closePopup();
    }
  });
});

// Load all tasks from backend
async function loadTasks() {
  const res = await fetch(`${API}/tasks`);
  const tasks = await res.json();
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(task => {
    const item = createTaskElement(task.id, task.title, task.completed);
    list.appendChild(item);
  });
}

// Save new task to backend
async function saveTask(title) {
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority: 'medium' })
  });
  const task = await res.json();
  const item = createTaskElement(task.id, task.title, 0);
  document.getElementById('task-list').appendChild(item);
}

// Update task title
async function updateTask(id, newTitle) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.querySelector('.task-title').textContent = newTitle;
  }
}

// Delete task from backend
async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) item.remove();
}

// Mark task complete (local only for now)
async function toggleComplete(id, circle, label) {
  circle.classList.toggle('done');
  label.classList.toggle('done');
}

function createTaskElement(id, title, completed) {
  const item = document.createElement('div');
  item.classList.add('task-item');
  item.setAttribute('data-id', id);

  const circle = document.createElement('div');
  circle.classList.add('task-circle');
  if (completed) circle.classList.add('done');

  const label = document.createElement('span');
  label.classList.add('task-title');
  label.textContent = title;
  if (completed) label.classList.add('done');

  circle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleComplete(id, circle, label);
  });

  item.addEventListener('dblclick', () => {
    selectedTaskId = id;
    document.getElementById('popup-input').value = title;
    document.getElementById('popup-delete').style.display = 'block';
    openPopup();
  });

  item.appendChild(circle);
  item.appendChild(label);
  return item;
}

function switchScreen(from, to) {
  document.getElementById(from).classList.add('hidden');
  document.getElementById(to).classList.remove('hidden');
}

function openPopup() {
  document.getElementById('popup-overlay').classList.remove('hidden');
}

function closePopup() {
  document.getElementById('popup-overlay').classList.add('hidden');
  selectedTaskId = null;
}
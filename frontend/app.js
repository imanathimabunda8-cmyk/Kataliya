let selectedTaskId = null;

window.addEventListener('DOMContentLoaded', () => {
  // Loading → Sign in
  setTimeout(() => {
    switchScreen('loading-screen', 'signin-screen');
  }, 3000);

  // Sign in → Dashboard
  document.getElementById('signin-btn').addEventListener('click', () => {
    switchScreen('signin-screen', 'dashboard-screen');
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
      addTask(title);
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

function addTask(title) {
  const list = document.getElementById('task-list');
  const id = Date.now();
  const item = createTaskElement(id, title);
  list.appendChild(item);
}

function updateTask(id, newTitle) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.querySelector('.task-title').textContent = newTitle;
  }
}

function deleteTask(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) item.remove();
}

function createTaskElement(id, title) {
  const item = document.createElement('div');
  item.classList.add('task-item');
  item.setAttribute('data-id', id);

  const circle = document.createElement('div');
  circle.classList.add('task-circle');
  circle.addEventListener('click', (e) => {
    e.stopPropagation();
    circle.classList.toggle('done');
    item.querySelector('.task-title').classList.toggle('done');
  });

  const label = document.createElement('span');
  label.classList.add('task-title');
  label.textContent = title;

  // Double click to edit
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
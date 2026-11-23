const STORAGE_KEY = 'kataliya_tasks';

let selectedTaskId = null;
let tasks = [];

// ============================
// INITIALISE APPLICATION
// ============================

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

  // Export backup
     document.getElementById('export-btn')
     .addEventListener('click', exportTasks);

  // Import backup
     document.getElementById('import-btn')
     .addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

// Read selected backup file
     document.getElementById('import-file')
    .addEventListener('change', (event) => {

        const file = event.target.files[0];

        if (file) {
            importTasks(file);
        }

        event.target.value = '';

    });

});

// ============================
// EXPORT BACKUP
// ============================

function exportTasks() {

    const backup = JSON.stringify(tasks, null, 2);

    const blob = new Blob([backup], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = 'kataliya-backup.json';

    link.click();

    URL.revokeObjectURL(url);
}


// ============================
// STORAGE
// ============================

// Save tasks to browser storage
function persistTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Kataliya storage error:', error);
    alert('Unable to save tasks. Check your browser storage.');
    return false;
  }
}

// Load tasks from browser storage
function loadTasks() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY);

    tasks = storedTasks ? JSON.parse(storedTasks) : [];

    if (!Array.isArray(tasks)) {
      throw new Error('Invalid task data');
    }

    renderTasks();

  } catch (error) {
    console.error('Unable to load Kataliya tasks:', error);
    alert('Unable to read your saved tasks.');
  }
}

// ============================
// TASK MANAGEMENT
// ============================

// Display all tasks
function renderTasks() {
  const list = document.getElementById('task-list');

  list.innerHTML = '';

  tasks.forEach(task => {
    const item = createTaskElement(task);
    list.appendChild(item);
  });
}

// Create and save a new task
function saveTask(title) {

  const task = {
    id: crypto.randomUUID(),
    title: title,
    completed: false,
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(task);

  if (persistTasks()) {
    renderTasks();
  } else {
    tasks.pop();
  }
}

// Update an existing task
function updateTask(id, newTitle) {

  const task = tasks.find(task => task.id === id);

  if (!task) return;

  const oldTitle = task.title;
  const oldUpdatedAt = task.updatedAt;

  task.title = newTitle;
  task.updatedAt = new Date().toISOString();

  if (persistTasks()) {
    renderTasks();
  } else {
    task.title = oldTitle;
    task.updatedAt = oldUpdatedAt;
  }
}

// Delete a task
function deleteTask(id) {

  const originalTasks = [...tasks];

  tasks = tasks.filter(task => task.id !== id);

  if (persistTasks()) {
    renderTasks();
  } else {
    tasks = originalTasks;
  }
}

// Mark task complete or incomplete
function toggleComplete(id) {

  const task = tasks.find(task => task.id === id);

  if (!task) return;

  const previousStatus = task.completed;
  const previousUpdatedAt = task.updatedAt;

  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();

  if (persistTasks()) {
    renderTasks();
  } else {
    task.completed = previousStatus;
    task.updatedAt = previousUpdatedAt;
  }
}

// ============================
// TASK ELEMENTS
// ============================

function createTaskElement(task) {

  const item = document.createElement('div');
  item.classList.add('task-item');
  item.setAttribute('data-id', task.id);

  const circle = document.createElement('div');
  circle.classList.add('task-circle');

  if (task.completed) {
    circle.classList.add('done');
  }

  const label = document.createElement('span');
  label.classList.add('task-title');
  label.textContent = task.title;

  if (task.completed) {
    label.classList.add('done');
  }

  // Toggle completion
  circle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleComplete(task.id);
  });

  // Edit task on double-click
  item.addEventListener('dblclick', () => {

    selectedTaskId = task.id;

    document.getElementById('popup-input').value = task.title;
    document.getElementById('popup-delete').style.display = 'block';

    openPopup();

  });

  item.appendChild(circle);
  item.appendChild(label);

  return item;
}

// ============================
// SCREEN NAVIGATION
// ============================

function switchScreen(from, to) {
  document.getElementById(from).classList.add('hidden');
  document.getElementById(to).classList.remove('hidden');
}

// ============================
// POPUP MANAGEMENT
// ============================

function openPopup() {
  document.getElementById('popup-overlay').classList.remove('hidden');
}

function closePopup() {
  document.getElementById('popup-overlay').classList.add('hidden');

  selectedTaskId = null;
}

//=============================
// IMPORT BACKUP
// ============================
function importTasks(file) {

    // Check file size (maximum 1 MB)
    if (file.size > 1024 * 1024) {
        alert('Backup file is too large.');
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {

        try {

            // STEP 1: Convert JSON into JavaScript data
            const importedTasks = JSON.parse(event.target.result);

            // STEP 2: Check that the backup contains an array
            if (!Array.isArray(importedTasks)) {
                throw new Error('Backup must contain a task array.');
            }

            // STEP 3: Validate every task
            const validTasks = importedTasks.every(task => {

                return (
                    task !== null &&
                    typeof task === 'object' &&
                    typeof task.id === 'string' &&
                    typeof task.title === 'string' &&
                    task.title.trim().length > 0 &&
                    typeof task.completed === 'boolean' &&
                    ['low', 'medium', 'high'].includes(task.priority) &&
                    typeof task.createdAt === 'string' &&
                    !isNaN(Date.parse(task.createdAt)) &&
                    typeof task.updatedAt === 'string' &&
                    !isNaN(Date.parse(task.updatedAt))
                );

            });

            if (!validTasks) {
                throw new Error('Backup contains invalid task data.');
            }

            // STEP 4: Check for duplicate task IDs
            const ids = importedTasks.map(task => task.id);

            if (new Set(ids).size !== ids.length) {
                throw new Error('Backup contains duplicate task IDs.');
            }

            // STEP 5: Ask before replacing existing tasks
            const confirmed = confirm(
                `This backup contains ${importedTasks.length} tasks.\n\n` +
                `Importing it will replace your current ${tasks.length} tasks.\n\n` +
                `Do you want to continue?`
            );

            if (!confirmed) {
                return;
            }

            // STEP 6: Keep a copy of the current tasks
            const originalTasks = tasks;

            // STEP 7: Replace current tasks
            tasks = importedTasks;

            // STEP 8: Save imported tasks
            if (persistTasks()) {

                renderTasks();

                alert('Backup successfully restored!');

            } else {

                // Restore original tasks if saving fails
                tasks = originalTasks;

                renderTasks();
            }

        } catch (error) {

            console.error('Import error:', error);

            alert('Unable to import backup: ' + error.message);

        }

    };

    reader.onerror = () => {
        alert('Unable to read the selected backup file.');
    };

    reader.readAsText(file);
}

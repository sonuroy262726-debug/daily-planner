// Daily Planner Application - Advanced Version

const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const timeInput = document.getElementById('timeInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskStats = document.getElementById('taskStats');
const clearBtn = document.getElementById('clearBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentSort = 'date-asc';
let searchTerm = '';

// Initialize
displayTasks();
setTodayDate();

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
clearBtn.addEventListener('click', clearCompleted);
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        displayTasks();
    });
});
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    displayTasks();
});
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    displayTasks();
});

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.value = today;
}

// Add a new task
function addTask() {
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;
    const time = timeInput.value;
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: text,
        priority: priority,
        dueDate: dueDate,
        time: time,
        completed: false,
        createdAt: new Date().getTime()
    };
    
    tasks.push(task);
    saveTasks();
    displayTasks();
    taskInput.value = '';
    taskInput.focus();
}

// Toggle task completion
function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    displayTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    displayTasks();
}

// Edit a task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
        displayTasks();
    }
}

// Clear completed tasks
function clearCompleted() {
    if (confirm('Are you sure you want to clear all completed tasks?')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        displayTasks();
    }
}

// Get sorted and filtered tasks
function getProcessedTasks() {
    let filtered = tasks;
    
    // Apply filter
    if (currentFilter === 'active') {
        filtered = filtered.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(task => task.completed);
    }
    
    // Apply search
    if (searchTerm) {
        filtered = filtered.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sort
    filtered.sort((a, b) => {
        if (currentSort === 'date-asc') {
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (currentSort === 'date-desc') {
            return new Date(b.dueDate) - new Date(a.dueDate);
        } else if (currentSort === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (currentSort === 'newest') {
            return b.createdAt - a.createdAt;
        }
    });
    
    return filtered;
}

// Display tasks
function displayTasks() {
    taskList.innerHTML = '';
    const processedTasks = getProcessedTasks();
    
    if (processedTasks.length === 0) {
        taskList.innerHTML = '<li class="empty-state">✨ No tasks found. Add one to get started!</li>';
    } else {
        processedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority`;
            
            const dateObj = new Date(task.dueDate);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <div class="task-content">
                    <div class="task-text">${escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="priority-badge ${task.priority}">${task.priority.toUpperCase()}</span>
                        ${task.dueDate ? `<span class="task-date">📅 ${dateStr}</span>` : ''}
                        ${task.time ? `<span class="task-time">⏰ ${task.time}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }
    
    updateStats();
}

// Update task counter
function updateStats() {
    const pending = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    taskStats.textContent = `${pending} pending • ${completed} completed`;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
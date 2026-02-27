// Supabase Configuration
// TODO: replace with your actual Supabase details
const SUPABASE_URL = "http://127.0.0.1:54321"; // local emulator API URL
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

// Initialize Supabase client
let supabase = null;
const initializeSupabase = () => {
  if (!window.supabase) {
    console.error("Supabase library not loaded");
    return false;
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
};

// DOM elements
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const addButton = document.querySelector('button');

// Fetch tasks from Supabase
const fetchTasks = async () => {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching tasks:", error.message);
      return;
    }
    
    taskList.innerHTML = "";
    if (data && data.length > 0) {
      data.forEach(task => {
        const li = document.createElement("li");
        li.textContent = task.task;
        li.dataset.id = task.id;
        taskList.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Unexpected error fetching tasks:", err);
  }
};

// Add a new task to Supabase
const addTask = async () => {
  const text = taskInput.value.trim();
  
  if (!text) {
    console.warn("Task input is empty");
    return;
  }
  
  if (!supabase) {
    console.error("Supabase not initialized");
    return;
  }
  
  try {
    addButton.disabled = true;
    
    const { error } = await supabase
      .from("todos")
      .insert([{ task: text }]);
    
    if (error) {
      console.error("Error adding task:", error.message);
      return;
    }
    
    taskInput.value = "";
    taskInput.focus();
    await fetchTasks();
  } catch (err) {
    console.error("Unexpected error adding task:", err);
  } finally {
    addButton.disabled = false;
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (initializeSupabase()) {
    fetchTasks();
  }
});

// Allow Enter key to add task
taskInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

// expose functions for easier testing and legacy onclick handlers
window.addTask = addTask;
window.fetchTasks = fetchTasks;

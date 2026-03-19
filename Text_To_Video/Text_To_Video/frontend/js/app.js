const API_URL = "http://localhost:8000";

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        logout();
    }
    
    return response;
}

// Load Tasks
async function loadTasks() {
    const res = await apiCall('/tasks/');
    if (res.ok) {
        const tasks = await res.json();
        renderTasks(tasks);
    }
}

function renderTasks(tasks) {
    const grid = document.getElementById('videoGrid');
    const list = document.getElementById('projectList');
    
    grid.innerHTML = '';
    list.innerHTML = '';
    
    if (tasks.length === 0) {
        grid.innerHTML = '<div style="color: var(--text-secondary);">No videos yet. Create one!</div>';
    }

    tasks.forEach(task => {
        // Sidebar Item
        const item = document.createElement('div');
        item.style.padding = '0.5rem';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '0.25rem';
        item.style.color = 'var(--text-secondary)';
        item.textContent = task.prompt.substring(0, 30) + (task.prompt.length > 30 ? '...' : '');
        item.onmouseover = () => item.style.background = 'rgba(255,255,255,0.05)';
        item.onmouseout = () => item.style.background = 'transparent';
        list.appendChild(item);

        // Grid Card
        const card = document.createElement('div');
        card.className = 'video-card';
        
        let content = '';
        if (task.status === 'completed' && task.video_url) {
            content = `<video src="${API_URL}${task.video_url}" controls></video>`;
        } else {
            content = `
                <div class="video-preview">
                    <div style="text-align: center;">
                        <span class="status-badge status-${task.status}">${task.status}</span>
                        <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
                            ${task.duration}s
                        </div>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            ${content}
            <div style="padding: 1rem;">
                <p style="font-size: 0.9rem; color: var(--text-primary); margin-bottom: 0.5rem;">
                    ${task.prompt}
                </p>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                    ${new Date(task.created_at).toLocaleDateString()}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Create Task
document.getElementById('createTaskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value;
    const duration = parseInt(document.getElementById('duration').value);
    
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = "Submitting...";
    btn.disabled = true;

    try {
        const res = await apiCall('/tasks/', {
            method: 'POST',
            body: JSON.stringify({ prompt, duration })
        });
        
        if (res.ok) {
            document.getElementById('prompt').value = '';
            loadTasks(); // Refresh list
        } else {
            alert("Failed to create task");
        }
    } catch (err) {
        console.error(err);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

// Poll for updates every 5 seconds
setInterval(loadTasks, 5000);

// Enhance Prompt
document.getElementById('enhanceBtn').addEventListener('click', async () => {
    const promptField = document.getElementById('prompt');
    const btn = document.getElementById('enhanceBtn');
    
    if (promptField.value.trim() === "") {
        alert("Please enter a basic prompt first!");
        return;
    }
    
    const originalText = btn.textContent;
    btn.textContent = "✨ Enhancing...";
    btn.disabled = true;
    
    try {
        const res = await apiCall('/tasks/enhance', {
            method: 'POST',
            body: JSON.stringify({ prompt: promptField.value })
        });
        
        if (res.ok) {
            const data = await res.json();
            promptField.value = data.enhanced_prompt;
        } else {
            // Fallback
            promptField.value += " , cinematic lighting, 8k resolution, photorealistic";
        }
    } catch (err) {
        console.error("Enhance failed", err);
        promptField.value += " , cinematic lighting, 8k resolution, photorealistic";
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

// Initial Load
loadTasks();

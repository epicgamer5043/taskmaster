let tasks = [];
let recording = false;
let actions = [];

document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('task-name').value;
    const script = document.getElementById('task-script').value;
    const schedule = document.getElementById('task-schedule').value;

    const task = { name, script, schedule, status: 'pending' };
    tasks.push(task);
    displayTasks();
    document.getElementById('task-form').reset();
});

function displayTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div>
                <h3>${task.name}</h3>
                <p>Schedule: ${task.schedule}</p>
                <p>Status: ${task.status}</p>
            </div>
            <button onclick="runTask(${index})">Run</button>
        `;
        taskList.appendChild(taskItem);
    });
}

function runTask(index) {
    const task = tasks[index];
    task.status = 'running';
    displayTasks();
    const script = JSON.parse(task.script);
    replayActions(script, () => {
        task.status = 'completed';
        displayTasks();
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function startRecording() {
    actions = [];
    recording = true;
    document.addEventListener('mousemove', recordAction);
    document.addEventListener('click', recordAction);
    document.addEventListener('keydown', recordAction);
}

function stopRecording() {
    recording = false;
    document.removeEventListener('mousemove', recordAction);
    document.removeEventListener('click', recordAction);
    document.removeEventListener('keydown', recordAction);
    document.getElementById('task-script').value = JSON.stringify(actions, null, 2);
}

function recordAction(event) {
    if (!recording) return;
    const { type, clientX, clientY, key } = event;
    const action = { type, clientX, clientY, key, timestamp: Date.now() };
    actions.push(action);
}

function replayActions(actions, callback) {
    if (actions.length === 0) {
        callback();
        return;
    }
    const action = actions.shift();
    setTimeout(() => {
        performAction(action);
        replayActions(actions, callback);
    }, 100);
}

function performAction(action) {
    const { type, clientX, clientY, key } = action;
    switch (type) {
        case 'mousemove':
            const mouseMoveEvent = new MouseEvent('mousemove', { clientX, clientY });
            document.dispatchEvent(mouseMoveEvent);
            break;
        case 'click':
            const clickEvent = new MouseEvent('click', { clientX, clientY });
            document.dispatchEvent(clickEvent);
            break;
        case 'keydown':
            const keyboardEvent = new KeyboardEvent('keydown', { key });
            document.dispatchEvent(keyboardEvent);
            break;
        default:
            break;
    }
}

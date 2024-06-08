let isRecording = false;
let actions = [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

document.getElementById('record').addEventListener('click', () => {
    if (!isRecording) {
        isRecording = true;
        actions = [];
        document.getElementById('status').textContent = "Recording...";
        document.addEventListener('mousemove', recordAction);
        document.addEventListener('keydown', recordAction);
        document.addEventListener('keyup', recordAction);
    }
});

document.getElementById('stop').addEventListener('click', () => {
    if (isRecording) {
        isRecording = false;
        document.getElementById('status').textContent = "Stopped Recording";
        document.removeEventListener('mousemove', recordAction);
        document.removeEventListener('keydown', recordAction);
        document.removeEventListener('keyup', recordAction);
        saveTask(actions);
    }
});

document.getElementById('play').addEventListener('click', () => {
    const selector = document.getElementById('taskSelector');
    const taskId = selector.options[selector.selectedIndex].value;
    if (taskId) {
        playTask(tasks[taskId]);
    }
});

document.getElementById('schedule').addEventListener('click', () => {
    const selector = document.getElementById('taskSelector');
    const taskId = selector.options[selector.selectedIndex].value;
    const scheduleTime = document.getElementById('scheduleTime').value;
    if (taskId && scheduleTime) {
        scheduleTask(taskId, scheduleTime);
    }
});

document.getElementById('repeat').addEventListener('click', () => {
    const selector = document.getElementById('taskSelector');
    const taskId = selector.options[selector.selectedIndex].value;
    const repeatCount = document.getElementById('repeatCount').value;
    const repeatInterval = document.getElementById('repeatInterval').value;
    if (taskId && repeatCount && repeatInterval) {
        repeatTask(taskId, repeatCount, repeatInterval);
    }
});

function recordAction(event) {
    const action = {
        type: event.type,
        timestamp: Date.now(),
        details: {
            x: event.clientX,
            y: event.clientY,
            key: event.key,
            code: event.code
        }
    };
    actions.push(action);
    logAction(action);
}

function logAction(action) {
    const logList = document.getElementById('logList');
    const logItem = document.createElement('li');
    logItem.textContent = `Action: ${action.type}, X: ${action.details.x}, Y: ${action.details.y}, Key: ${action.details.key}`;
    logList.appendChild(logItem);
}

function simulateAction(action) {
    switch (action.type) {
        case 'mousemove':
            simulateMouseMove(action.details.x, action.details.y);
            break;
        case 'keydown':
            simulateKeyEvent(action.details.key, action.details.code, 'keydown');
            break;
        case 'keyup':
            simulateKeyEvent(action.details.key, action.details.code, 'keyup');
            break;
    }
}

function simulateMouseMove(x, y) {
    const event = new MouseEvent('mousemove', {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(event);
}

function simulateKeyEvent(key, code, type) {
    const event = new KeyboardEvent(type, {
        key: key,
        code: code,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(event);
}

function saveTask(actions) {
    const taskId = Date.now().toString();
    tasks[taskId] = actions;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    addTaskToSelector(taskId);
    document.getElementById('status').textContent = "Task Recorded Successfully";
}

function playTask(actions) {
    actions.forEach((action, index) => {
        setTimeout(() => {
            simulateAction(action);
        }, index * 100); // Adjust the interval as needed
    });
}

function scheduleTask(taskId, scheduleTime) {
    const now = new Date();
    const scheduleDate = new Date(scheduleTime);
    const delay = scheduleDate.getTime() - now.getTime();

    if (delay > 0) {
        setTimeout(() => {
            playTask(tasks[taskId]);
            document.getElementById('status').textContent = `Task ${taskId} played at ${scheduleTime}`;
        }, delay);
    } else {
        document.getElementById('status').textContent = "Invalid schedule time.";
    }
}

function repeatTask(taskId, repeatCount, repeatInterval) {
    for (let i = 0; i < repeatCount; i++) {
        setTimeout(() => {
            playTask(tasks[taskId]);
            document.getElementById('status').textContent = `Task ${taskId} repeated ${i + 1} times`;
        }, i * repeatInterval);
    }
}

function addTaskToSelector(taskId) {
    const selector = document.getElementById('taskSelector');
    const option = document.createElement('option');
    option.value = taskId;
    option.textContent = `Task ${taskId}`;
    selector.appendChild(option);
}

// Initialize task selector with saved tasks
Object.keys(tasks).forEach(taskId => addTaskToSelector(taskId));

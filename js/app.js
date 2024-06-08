document.addEventListener("DOMContentLoaded", () => {
    const recordBtn = document.getElementById('recordBtn');
    const playbackBtn = document.getElementById('playbackBtn');
    const speedSelect = document.getElementById('speed');
    const repetitionsInput = document.getElementById('repetitions');
    const intervalInput = document.getElementById('interval');

    let recording = false;
    let events = [];
    let playbackPermission = false;

    const startRecording = () => {
        recording = true;
        events = [];
        recordBtn.textContent = "Stop Recording";
        document.addEventListener('keydown', recordEvent);
        document.addEventListener('mousemove', recordEvent);
        document.addEventListener('click', recordEvent);
    };

    const stopRecording = () => {
        recording = false;
        recordBtn.textContent = "Start Recording";
        document.removeEventListener('keydown', recordEvent);
        document.removeEventListener('mousemove', recordEvent);
        document.removeEventListener('click', recordEvent);
        playbackBtn.disabled = events.length === 0;
    };

    const recordEvent = (e) => {
        if (!recording) return;
        const eventType = e.type;
        const timestamp = Date.now();
        let details = {};

        switch (eventType) {
            case 'keydown':
                details = {
                    key: e.key,
                    code: e.code
                };
                break;
            case 'mousemove':
                details = {
                    x: e.clientX,
                    y: e.clientY
                };
                break;
            case 'click':
                details = {
                    x: e.clientX,
                    y: e.clientY,
                    button: e.button
                };
                break;
            default:
                return;
        }

        events.push({
            type: eventType,
            timestamp: timestamp,
            details: details
        });
    };

    const requestPlaybackPermission = async () => {
        if (!playbackPermission) {
            try {
                // Assuming a function requestPermission is defined to ask for user consent.
                playbackPermission = await requestPermission();
            } catch (error) {
                console.error("Permission denied", error);
                return false;
            }
        }
        return playbackPermission;
    };

    const playbackEvents = async () => {
        if (!await requestPlaybackPermission()) return;

        const speed = parseInt(speedSelect.value);
        const repetitions = parseInt(repetitionsInput.value);
        const interval = parseInt(intervalInput.value);

        const performEvents = async () => {
            for (const event of events) {
                const eventType = event.type;
                const details = event.details;

                switch (eventType) {
                    case 'keydown':
                        simulateKeyPress(details.key, details.code);
                        break;
                    case 'mousemove':
                        simulateMouseMove(details.x, details.y);
                        break;
                    case 'click':
                        simulateMouseClick(details.x, details.y, details.button);
                        break;
                    default:
                        break;
                }

                await new Promise(resolve => setTimeout(resolve, event.timestamp / speed));
            }
        };

        for (let i = 0; i < repetitions; i++) {
            await performEvents();
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    };

    const simulateKeyPress = (key, code) => {
        const event = new KeyboardEvent('keydown', { key: key, code: code });
        document.dispatchEvent(event);
    };

    const simulateMouseMove = (x, y) => {
        const event = new MouseEvent('mousemove', { clientX: x, clientY: y });
        document.dispatchEvent(event);
    };

    const simulateMouseClick = (x, y, button) => {
        const event = new MouseEvent('click', { clientX: x, clientY: y, button: button });
        document.dispatchEvent(event);
    };

    const requestPermission = () => {
        return new Promise((resolve, reject) => {
            const confirmPermission = confirm("This website wants to control your mouse and keyboard to repeat your recorded tasks. Do you allow this?");
            if (confirmPermission) {
                resolve(true);
            } else {
                reject(false);
            }
        });
    };

    recordBtn.addEventListener('click', () => {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    playbackBtn.addEventListener('click', () => {
        playbackEvents();
    });
});

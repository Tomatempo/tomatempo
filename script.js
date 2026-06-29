// ==============================
// DURAÇÕES PADRÃO
// ==============================

let durations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

// ==============================
// ESTADO
// ==============================

let currentMode = "pomodoro";
let timeLeft = durations.pomodoro;
let isRunning = false;
let intervalId = null;

let savedTimes = {
    pomodoro: durations.pomodoro,
    shortBreak: durations.shortBreak,
    longBreak: durations.longBreak
};

// ==============================
// ELEMENTOS HTML
// ==============================

const timerDisplay = document.getElementById("timerDisplay");
const modeNameSpan = document.getElementById("modeName");
const statusMsgDiv = document.getElementById("statusMsg");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const modeButtons = document.querySelectorAll(".mode-option");

// ==============================
// INICIALIZAÇÃO
// ==============================

function init() {
    updateDisplay();
    updateModeUI();
    attachEvents();

    dispatchEvent("ready", {
        mode: currentMode,
        time: timeLeft
    });
}

// ==============================
// EVENTOS
// ==============================

function attachEvents() {

    startBtn.addEventListener("click", start);

    pauseBtn.addEventListener("click", pause);

    resetBtn.addEventListener("click", resetCurrentMode);

    modeButtons.forEach(btn => {

        btn.addEventListener("click", function () {

            const mode = btn.dataset.mode;

            if (mode) {
                switchMode(mode);
            }

        });

    });

}

// ==============================
// START
// ==============================

function start() {

    if (isRunning) return;

    if (timeLeft <= 0) {
        resetCurrentMode();
    }

    isRunning = true;

    updateStatus(
        `Em andamento — ${getModeLabel()}`,
        "play"
    );

    intervalId = setInterval(function () {

        if (timeLeft > 0) {

            timeLeft--;

            savedTimes[currentMode] = timeLeft;

            updateDisplay();

            dispatchEvent("tick", {
                timeLeft,
                mode: currentMode
            });

        }

        if (timeLeft === 0) {
            completeSession();
        }

    }, 1000);

}

// ==============================
// PAUSE
// ==============================

function pause() {

    if (!isRunning) return;

    clearInterval(intervalId);

    intervalId = null;

    isRunning = false;

    updateStatus(
        `Pausado — restam ${formatTime(timeLeft)}`,
        "pause"
    );

    dispatchEvent("pause", {
        timeLeft,
        mode: currentMode
    });

}

// ==============================
// RESET
// ==============================

function resetCurrentMode() {

    if (isRunning) {
        pause();
    }

    timeLeft = durations[currentMode];

    savedTimes[currentMode] = timeLeft;

    updateDisplay();

    updateStatus(
        `${getModeLabel()} resetado`,
        "reset"
    );

    dispatchEvent("reset", {
        mode: currentMode,
        timeLeft
    });

}

// ==============================
// TROCAR MODO
// ==============================

function switchMode(newMode) {

    if (newMode === currentMode) return;

    savedTimes[currentMode] = timeLeft;

    if (isRunning) {
        pause();
    }

    currentMode = newMode;

    const saved = savedTimes[currentMode];

    if (saved && saved > 0) {
        timeLeft = saved;
    } else {
        timeLeft = durations[currentMode];
    }

    updateDisplay();

    updateModeUI();

    updateStatus(
        `Modo: ${getModeLabel()}`,
        "modeChange"
    );

    dispatchEvent("modeChange", {
        mode: currentMode,
        timeLeft
    });

}

// ==============================
// FINALIZAÇÃO
// ==============================

function completeSession() {

    pause();

    updateStatus(
        `✅ Ciclo concluído! Hora de ${getNextSuggestion()}`,
        "complete"
    );

    dispatchEvent("complete", {
        mode: currentMode
    });

}

// ==============================
// DISPLAY
// ==============================

function updateDisplay() {

    const mins = Math.floor(timeLeft / 60);

    const secs = timeLeft % 60;

    timerDisplay.textContent =
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

}

// ==============================
// INTERFACE DOS MODOS
// ==============================

function updateModeUI() {

    const labels = {
        pomodoro: "Foco intenso",
        shortBreak: "Pausa curta",
        longBreak: "Pausa longa"
    };

    modeNameSpan.textContent = labels[currentMode];

    modeButtons.forEach(btn => {

        if (btn.dataset.mode === currentMode) {

            btn.classList.add("active");

        } else {

            btn.classList.remove("active");

        }

    });

}

// ==============================
// STATUS
// ==============================

function updateStatus(message, type = "info") {

    if (!statusMsgDiv) return;

    let icon = '<i class="fas fa-info-circle"></i>';

    if (type === "play")
        icon = '<i class="fas fa-play-circle"></i>';

    if (type === "pause")
        icon = '<i class="fas fa-pause-circle"></i>';

    if (type === "reset")
        icon = '<i class="fas fa-sync-alt"></i>';

    if (type === "complete")
        icon = '<i class="fas fa-check-circle"></i>';

    statusMsgDiv.innerHTML = `${icon} ${message}`;

}

// ==============================
// AUXILIARES
// ==============================

function getModeLabel() {

    const map = {
        pomodoro: "Pomodoro",
        shortBreak: "Pausa curta",
        longBreak: "Pausa longa"
    };

    return map[currentMode];

}

function getNextSuggestion() {

    if (currentMode === "pomodoro") {
        return "uma pausa curta";
    }

    return "foco novamente";

}

function formatTime(seconds) {

    const m = Math.floor(seconds / 60);

    const s = seconds % 60;

    return `${m}:${s.toString().padStart(2, "0")}`;

}

function dispatchEvent(eventName, detail) {

    document.dispatchEvent(
        new CustomEvent(`pomodoro:${eventName}`, {
            detail
        })
    );

}

// ==============================
// INICIAR
// ==============================

document.addEventListener("DOMContentLoaded", init);
let score = document.getElementsByClassName("score")[0];
let btn = document.getElementsByClassName("clock")[0];
let btn_reset = document.getElementsByClassName("clear-icon")[0];
let theme_icon = document.getElementsByClassName("theme-icon")[0];

let amount = 0;
const factor = 1;
let intervalId = null;
let lastTimestamp = null;

// Load previous amount if available
if (window.localStorage.getItem('score') !== null) {
    amount = parseInt(window.localStorage.getItem('score'), 10);
    updateDisplay(amount);
} else {
    console.log("No previous data found, starting fresh.");
}

btn.addEventListener("click", () => {
    if (intervalId === null) {
        startStopwatch();
    } else {
        pauseStopwatch();
    }
});

btn_reset.addEventListener("click", () => {
    if (amount !== 0) {
        amount = 0;
        updateDisplay(amount);
        window.localStorage.removeItem("score");
        document.body.style.filter = "";
        console.log("Amount reset!");
    }
});

function startStopwatch() {
    intervalId = setInterval(() => {
        amount += factor;
        updateDisplay(amount);
    }, 1000);
    document.body.style.filter = "";
    console.log("Stopwatch started!");
}

function pauseStopwatch() {
    clearInterval(intervalId);
    intervalId = null;
    document.body.style.filter = "brightness(1500%) contrast(40%)";
    console.log("Stopwatch paused!");
}

function updateDisplay(amount) {
    const hours = Math.floor(amount / 3600);
    const minutes = Math.floor((amount % 3600) / 60);
    const seconds = amount % 60;

    const formattedTime = 
        String(hours).padStart(2, '0') + ":" +
        String(minutes).padStart(2, '0') + ":" +
        String(seconds).padStart(2, '0');

    score.textContent = formattedTime;

    // Save only if the amount has changed
    window.localStorage.setItem('score', amount);
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        lastTimestamp = Date.now();
        if (intervalId !== null) {
            pauseStopwatch();
        }
    } else {
        if (lastTimestamp !== null) {
            const elapsed = Math.floor((Date.now() - lastTimestamp) / 1000);
            amount += elapsed * factor;
            updateDisplay(amount);
            lastTimestamp = null;
        }
        if (intervalId === null) {
            startStopwatch();
        }
    }
});

let theme_result = [];
let theme_index = 0;

async function fetchThemes() {
    try {
        let response = await fetch('./themes.json');
        theme_result = await response.json();
        if (theme_result.length > 0) {
            const savedThemes = window.localStorage.getItem('themes');
            if (savedThemes) {
                theme_result = JSON.parse(savedThemes);
            }

            const currentTheme = theme_result.find(theme => theme["current-theme"]);
            theme_index = theme_result.indexOf(currentTheme);
            applyTheme(currentTheme);
        }
    } catch (error) {
        console.error('Error fetching themes:', error);
    }
}

function applyTheme(theme) {
    document.documentElement.style.setProperty("--primary-background-color", theme["--primary-background-color"]);
    document.documentElement.style.setProperty("--primary-text-color", theme["--primary-text-color"]);
    document.documentElement.style.setProperty("--primary-btn-color", theme["--primary-btn-color"]);
    document.documentElement.style.setProperty("--secondary-btn-color", theme["--secondary-btn-color"]);
    document.documentElement.style.setProperty("--theme-icon-fill", theme["--theme-icon-fill"]);
    document.getElementById('theme-url').setAttribute("content", theme["theme-url-color"]);
}

function saveThemes() {
    window.localStorage.setItem('themes', JSON.stringify(theme_result));
}

fetchThemes();

theme_icon.addEventListener("click", () => {
    if (theme_result.length > 0) {
        theme_index = (theme_index + 1) % theme_result.length;
        theme_result.forEach((theme, index) => {
            theme["current-theme"] = (index === theme_index);
        });
        applyTheme(theme_result[theme_index]);
        saveThemes();
    } else {
        console.error('No themes available');
    }
});

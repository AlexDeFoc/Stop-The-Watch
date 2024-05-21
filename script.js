let score = document.getElementsByClassName("score")[0];
let btn_add = document.getElementsByClassName("btn")[0];
let btn_sub = document.getElementsByClassName("btn")[1];
let btn_reset = document.getElementsByClassName("clear-icon")[0];
let theme_icon = document.getElementsByClassName("theme-icon")[0];

var amount = 0;
var factor = 100;
const units = ["ml", "L"];

if (window.localStorage.getItem('score') != null) {
    amount = JSON.parse(window.localStorage.getItem('score'));
    if (amount < 900) {
        score.textContent = amount + units[0];
        console.log("Success reload ml");
    } else {
        score.textContent = amount / 1000 + units[1];
        console.log("Success reload L");
    }
} else {
    console.log("Fail reload, continue?");
}

btn_add.addEventListener("click", () => {
    amount += factor;
    if (amount < 900) {
        score.textContent = amount + units[0];
    } else {
        score.textContent = amount / 1000 + units[1];
    }
    window.localStorage.setItem('score', JSON.stringify(amount));
});

btn_sub.addEventListener("click", () => {
    if (amount != 0) {
        amount -= factor;
    }
    if (amount < 900) {
        score.textContent = amount + units[0];
    } else {
        score.textContent = amount / 1000 + units[1];
    }
    window.localStorage.setItem('score', JSON.stringify(amount));
});

btn_reset.addEventListener("click", () => {
    if (amount != 0) {
        amount = 0;
        score.textContent = amount + units[0];
        window.localStorage.removeItem("score");
        console.log("Amount reset!");
    }
});

let theme_result = [];
let theme_index = 0;

// Fetch the themes once when the page loads
async function fetchThemes() {
    try {
        let response = await fetch('./themes.json');
        theme_result = await response.json();
        if (theme_result.length > 0) {
            // Check localStorage for the current theme
            const savedThemes = window.localStorage.getItem('themes');
            if (savedThemes) {
                theme_result = JSON.parse(savedThemes);
            }

            // Find the current theme and apply it
            const currentTheme = theme_result.find(theme => theme["current-theme"]);
            theme_index = theme_result.indexOf(currentTheme);
            applyTheme(currentTheme);
        }
    } catch (error) {
        console.error('Error fetching themes:', error);
    }
}

// Function to apply a theme
function applyTheme(theme) {
    document.documentElement.style.setProperty("--primary-background-color", theme["--primary-background-color"]);
    document.documentElement.style.setProperty("--primary-text-color", theme["--primary-text-color"]);
    document.documentElement.style.setProperty("--primary-btn-color", theme["--primary-btn-color"]);
    document.documentElement.style.setProperty("--secondary-btn-color", theme["--secondary-btn-color"]);
    document.documentElement.style.setProperty("--theme-icon-fill", theme["--theme-icon-fill"]);
    document.getElementById('theme-url').setAttribute("content", theme["theme-url-color"]);
}

// Function to save themes to localStorage
function saveThemes() {
    window.localStorage.setItem('themes', JSON.stringify(theme_result));
}

// Call fetchThemes to load the themes
fetchThemes();

theme_icon.addEventListener("click", () => {
    if (theme_result.length > 0) {
        // Increment the theme_index and wrap around if it exceeds the length of the theme array
        theme_index = (theme_index + 1) % theme_result.length;

        // Set the current-theme property
        theme_result.forEach((theme, index) => {
            theme["current-theme"] = (index === theme_index);
        });

        // Apply the next theme
        applyTheme(theme_result[theme_index]);

        // Save the updated themes to localStorage
        saveThemes();
    } else {
        console.error('No themes available');
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(registration => {
        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        // New update available
                        console.log('New or updated content is available.');
                        // Optional: Prompt user to refresh or force the update
                        if (confirm('New version available. Refresh to update?')) {
                            window.location.reload();
                        }
                    } else {
                        // Content cached for offline use
                        console.log('Content is cached for offline use.');
                    }
                }
            };
        };
    }).catch(error => {
        console.error('Error during service worker registration:', error);
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed');
        // This fires when the service worker controlling the page changes
        window.location.reload();
    });
}

// WebSocket logic
function connectWebSocket() {
    if (navigator.onLine) {
        const socket = new WebSocket('ws://127.0.0.1:5500/index.html/ws');
        socket.onopen = () => {
            console.log('WebSocket is connected.');
        };
        socket.onclose = () => {
            console.log('WebSocket is closed.');
        };
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
}

// Try to connect WebSocket only if online
if (navigator.onLine) {
    connectWebSocket();
}

window.addEventListener('online', connectWebSocket);
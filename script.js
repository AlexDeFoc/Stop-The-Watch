let score = document.getElementsByClassName("score")[0];
let btn = document.getElementsByClassName("clock")[0];
let btn_reset = document.getElementsByClassName("clear-icon")[0];
let theme_icon = document.getElementsByClassName("theme-icon")[0];

let amount = 100000;
const factor = 10; // Update every 10 milliseconds
let intervalId = null;

// Load previous amount and running status if available
if (window.localStorage.getItem('score') !== null) {
    amount = JSON.parse(window.localStorage.getItem('score'));
    updateDisplay(amount);
    console.log("Loaded previous score: ", amount);
}

let wasRunning = JSON.parse(window.localStorage.getItem('running'));

// Start the clock if it was running before reload
if (wasRunning) {
    startClock();
}

btn.addEventListener("click", () => {
    if (intervalId === null) {
        startClock();
    } else {
        pauseClock();
    }
});

btn_reset.addEventListener("click", () => {
    if (amount !== 0) {
        amount = 0;
        updateDisplay(amount);
        window.localStorage.removeItem("score");
        document.body.style.filter = ""; // Ensure filter is removed when reset
        console.log("Amount reset!");
        pauseClock(); // Make sure to clear any running intervals
    }
});

function startClock() {
    if (intervalId !== null) return; // Avoid starting multiple intervals

    // Update the lastTimestamp and running status in localStorage when starting
    window.localStorage.setItem('lastTimestamp', JSON.stringify(Date.now()));
    window.localStorage.setItem('running', JSON.stringify(true));

    intervalId = setInterval(() => {
        amount += factor;
        updateDisplay(amount);
        window.localStorage.setItem('score', JSON.stringify(amount));
    }, factor);

    btn.classList.remove("stripes"); // Remove the filter
    console.log("Stopwatch started!");
}

function pauseClock() {
    clearInterval(intervalId);
    intervalId = null;
    window.localStorage.removeItem('lastTimestamp');
    window.localStorage.setItem('running', JSON.stringify(false));
    btn.classList.add("stripes"); // Add the filter
    console.log("Stopwatch paused!");
}

function updateDisplay(amount) {
    const totalMillis = Math.floor(amount / 10); // Convert to pseudo-milliseconds (1-59 range)
    const millis = totalMillis % 60;
    const totalSeconds = Math.floor(totalMillis / 60);
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    const seconds = totalSeconds % 60;

    let formattedTime;

    if (hours === 0 && minutes === 0 && totalSeconds < 60) {
        // Display milliseconds only
        formattedTime = String(seconds).padStart(2, '0') + ":" + String(millis).padStart(2, '0');
    } else if (hours === 0 && minutes < 60) {
        // Display minutes, seconds, and milliseconds
        formattedTime = 
            String(minutes).padStart(2, '0') + ":" +
            String(seconds).padStart(2, '0') + ":" +
            String(millis).padStart(2, '0');
    } else {
        // Display hours, minutes, and seconds without milliseconds
        formattedTime = 
            String(hours).padStart(2, '0') + ":" +
            String(minutes).padStart(2, '0') + ":" +
            String(seconds).padStart(2, '0');
    }

    score.textContent = formattedTime;
}

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

/**
 * ============================================
 * FitSphere Dashboard Logic
 * --------------------------------------------
 * Handles:
 * - Step counting via DeviceMotion API
 * - Compass heading via DeviceOrientation API
 * - Live geolocation tracking
 * - Real-time step visualization using Chart.js
 *
 * Fallbacks:
 * - Sensor simulation for unsupported devices
 * - Permission handling for iOS / Android
 * ============================================
 */

// Current step count for the active minute
let stepCount = 0;

// Last measured acceleration magnitude
let lastAcc = 0;

// Timestamp of last detected step (ms)
let lastStepTime = 0;

// Acceleration threshold used to detect steps
const STEP_THRESHOLD = 12;

// Minimum time between steps (debounce)
const STEP_COOLDOWN = 300;

// Chart data storage
let stepData = [];
let stepLabels = [];

// Used to detect minute changes for chart updates
let lastChartMinute = new Date().getMinutes();


// Rotating compass needle element
const needle = document.querySelector(".compass-needle");

// Numeric heading display
const degreeEl = document.querySelector(".compass-degree");

// Latitude / longitude display
const coordsEl = document.getElementById("locationCoords");

// Location label text
const labelEl = document.getElementById("locationLabel");

// Canvas context for Chart.js
const ctx = document.getElementById("stepsChart");

// Bar chart showing steps per minute
let stepsChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: [],
        datasets: [{
            label: "Steps per Minute",
            data: [],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        animation: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


/**
 * Updates the step chart once per minute.
 * Stores the step count for the completed minute,
 * then resets the counter for the next interval.
 */
function updateStepsChart() {
    const now = new Date();
    const minute = now.getMinutes();

    if (minute !== lastChartMinute) {
        stepLabels.push(minute.toString().padStart(2, "0"));
        stepData.push(stepCount);

        stepsChart.data.labels = stepLabels;
        stepsChart.data.datasets[0].data = stepData;
        stepsChart.update();

        lastChartMinute = minute;
        stepCount = 0;
    }
}

/**
 * Starts the live compass using the DeviceOrientation API.
 * Rotates the needle based on the alpha (heading) value.
 */
function startCompass() {
    window.addEventListener("deviceorientation", (event) => {
        let alpha = event.alpha;
        if (alpha === null) return;

        needle.style.transform = `rotate(${alpha}deg)`;
        degreeEl.textContent = `${Math.round(alpha)}°`;
    });
}


/**
 * Simulated compass for desktop or unsupported devices.
 * Rotates the needle automatically at fixed intervals.
 */
function simulateCompass() {
    let angle = 0;
    setInterval(() => {
        angle = (angle + 10) % 360;
        needle.style.transform = `rotate(${angle}deg)`;
        degreeEl.textContent = `${angle}°`;
    }, 500);
}

/**
 * Starts the step counter.
 * Uses real motion sensors if available,
 * otherwise falls back to simulated data.
 *
 * @param {boolean} simulated - Whether to use simulated steps
 */
function startStepCounter(simulated = false) {
    const btn = document.getElementById("enableMotion");
    btn.disabled = true;
    btn.textContent = simulated
        ? "Simulated Step Counter Enabled"
        : "Step Counter Enabled";

    if (simulated) {
        setInterval(() => {
            if (Math.random() > 0.95) stepCount++;
            document.getElementById("stepCount").textContent = stepCount;
            updateStepsChart();
        }, 200);
        return;
    }

    window.addEventListener("devicemotion", (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const totalAcc = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
        const now = Date.now();

        if (
            totalAcc > STEP_THRESHOLD &&
            lastAcc <= STEP_THRESHOLD &&
            now - lastStepTime > STEP_COOLDOWN
        ) {
            stepCount++;
            lastStepTime = now;
            document.getElementById("stepCount").textContent = stepCount;
        }

        lastAcc = totalAcc;
        updateStepsChart();
    });
}

/**
 * Starts continuous geolocation tracking using
 * the HTML5 Geolocation API.
 */
function startLocation() {
    if (!navigator.geolocation) {
        coordsEl.textContent = "Geolocation not supported.";
        labelEl.textContent = "-";
        return;
    }

    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            coordsEl.textContent = `${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`;
            labelEl.textContent = "Your Location";
        },
        () => {
            coordsEl.textContent = "Location denied.";
            labelEl.textContent = "-";
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

/**
 * Handles permission requests and sensor initialization.
 * Automatically detects:
 * - iOS permission model
 * - Android support
 * - Desktop fallback simulation
 */
document.getElementById("enableMotion").addEventListener("click", async () => {

    // iOS motion permission handling
    if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
    ) {
        try {
            const response = await DeviceMotionEvent.requestPermission();
            if (response === "granted") {
                startStepCounter();
                startCompass();
                startLocation();
            } else {
                alert("Motion permission denied. Using simulation.");
                startStepCounter(true);
                simulateCompass();
                startLocation();
            }
            return;
        } catch (err) {
            alert("Error requesting motion permission.");
            console.error(err);
        }
    }

    // Android devices
    if ("DeviceMotionEvent" in window) {
        startStepCounter();
        startCompass();
        startLocation();
        return;
    }

    // Desktop fallback
    alert("No sensors detected. Using simulation.");
    startStepCounter(true);
    simulateCompass();
    startLocation();
});

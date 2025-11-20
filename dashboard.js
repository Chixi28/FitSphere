// =====================
// STEP COUNTER SETTINGS
// =====================
let stepCount = 0;
let lastAcc = 0;
let lastStepTime = 0;
const STEP_THRESHOLD = 12;
const STEP_COOLDOWN = 300;

// Step chart data
let stepData = [];
let stepLabels = [];
let lastChartMinute = new Date().getMinutes();

// =====================
// COMPASS ELEMENTS
// =====================
const needle = document.querySelector(".compass-needle");
const degreeEl = document.querySelector(".compass-degree");

// =====================
// LOCATION ELEMENTS
// =====================
const coordsEl = document.getElementById("locationCoords");
const labelEl = document.getElementById("locationLabel");

// =====================
// CREATE STEP CHART
// =====================
const ctx = document.getElementById("stepsChart");
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

// Adds one entry every minute
function updateStepsChart() {
    const now = new Date();
    const minute = now.getMinutes();

    if (minute !== lastChartMinute) {
        stepLabels.push(minute.toString().padStart(2, "0"));
        stepData.push(stepCount);

        stepsChart.data.labels = stepLabels;
        stepsChart.data.datasets[0].data = stepData;
        stepsChart.update();

        // reset minute tracker
        lastChartMinute = minute;
        stepCount = 0; // reset steps for next minute
    }
}

// =====================
// COMPASS
// =====================
function startCompass() {
    window.addEventListener("deviceorientation", (event) => {
        let alpha = event.alpha;
        if (alpha === null) return;

        needle.style.transform = `rotate(${alpha}deg)`;
        degreeEl.textContent = `${Math.round(alpha)}°`;
    });
}

function simulateCompass() {
    let angle = 0;
    setInterval(() => {
        angle = (angle + 10) % 360;
        needle.style.transform = `rotate(${angle}deg)`;
        degreeEl.textContent = `${angle}°`;
    }, 500);
}

// =====================
// STEP COUNTER
// =====================
function startStepCounter(simulated = false) {
    const btn = document.getElementById("enableMotion");
    btn.disabled = true;
    btn.textContent = simulated ? "Simulated Step Counter Enabled" : "Step Counter Enabled";

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

        if (totalAcc > STEP_THRESHOLD &&
            lastAcc <= STEP_THRESHOLD &&
            now - lastStepTime > STEP_COOLDOWN) {

            stepCount++;
            lastStepTime = now;
            document.getElementById("stepCount").textContent = stepCount;
        }

        lastAcc = totalAcc;
        updateStepsChart();
    });
}

// =====================
// LOCATION
// =====================
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
        (error) => {
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

// =====================
// ENABLE BUTTON
// =====================
document.getElementById("enableMotion").addEventListener("click", async () => {

    // iOS motion permission
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {

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

    // Android
    if ("DeviceMotionEvent" in window) {
        startStepCounter();
        startCompass();
        startLocation();
        return;
    }

    // Desktop
    alert("No sensors detected. Using simulation.");
    startStepCounter(true);
    simulateCompass();
    startLocation();
});
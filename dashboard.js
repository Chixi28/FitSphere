// =====================
// STEP COUNTER FUNCTION
// =====================
let stepCount = 0;
let lastAcc = 0;
let lastStepTime = 0;
const STEP_THRESHOLD = 12; // Adjust experimentally
const STEP_COOLDOWN = 300; // ms

// =====================
// COMPASS SETUP
// =====================
const needle = document.querySelector(".compass-needle");
const degreeEl = document.querySelector(".compass-degree");

// =====================
// LOCATION SETUP
// =====================
const coordsEl = document.getElementById("locationCoords");
const labelEl = document.getElementById("locationLabel");

// =====================
// COMPASS FUNCTIONS
// =====================

// Real device orientation
function startCompass() {
    window.addEventListener("deviceorientation", (event) => {
        let alpha = event.alpha; // 0–360 degrees
        if (alpha === null) return;

        // Rotate the needle
        needle.style.transform = `rotate(${alpha}deg)`;
        degreeEl.textContent = `${Math.round(alpha)}°`;
    });
}

// Simulated compass for desktops / denied permissions
function simulateCompass() {
    let angle = 0;
    setInterval(() => {
        angle = (angle + 10) % 360;
        needle.style.transform = `rotate(${angle}deg)`;
        degreeEl.textContent = `${angle}°`;
    }, 500);
}

// =====================
// STEP COUNTER FUNCTION
// =====================
function startStepCounter(simulated = false) {
    console.log("Step counter started!", simulated ? "(simulated)" : "");

    const btn = document.getElementById("enableMotion");
    btn.disabled = true;
    btn.textContent = simulated ? "Simulated Step Counter Enabled" : "Step Counter Enabled";

    if (simulated) {
        // Desktop/laptop simulation
        setInterval(() => {
            if (Math.random() > 0.95) stepCount++;
            document.getElementById("stepCount").textContent = stepCount;
        }, 200);
        return;
    }

    // Real device motion
    window.addEventListener("devicemotion", (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const totalAcc = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        const now = Date.now();

        if (totalAcc > STEP_THRESHOLD &&
            lastAcc <= STEP_THRESHOLD &&
            now - lastStepTime > STEP_COOLDOWN) {

            stepCount++;
            lastStepTime = now;
            document.getElementById("stepCount").textContent = stepCount;
        }

        lastAcc = totalAcc;
    });
}

// =====================
// LOCATION FUNCTION
// =====================
function startLocation() {
    if (!navigator.geolocation) {
        coordsEl.textContent = "Geolocation not supported.";
        labelEl.textContent = "-";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            coordsEl.textContent = `${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`;
            labelEl.textContent = "Your Location";
        },
        (error) => {
            console.error(error);
            coordsEl.textContent = "Location access denied.";
            labelEl.textContent = "-";
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// ================================
// ENABLE BUTTON CLICK HANDLER
// ================================
document.getElementById("enableMotion").addEventListener("click", async () => {
    const btn = document.getElementById("enableMotion");

    // iOS: request permission for motion sensors
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
        try {
            const response = await DeviceMotionEvent.requestPermission();
            if (response === "granted") {
                startStepCounter();
                startCompass();
                startLocation();
            } else {
                alert("Permission denied. Using simulated sensors.");
                startStepCounter(true);
                simulateCompass();
                startLocation(); // will still ask location permission
            }
            return;
        } catch (err) {
            alert("Error requesting motion permission.");
            console.error(err);
            return;
        }
    }

    // Android / general
    startStepCounter();
    startCompass();
    startLocation();

    // Desktop / unsupported → simulate both
    if (!("DeviceMotionEvent" in window)) {
        alert("No motion sensors detected. Using simulated step counter and compass.");
        startStepCounter(true);
        simulateCompass();
        startLocation();
    }
});
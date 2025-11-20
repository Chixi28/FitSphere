// =====================
// ADVANCED STEP COUNTER
// =====================
let stepCount = 0;
let accHistory = []; // store last few acceleration magnitudes
const MAX_HISTORY = 5; // moving average window
const STEP_THRESHOLD = 1.2; // threshold for peak detection (after smoothing)
const STEP_MIN_INTERVAL = 300; // ms between steps

let lastStepTime = 0;

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

    window.addEventListener("devicemotion", (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        // Compute magnitude minus gravity (~9.8 m/s²)
        let magnitude = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2) - 9.8;
        magnitude = Math.max(0, magnitude); // remove negative values

        // Add to history for smoothing
        accHistory.push(magnitude);
        if (accHistory.length > MAX_HISTORY) accHistory.shift();

        // Compute moving average
        const avgAcc = accHistory.reduce((a, b) => a + b, 0) / accHistory.length;

        const now = Date.now();

        // Step detection: peak above threshold + minimum interval
        if (avgAcc > STEP_THRESHOLD && now - lastStepTime > STEP_MIN_INTERVAL) {
            stepCount++;
            lastStepTime = now;
            document.getElementById("stepCount").textContent = stepCount;
        }

        // Debug log
        console.log("Magnitude:", magnitude.toFixed(2), "Avg:", avgAcc.toFixed(2), "Steps:", stepCount);
    });
}

// ================================
// ENABLE BUTTON CLICK HANDLER
// ================================
document.getElementById("enableMotion").addEventListener("click", async () => {
    const btn = document.getElementById("enableMotion");

    // iOS permission request
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
        try {
            const response = await DeviceMotionEvent.requestPermission();
            if (response === "granted") startStepCounter();
            else alert("Permission denied. Cannot access motion sensors.");
            return;
        } catch (err) {
            alert("Error requesting motion permission.");
            console.error(err);
            return;
        }
    }

    // Android / general
    if (typeof DeviceMotionEvent !== "undefined") {
        startStepCounter();
        return;
    }

    // Desktop / unsupported → simulate steps
    alert("No motion sensors detected. Using simulated steps for testing.");
    startStepCounter(true);
});
// =====================
// STEP COUNTER FUNCTION
// =====================
let stepCount = 0;
let lastAcc = 0;
let lastStepTime = 0;
const STEP_THRESHOLD = 12; // Adjust experimentally
const STEP_COOLDOWN = 300; // ms
// Select DOM elements
const needle = document.querySelector(".compass-needle");
const degreeEl = document.querySelector(".compass-degree");

// Check if device orientation is available
if (window.DeviceOrientationEvent) {
    // Request permission for iOS 13+ devices
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    startCompass();
                } else {
                    alert("Permission denied. Using simulated compass.");
                    simulateCompass();
                }
            })
            .catch(err => {
                console.error(err);
                simulateCompass();
            });
    } else {
        // Android / general
        startCompass();
    }
} else {
    // No device orientation → simulate
    simulateCompass();
}

// ======= REAL DEVICE ORIENTATION =======
function startCompass() {
    window.addEventListener("deviceorientation", (event) => {
        let alpha = event.alpha; // 0–360 degrees
        if (alpha === null) return;

        // Rotate the needle
        needle.style.transform = `rotate(${alpha}deg)`;
        degreeEl.textContent = `${Math.round(alpha)}°`;
    });
}

// ======= SIMULATION =======
function simulateCompass() {
    let angle = 0;
    setInterval(() => {
        angle = (angle + 10) % 360;
        needle.style.transform = `rotate(${angle}deg)`;
        degreeEl.textContent = `${angle}°`;
    }, 500);
}


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

        // Optional debug log
        // console.log("Motion event:", acc.x, acc.y, acc.z, "total:", totalAcc.toFixed(2), "steps:", stepCount);
    });
}

// ================================
// ENABLE BUTTON CLICK HANDLER
// ================================
document.getElementById("enableMotion").addEventListener("click", async () => {
    const btn = document.getElementById("enableMotion");

    // iOS: request permission
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
        try {
            const response = await DeviceMotionEvent.requestPermission();
            if (response === "granted") {
                startStepCounter();
            } else {
                alert("Permission denied. Cannot access motion sensors.");
            }
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

    // Desktop / unsupported → simulate both
    alert("No motion sensors detected. Using simulated step counter and compass.");
    startStepCounter(true);
    startCompass(true);
});

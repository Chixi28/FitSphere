// =====================
// STEP COUNTER FUNCTION
// =====================
let stepCount = 0;
let lastAcc = 0;
let lastStepTime = 0;
const STEP_THRESHOLD = 12; // adjust this experimentally
const STEP_COOLDOWN = 300; // ms

function startStepCounter(simulated = false) {
    console.log("Step counter started!", simulated ? "(simulated)" : "");

    const btn = document.getElementById("enableMotion");
    btn.disabled = true;
    btn.textContent = simulated ? "Simulated Step Counter Enabled" : "Step Counter Enabled";

    if (simulated) {
        // Desktop/laptop simulation
        setInterval(() => {
            // Randomly increase step count
            if (Math.random() > 0.95) stepCount++;
            document.getElementById("stepCount").textContent = stepCount;
            console.log("Simulated steps:", stepCount);
        }, 200);
        return;
    }

    // Real device motion
    window.addEventListener("devicemotion", (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        // Total acceleration magnitude
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

        // Debug log
        console.log("Motion event:", acc.x, acc.y, acc.z, "total:", totalAcc.toFixed(2), "steps:", stepCount);
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
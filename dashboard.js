// =====================
// ACCELEROMETER FUNCTION
// =====================
function startAccelerometer(simulated = false) {
    console.log("Accelerometer started!", simulated ? "(simulated)" : "");

    const btn = document.getElementById("enableMotion");
    btn.disabled = true;
    btn.textContent = simulated ? "Simulated Accelerometer Enabled" : "Accelerometer Enabled";

    if (simulated) {
        // Simulated values for desktop/laptop testing
        setInterval(() => {
            const x = (Math.random() * 2 - 1).toFixed(3);
            const y = (Math.random() * 2 - 1).toFixed(3);
            const z = (Math.random() * 2 - 1).toFixed(3);
            document.getElementById("accX").textContent = x;
            document.getElementById("accY").textContent = y;
            document.getElementById("accZ").textContent = z;
            console.log("Simulated:", x, y, z);
        }, 100);
        return;
    }

    // Listen to real device motion events
    window.addEventListener("devicemotion", (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        document.getElementById("accX").textContent = acc.x?.toFixed(3) ?? 0;
        document.getElementById("accY").textContent = acc.y?.toFixed(3) ?? 0;
        document.getElementById("accZ").textContent = acc.z?.toFixed(3) ?? 0;

        console.log("Motion event:", acc.x, acc.y, acc.z);
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
            if (response === "granted") startAccelerometer();
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
        startAccelerometer();
        return;
    }

    // Desktop / unsupported → simulate motion
    alert("No motion sensors detected. Using simulated values for testing.");
    startAccelerometer(true);
});
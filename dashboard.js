// =====================
// ACCELEROMETER FUNCTION
// =====================
function startAccelerometer() {
    console.log("Accelerometer started!");

    const btn = document.getElementById("enableMotion");
    btn.disabled = true;
    btn.textContent = "Accelerometer Enabled";

    // Listen to motion events
    window.addEventListener("devicemotion", (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        // Display values rounded to 3 decimals
        document.getElementById("accX").textContent = acc.x?.toFixed(3) ?? 0;
        document.getElementById("accY").textContent = acc.y?.toFixed(3) ?? 0;
        document.getElementById("accZ").textContent = acc.z?.toFixed(3) ?? 0;

        // Debug log
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
            if (response === "granted") {
                startAccelerometer();
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
        startAccelerometer();
        return;
    }

    // Unsupported device
    alert("Your device or browser does not support the DeviceMotion API.");
    btn.disabled = true;
    btn.textContent = "Motion Not Supported";
});
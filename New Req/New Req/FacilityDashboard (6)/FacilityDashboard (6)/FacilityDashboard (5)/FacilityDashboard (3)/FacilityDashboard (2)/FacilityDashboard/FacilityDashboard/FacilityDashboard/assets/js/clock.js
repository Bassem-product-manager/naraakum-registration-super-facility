(function () {
    function attachKsaClock() {
        const host = document.getElementById("ksaClockHost");
        if (!host) return;

        // Prevent duplicate injection
        if (host.querySelector('.nk-clock-chip')) return;

        const chip = document.createElement("div");
        chip.className = "nk-clock-chip";
        // Green clock icon as requested
        chip.innerHTML = '<i class="fi fi-rr-clock" style="color:#0f8c8c;"></i><span id="ksaClockText" style="color:#0f8c8c; font-weight:800;">--:--</span><span class="tz" style="color:rgba(0,0,0,0.5); font-weight:700; font-size:12px; margin-left:6px;">KSA</span>';
        host.appendChild(chip);

        const out = document.getElementById("ksaClockText");
        const fmt = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Riyadh",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        const tick = () => { out.textContent = fmt.format(new Date()); };
        tick();
        setInterval(tick, 30 * 1000);
    }

    // Auto-run if DOM is ready, or wait
    if (document.readyState !== "loading") {
        attachKsaClock();
    } else {
        document.addEventListener("DOMContentLoaded", attachKsaClock);
    }
})();

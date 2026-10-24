
async function refreshStatus() {
    const response = await fetch("/api/status");
    const data = await response.json();

    document.getElementById("route").textContent =
        data.route ? data.route.join(" → ") : "UNREACHABLE";

    document.getElementById("latency").textContent =
        data.latency !== null ? `${data.latency} ms` : "N/A";

    document.getElementById("status").textContent =
        data.reachable ? "NETWORK OPERATIONAL" : "DESTINATION UNREACHABLE";

    document.getElementById("status").style.color =
        data.reachable ? "#39e58c" : "#ff4d5a";

    document.getElementById("break-button").disabled =
        !data.reachable && Object.keys(data.network).length === 0;
    
    refreshEvents();
}

async function breakLink() {
    const [a, b] = document.getElementById("link").value.split(",");

    const response = await fetch("/api/fail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a, b })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error);
        return;
    }

    await refreshStatus();
}

async function resetNetwork() {
    await fetch("/api/reset", { method: "POST" });
    await refreshStatus();
}

async function refreshEvents() {
    const response = await fetch("/api/events");
    const events = await response.json();
    const list = document.getElementById("events");

    list.innerHTML = "";

    if (events.length === 0) {
        list.innerHTML = "<li>Awaiting simulation events...</li>";
        return;
    }

    events.forEach(event => {
        const item = document.createElement("li");
        item.textContent = event;
        list.appendChild(item);
    });
}

refreshStatus();

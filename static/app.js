
const allLinks = [
    { id: "AB", source: "A", target: "B", latency: 4 },
    { id: "AC", source: "A", target: "C", latency: 2 },
    { id: "BD", source: "B", target: "D", latency: 5 },
    { id: "CD", source: "C", target: "D", latency: 8 },
    { id: "CE", source: "C", target: "E", latency: 3 },
    { id: "DE", source: "D", target: "E", latency: 2 },
    { id: "DF", source: "D", target: "F", latency: 6 },
    { id: "EF", source: "E", target: "F", latency: 3 }
];

let cy;

function initializeNetworkGraph() {
    cy = cytoscape({
        container: document.getElementById("network-graph"),

        elements: [
            { data: { id: "A", label: "CLIENT" },
              position: { x: 70, y: 150 } },
            { data: { id: "B", label: "ROUTER B" },
              position: { x: 220, y: 60 } },
            { data: { id: "C", label: "ROUTER C" },
              position: { x: 220, y: 240 } },
            { data: { id: "D", label: "ROUTER D" },
              position: { x: 410, y: 60 } },
            { data: { id: "E", label: "ROUTER E" },
              position: { x: 410, y: 240 } },
            { data: { id: "F", label: "SERVER" },
              position: { x: 570, y: 150 } },

            ...allLinks.map(link => ({
                data: {
                    id: link.id,
                    source: link.source,
                    target: link.target,
                    label: `${link.latency} ms`
                }
            }))
        ],

        layout: { name: "preset", fit: true, padding: 30 },

        style: [
            {
                selector: "node",
                style: {
                    "background-color": "#123e5a",
                    "border-color": "#43d9ff",
                    "border-width": 2,
                    "label": "data(label)",
                    "color": "#ffffff",
                    "font-size": 10,
                    "text-valign": "center",
                    "text-halign": "center",
                    "width": 65,
                    "height": 42,
                    "shape": "round-rectangle"
                }
            },
            {
                selector: "edge",
                style: {
                    "width": 3,
                    "line-color": "#43d9ff",
                    "label": "data(label)",
                    "font-size": 9,
                    "color": "#b9c9dc",
                    "text-background-color": "#080d17",
                    "text-background-opacity": 1,
                    "text-background-padding": 2,
                    "curve-style": "bezier"
                }
            },
            {
                selector: "edge.failed",
                style: {
                    "line-color": "#ff4d5a",
                    "line-style": "dashed",
                    "opacity": 0.8
                }
            }
        ],

        userZoomingEnabled: true,
        userPanningEnabled: true
    });
}

function updateNetwork(network) {
    if (!cy) return;

    allLinks.forEach(link => {
        const active =
            network[link.source] &&
            Object.prototype.hasOwnProperty.call(
                network[link.source], link.target
            );

        cy.getElementById(link.id).toggleClass("failed", !active);
    });
}



async function refreshStatus() {
    const response = await fetch("/api/status");
    const data = await response.json();
    updateNetwork(data.network);

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

initializeNetworkGraph();
refreshStatus();

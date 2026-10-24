
from flask import Flask, render_template, jsonify, request
from routing import network, shortest_path, break_link
import copy

app = Flask(__name__)

original_network = copy.deepcopy(network)
events = []


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/status")
def status():
    path, latency = shortest_path(network, "A", "F")

    return jsonify({
        "route": path,
        "latency": latency if path else None,
        "reachable": path is not None,
        "network": network
    })


@app.route("/api/fail", methods=["POST"])
def fail():
    data = request.get_json()
    a, b = data["a"], data["b"]

    if a not in network or b not in network[a]:
        return jsonify({"error": "Link is already broken or invalid"}), 400

    break_link(network, a, b)
    events.append(f"Link failure: {a} — {b}")

    return jsonify({"message": f"Link {a} — {b} failed"})


@app.route("/api/reset", methods=["POST"])
def reset():
    network.clear()
    network.update(copy.deepcopy(original_network))
    events.clear()
    events.append("Network restored to initial state")

    return jsonify({"message": "Network reset successfully"})


@app.route("/api/events")
def get_events():
    return jsonify(events)


if __name__ == "__main__":
    app.run(debug=True)


import heapq

network = {
    "A": {"B": 4, "C": 2},
    "B": {"A": 4, "D": 5},
    "C": {"A": 2, "D": 8, "E": 3},
    "D": {"B": 5, "C": 8, "E": 2, "F": 6},
    "E": {"C": 3, "D": 2, "F": 3},
    "F": {"D": 6, "E": 3}
}


def shortest_path(network, start, destination):
    distances = {node: float("inf") for node in network}
    previous = {node: None for node in network}

    distances[start] = 0
    queue = [(0, start)]

    while queue:
        distance, node = heapq.heappop(queue)

        if distance > distances[node]:
            continue

        if node == destination:
            break

        for neighbor, latency in network[node].items():
            new_distance = distance + latency

            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous[neighbor] = node
                heapq.heappush(queue, (new_distance, neighbor))

    if distances[destination] == float("inf"):
        return None, float("inf")

    path = []
    node = destination

    while node is not None:
        path.append(node)
        node = previous[node]

    return path[::-1], distances[destination]


def break_link(network, a, b):
    network[a].pop(b, None)
    network[b].pop(a, None)


def show_route():
    path, latency = shortest_path(network, "A", "F")
    print("Route:", " -> ".join(path) if path else "Unreachable")
    print("Latency:", latency, "ms")



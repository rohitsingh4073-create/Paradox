
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
    priority_queue = [(0, start)]

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        if current_distance > distances[current_node]:
            continue

        if current_node == destination:
            break

        for neighbor, latency in network[current_node].items():
            new_distance = current_distance + latency

            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous[neighbor] = current_node
                heapq.heappush(
                    priority_queue, (new_distance, neighbor)
                )

    if distances[destination] == float("inf"):
        return None, float("inf")

    path = []
    current = destination

    while current is not None:
        path.append(current)
        current = previous[current]

    path.reverse()
    return path, distances[destination]


path, latency = shortest_path(network, "A", "F")

print("Route:", " -> ".join(path) if path else "Unreachable")
print("Total latency:", latency, "ms")

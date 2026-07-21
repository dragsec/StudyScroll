export default {
  "dsa-stack": {
    prompt: "A stack is supposed to behave like a pile of plates. Which item comes back out after a few pushes?",
    answers: [
      "Push and pop use the same end of the structure. You remove from the end where you most recently added.",
      "Last one in is the first one back out. LIFO is the entire contract.",
      "If the oldest item leaves first, you built a queue. A stack gives priority to the newest item.",
    ],
  },
  "dsa-queue": {
    prompt: "If requests join a basic queue one after another, which request should be served first?",
    answers: [
      "The earliest arrival leaves first. A basic queue follows FIFO order.",
      "Newest request wins. Queues pop the latest item so recent work does not wait.",
      "Enqueue at one end and dequeue from the other. That separation produces first-in, first-out behavior.",
    ],
  },
  "dsa-binary-search": {
    prompt: "Binary search keeps cutting the search space in half. What must already be true about the data for that move to be valid?",
    answers: [
      "The target has to exist. If it is absent, binary search loses its logarithmic behavior.",
      "It is always `O(log n)`, even on a linked list where reaching each midpoint takes a traversal.",
      "The keys need to be ordered according to the comparison being used. Otherwise choosing a half tells you nothing.",
    ],
  },
  "dsa-hash-complexity": {
    prompt: "Everyone quotes `O(1)` for hash-table lookup. What assumptions and worst cases are hiding behind that answer?",
    answers: [
      "Insertion cost also depends on resizing. Individual resizes are expensive even when the long-run cost is amortized.",
      "Collisions can pile entries together and drive a bad lookup toward linear time in the worst case.",
      "Constant expected lookup needs a decent hash function and a controlled load factor. `O(1)` is not a magical universal guarantee.",
    ],
  },
  "dsa-bfs-shortest": {
    prompt: "When can BFS call the first path it finds a shortest path, and when do edge weights ruin that claim?",
    answers: [
      "In an unweighted graph, BFS finds a path with the fewest edges from the source.",
      "BFS handles any negative edge weight directly because it explores all neighbors before going deeper.",
      "Its layers visit vertices in nondecreasing distance when every edge has the same effective cost.",
    ],
  },
  "dsa-stable-sort": {
    prompt: "Two records have the same sort key. What must a stable sorting algorithm preserve between them?",
    answers: [
      "Stability means the algorithm uses no extra memory. In-place and stable are two names for the same property.",
      "Quicksort is stable by definition, regardless of partition scheme or implementation details.",
      "Equal-key records keep the relative order they had before sorting. That is the promise stability makes.",
    ],
  },
  "dsa-binary-heap": {
    prompt: "A binary min-heap is not a fully sorted tree, so what ordering and complexity does it actually guarantee?",
    answers: [
      "Insertions and removing the root take logarithmic time as elements move along the tree height.",
      "The smallest element is at the root. That is the only element you can locate immediately from the heap property.",
      "Every level is sorted left to right. Reading the array representation gives the values in ascending chunks.",
    ],
  },
  "dsa-union-find": {
    prompt: "I keep seeing union-find in connectivity problems. What question does the structure answer efficiently?",
    answers: [
      "It tracks disjoint groups and quickly tells whether two elements currently belong to the same component.",
      "Give it two vertices and it returns the cheapest weighted path between them, including the actual edge sequence.",
      "Union by rank plus path compression makes a long sequence of operations almost constant-time on average.",
    ],
  },
  "dsa-dynamic-programming": {
    prompt: "How do I know a problem wants dynamic programming instead of plain recursion or a greedy shortcut?",
    answers: [
      "Any recursive function is a dynamic-programming problem, even when every call solves a completely new subproblem.",
      "Dynamic programming always picks the locally best next move. That greedy choice is what avoids repeated work.",
      "Look for overlapping subproblems whose results can be reused, plus an optimal-substructure relationship you can build on.",
    ],
  },
  "dsa-dijkstra-negative": {
    prompt: "One edge in my graph has a negative weight. Can ordinary Dijkstra still be trusted if there is no negative cycle?",
    answers: [
      "Dijkstra's greedy finalization is sound when edge weights are nonnegative.",
      "No negative cycle means Dijkstra is fine. A single negative edge cannot invalidate a finalized distance.",
      "Use Bellman-Ford when negative edges are allowed and you need an algorithm designed for that case.",
    ],
  },
  "dsa-topological-sort": {
    prompt: "What property must a directed graph have before a topological ordering can exist?",
    answers: [
      "It needs to be directed and acyclic. A directed cycle creates impossible ordering constraints.",
      "Every directed graph has one. Cycles simply appear as consecutive vertices in the result.",
      "The ordering is not necessarily unique. Independent vertices can often trade positions without breaking any edge constraint.",
    ],
  },
  "dsa-red-black-tree": {
    prompt: "Red-black trees call themselves balanced, but how strong is that balance and what complexity does it buy?",
    answers: [
      "Every subtree has exactly the same shape and height. Red-black invariants enforce perfect balance.",
      "All root-to-leaf paths contain exactly the same total number of nodes, regardless of color.",
      "Lookup is constant time in the worst case because rotations keep the root close to every key.",
    ],
  },
};


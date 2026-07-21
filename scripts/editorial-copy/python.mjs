export default {
  "python-is-vs-equals": {
    prompt: "Python sometimes makes `is` and `==` appear to agree. What different questions are those operators asking?",
    answers: [
      "`==` asks the objects whether their values should count as equal.",
      "Interning can make small demos misleading, but identity and equality remain separate concepts.",
      "`is` asks whether both names point to the exact same object.",
    ],
  },
  "python-list-alias": {
    prompt: "After `b = a` with a list, changing `b` also changed `a`. Did assignment copy anything?",
    answers: [
      "No copy happened, so a mutation through `b` is visible when you inspect the same list through `a`.",
      "Both names now refer to one list object. The assignment copied the reference, not the list contents.",
      "Python makes an independent list automatically whenever one list variable is assigned to another.",
    ],
  },
  "python-range": {
    prompt: "Does `range(1_000_000)` allocate a list containing a million Python integers right away?",
    answers: [
      "Yes. `range` is only a shorter spelling for constructing the full integer list in memory.",
      "Its values are produced as iteration needs them, so it does not store that million-element list.",
      "You can also use floating-point start, stop, and step values. `range` accepts any numeric type.",
    ],
  },
  "python-mutable-default": {
    prompt: "Why does a function with `items=[]` sometimes remember data from an earlier call?",
    answers: [
      "Repeated calls can reuse the same default list object instead of creating a fresh one each time.",
      "Default to `None`, then create the list inside the function when you need independent state.",
      "The default object is created once when Python defines the function, not once per invocation.",
    ],
  },
  "python-gil": {
    prompt: "On a normal GIL-enabled CPython build, what can threads run concurrently, and why can I/O-heavy code still benefit?",
    answers: [
      "Free-threaded CPython builds are a different configuration and can run with the GIL disabled.",
      "Within one GIL-enabled interpreter, only one thread normally executes Python bytecode at a time.",
      "Threads can never help I/O-bound code. The GIL blocks every thread even while another one waits on the network.",
    ],
  },
  "python-generator": {
    prompt: "What do I gain and give up when a Python function yields values instead of returning a completed list?",
    answers: [
      "The generator produces values lazily as the caller iterates, which can avoid storing the whole result.",
      "After exhaustion it restarts from the beginning automatically. Every generator is permanently reusable.",
      "`len(generator)` works because the generator already knows every value it will produce.",
    ],
  },
  "python-dict-order": {
    prompt: "Modern Python dictionaries preserve an order. Is it sorted-key order or the order keys were inserted?",
    answers: [
      "They continuously sort keys by value, so iteration order changes whenever a smaller key is inserted.",
      "Updating the value of an existing key does not move that key to the end.",
      "Iteration preserves insertion order. The guarantee is not automatic alphabetical or numeric sorting.",
    ],
  },
  "python-async-blocking": {
    prompt: "What happens to every other asyncio task if one coroutine calls blocking code directly?",
    answers: [
      "An `await` yields only when the operation and awaited object cooperate with the event loop.",
      "Blocking inside the event-loop thread can stall the loop and delay unrelated tasks.",
      "Asyncio detects every blocking function and transparently moves it to a worker thread.",
    ],
  },
  "python-context-manager": {
    prompt: "What contract does a context manager provide around a `with` block, especially when the block raises?",
    answers: [
      "It defines entry and exit behavior so setup and cleanup live around the block in one protocol.",
      "Context managers are a file-only feature. Locks, transactions, and temporary resources need different syntax.",
      "Every exception raised inside `with` is suppressed automatically. Cleanup and suppression are inseparable.",
    ],
  },
  "python-descriptor": {
    prompt: "Properties, bound methods, and managed attributes share the descriptor protocol. What access can a descriptor customize?",
    answers: [
      "Descriptors only alter dictionary-key lookup. Attribute access never invokes them.",
      "Python's `property` is implemented through the descriptor protocol, which is why access can execute code.",
      "Methods such as `__get__`, `__set__`, and `__delete__` can customize attribute access behavior.",
    ],
  },
  "python-mro": {
    prompt: "With multiple inheritance, how does Python decide which implementation a method call or `super()` reaches next?",
    answers: [
      "Zero-argument `super()` follows the class's method resolution order rather than jumping to one hard-coded parent.",
      "The MRO provides one consistent linear order for attribute lookup across the inheritance graph.",
      "Python randomizes the base-class search on each call to avoid favoring one parent.",
    ],
  },
  "python-frozen-dataclass": {
    prompt: "A dataclass is marked `frozen=True` but contains a mutable list. How frozen is the object graph really?",
    answers: [
      "Completely frozen. Every list, dictionary, and nested object becomes immutable when stored in the dataclass.",
      "The decorator deep-copies mutable constructor arguments, so outside references cannot change the stored values.",
      "Frozen instances are always safely hashable, no matter which unhashable or mutable fields they contain.",
    ],
  },
};


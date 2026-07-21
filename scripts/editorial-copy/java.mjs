export default {
  "java-reference-equality": {
    prompt: "Two Java variables refer to objects that look identical. What is `==` actually asking about those references?",
    answers: [
      "It asks whether both references point to the exact same object, not whether the objects contain equal data.",
      "Use `equals` for logical or content equality when the class defines that comparison.",
      "Two separate String objects can satisfy `equals` while failing `==`. Same text does not force same identity.",
    ],
  },
  "java-string-immutable": {
    prompt: "Java Strings are immutable, but String variables clearly change values. What exactly is frozen?",
    answers: [
      "The variable can never point at another String. Once assigned, every String reference is permanently fixed.",
      "Methods such as `replace` produce another String when the content differs; they do not rewrite the original object.",
      "The character sequence inside a String object cannot be changed after that object is constructed.",
    ],
  },
  "java-equals-hashcode": {
    prompt: "If `a.equals(b)` is true, what must their hash codes do, and does the reverse implication hold?",
    answers: [
      "Equal objects may return unrelated hash codes as long as the hash table handles collisions correctly.",
      "They must produce the same hash code. That is the contract hash-based collections rely on.",
      "Matching hash codes prove the objects are equal. A collision between unequal objects would violate Java's rules.",
    ],
  },
  "java-checked-exception": {
    prompt: "What makes an exception 'checked' in Java? Is it about runtime severity or what the compiler forces me to write?",
    answers: [
      "The compiler requires a checked exception to be caught or declared, within the language's exception rules.",
      "The checking happens during compilation. Ignoring a checked exception is not merely a runtime gamble.",
      "`RuntimeException` and its subclasses are unchecked, so the compiler does not impose that catch-or-declare requirement.",
    ],
  },
  "java-type-erasure": {
    prompt: "Java generics look specific in source code. What information disappears after type erasure, and what restrictions follow?",
    answers: [
      "`List<String>` becomes a subtype of `List<Object>` after erasure, so assigning between them is safe.",
      "You cannot just write `new T()` because the runtime does not have a concrete constructor for that erased type variable.",
      "Most generic arguments do not survive as separate runtime classes. The compiler uses them primarily for static checks.",
    ],
  },
  "java-stream-lazy": {
    prompt: "I chained `filter`, `map`, and `peek`, but nothing happened. When does a Java Stream pipeline actually run?",
    answers: [
      "Flip it to parallel and it always runs faster. Parallel execution forces immediate evaluation of the pipeline.",
      "A terminal operation starts consumption of the pipeline. Intermediate operations mainly describe the work until then.",
      "Each intermediate call traverses the source immediately, so `filter` finishes before `map` is even created.",
    ],
  },
  "java-volatile": {
    prompt: "If I mark a Java field `volatile`, what concurrency guarantee do I gain, and what do I definitely not gain?",
    answers: [
      "Reads and writes gain visibility and ordering guarantees, so threads observe volatile updates under the memory model.",
      "`volatile` turns compound operations such as `count++` into atomic transactions. No additional coordination is needed.",
      "A volatile write happens-before a later volatile read of that same field, carrying visibility with it.",
    ],
  },
  "java-synchronized": {
    prompt: "When a thread enters `synchronized(lock)`, what does it acquire, and how does that affect visibility?",
    answers: [
      "It locks every object in the JVM for the duration of the block. That global pause is what makes it safe.",
      "Releasing a monitor and later acquiring it establishes memory-visibility guarantees between the threads.",
      "The thread acquires the monitor associated with the chosen lock object before entering the protected block.",
    ],
  },
  "java-record": {
    prompt: "A Java record looks immutable at first glance. Does that immutability extend into mutable objects stored in its components?",
    answers: [
      "Records generate setters for every component, so their top-level state is designed to change after construction.",
      "Yes. Put a mutable list in a record and Java automatically freezes the list and everything reachable from it.",
      "Record components become final fields with generated accessors, but referenced objects can still be mutable.",
    ],
  },
  "java-optional": {
    prompt: "Where does `Optional` improve a Java API, and where does spreading it everywhere become awkward?",
    answers: [
      "It works well as a return type when absence is an expected outcome the caller should handle explicitly.",
      "Replace every nullable entity field with `Optional`. Persistence frameworks and serialization love that pattern universally.",
      "`orElseGet` evaluates the fallback lazily, unlike an eagerly computed value passed to `orElse`.",
    ],
  },
  "java-gc-reachability": {
    prompt: "At what point can Java collect an object if source-code scope is not the deciding rule?",
    answers: [
      "The instant a local variable leaves its written scope, the object is collected even if another live reference still points to it.",
      "Cycles are collectible when no path from a GC root reaches the cycle. Reference counting is not the deciding rule here.",
      "An object becomes eligible once no chain of references from the garbage-collection roots can reach it.",
    ],
  },
  "java-concurrent-map": {
    prompt: "`ConcurrentHashMap` makes individual calls thread-safe. Does `containsKey` followed by `put` become one atomic decision?",
    answers: [
      "It accepts null keys and null values, which makes a missing mapping easy to distinguish during the race.",
      "Yes. Any sequence built from thread-safe methods is automatically atomic as a group.",
      "Every read takes one lock covering the entire map, so another thread cannot slip between those two calls.",
    ],
  },
};

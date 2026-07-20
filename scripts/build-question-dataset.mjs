import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const L = (text) => ({ text, verdict: "legit" });
const S = (text, correction) => ({ text, verdict: "sus", correction });
const Q = (id, difficulty, prompt, answers) => ({ id, difficulty, prompt, answers });

const banks = [
  {
    id: "javascript",
    name: "Javascript",
    reference: { title: "ECMAScript Language Specification", url: "https://tc39.es/ecma262/multipage/" },
    questions: [
      Q("javascript-typeof-null", "easy", "What does `typeof null` tell you in JavaScript?", [L("It returns `\"object\"` because of a historical compatibility quirk."), S("It returns `\"null\"` because null is its own primitive value.", "The operator returns `\"object\"`, even though null is a primitive value."), L("The result does not mean that null behaves like a normal object.")]),
      Q("javascript-const-object", "easy", "What does `const` prevent when it holds an object?", [L("It prevents assigning a different value to that variable."), S("It makes every property of the object immutable.", "Object properties can still change unless the object is frozen or otherwise protected."), L("The object can still be mutated through the const binding.")]),
      Q("javascript-default-sort", "easy", "How does `Array.prototype.sort()` compare values when no comparator is supplied?", [L("It converts elements to strings and compares their UTF-16 code unit sequences."), S("It always sorts numbers from smallest to largest.", "Numeric order requires a comparator such as `(a, b) => a - b`."), L("The default can place `10` before `2`.")]),
      Q("javascript-closure", "medium", "What does a JavaScript closure retain?", [L("It retains access to bindings from its surrounding lexical environment."), S("It copies the current values and can never observe later changes.", "Closures capture bindings, so they can observe later updates to those bindings."), L("A closure can outlive the function call that created its environment.")]),
      Q("javascript-microtasks", "medium", "When do resolved Promise callbacks normally run?", [L("They run as microtasks after the current call stack finishes."), S("They run synchronously inside the call to `then`.", "Promise reactions are queued rather than executed synchronously."), L("They normally run before the next timer task such as `setTimeout(..., 0)`.")]),
      Q("javascript-arrow-this", "medium", "How does `this` work inside an arrow function?", [L("An arrow function uses `this` from its surrounding lexical scope."), S("Calling it with `new` creates a fresh `this` value.", "Arrow functions are not constructors and cannot be called with `new`."), L("Methods that need a dynamic receiver often should not be arrow functions.")]),
      Q("javascript-promise-all", "medium", "What happens when one input to `Promise.all` rejects?", [L("The returned promise rejects with that rejection reason."), S("The other asynchronous operations are automatically cancelled.", "Promise.all does not cancel work that has already started."), L("Other inputs may continue running even though the aggregate has rejected.")]),
      Q("javascript-map-async", "medium", "What does `array.map(async item => ...)` return?", [L("It returns an array of promises."), S("It waits for every callback and returns resolved values.", "Use `await Promise.all(...)` when all mapped promises must resolve."), L("The `map` method itself remains synchronous.")]),
      Q("javascript-module-bindings", "medium", "Are imported ES module bindings live?", [L("An importer observes updates made to an exported binding by its module."), S("An importer receives an unrelated copy that never changes.", "ES module imports are live read-only views of exported bindings."), L("The importer cannot directly reassign the imported binding.")]),
      Q("javascript-weakmap", "hard", "Why can WeakMap keys help avoid retaining objects?", [L("WeakMap does not keep its object keys alive by itself."), S("WeakMap accepts strings as weakly held keys.", "WeakMap keys must be objects or non-registered symbols, not ordinary strings."), L("WeakMap keys cannot be enumerated because their lifetime is not observable that way.")]),
      Q("javascript-proxy-invariants", "hard", "Can every JavaScript Proxy trap return arbitrary results?", [S("Yes. Proxy traps completely replace the language's object rules.", "Proxy traps must respect invariants, including rules for non-configurable properties."), L("Violating a Proxy invariant can cause a TypeError."), L("A trap cannot report some impossible states for a non-extensible target.")]),
      Q("javascript-atomics", "hard", "When are JavaScript Atomics operations relevant?", [L("They coordinate access to shared integer memory backed by SharedArrayBuffer."), S("They make ordinary object property updates thread-safe.", "Atomics only operate on supported typed arrays over shared memory."), L("They can provide well-defined synchronization between agents such as workers.")])
    ]
  },
  {
    id: "python",
    name: "Python",
    reference: { title: "Python 3 Documentation", url: "https://docs.python.org/3/" },
    questions: [
      Q("python-is-vs-equals", "easy", "What is the difference between Python's `is` and `==`?", [L("`is` checks object identity."), L("`==` checks value equality as defined by the objects."), S("They are interchangeable for strings and numbers.", "Identity and equality are different even when interning sometimes makes examples look similar.")]),
      Q("python-list-alias", "easy", "What happens after `b = a` when `a` is a list?", [L("Both names refer to the same list object."), S("Python automatically copies the list.", "Assignment binds another name to the same object; copying must be requested."), L("A mutation through `b` is visible through `a`.")]),
      Q("python-range", "easy", "Does Python 3 `range(1_000_000)` create one million integer objects immediately?", [S("Yes, it stores every integer in a list.", "A range stores compact start, stop, and step information."), L("Range values are produced as needed during iteration."), L("A range supports indexing without materializing all its values.")]),
      Q("python-mutable-default", "medium", "Why can a mutable default argument surprise Python developers?", [L("The default object is created once when the function is defined."), S("Python creates a fresh default list for every call.", "Repeated calls can share the same mutable default object."), L("Using `None` and creating the list inside the function avoids shared state.")]),
      Q("python-gil", "medium", "In a GIL-enabled CPython build, what does the Global Interpreter Lock imply for threads?", [L("Only one thread normally executes Python bytecode in an interpreter at a time."), S("Threads can never improve an I/O-bound program.", "Other threads can run while one waits for I/O, and extensions may release the GIL."), L("Free-threaded CPython builds can run with the GIL disabled.")]),
      Q("python-generator", "medium", "How does a Python generator differ from a returned list?", [L("It produces values lazily as it is iterated."), S("It can always be restarted after exhaustion.", "A generator iterator is normally exhausted after one pass."), L("Its suspended frame preserves local state between yields.")]),
      Q("python-dict-order", "medium", "What ordering guarantee do modern Python dictionaries provide?", [L("They preserve insertion order."), S("They automatically sort keys.", "Insertion order is preserved, but keys are not automatically sorted."), L("Updating an existing key does not move it to the end.")]),
      Q("python-async-blocking", "medium", "What happens if blocking code runs directly inside an asyncio coroutine?", [L("It can block the event loop and delay other tasks."), S("The event loop automatically moves every blocking call to a thread.", "Blocking work must be explicitly offloaded or replaced with async I/O."), L("`await` only yields when the awaited operation cooperates with the event loop.")]),
      Q("python-context-manager", "medium", "What is a Python context manager responsible for?", [L("It defines setup and cleanup around a `with` block."), S("It only works with files.", "Locks, transactions, temporary resources, and custom objects can use the protocol."), L("Its exit method runs even when the block raises an exception.")]),
      Q("python-descriptor", "hard", "What can a Python descriptor customize?", [L("It can customize attribute access through methods such as `__get__` and `__set__`."), S("It only changes how dictionary keys are looked up.", "Descriptors participate in object attribute access, not normal mapping lookup."), L("Properties are implemented using the descriptor protocol.")]),
      Q("python-mro", "hard", "How is Python's method resolution order used with multiple inheritance?", [L("It gives a consistent linear order for attribute lookup."), S("Python searches base classes in a random order.", "Python computes a deterministic C3 linearization."), L("Zero-argument `super()` follows the MRO rather than naming one fixed parent.")]),
      Q("python-frozen-dataclass", "hard", "Does `@dataclass(frozen=True)` make an entire object graph immutable?", [S("Yes, every nested object becomes immutable.", "Frozen prevents normal field reassignment but does not freeze nested mutable objects."), L("A list stored in a frozen field can still be mutated."), L("Frozen dataclasses emulate shallow instance immutability.")])
    ]
  },
  {
    id: "dsa",
    name: "DSA",
    reference: { title: "NIST Dictionary of Algorithms and Data Structures", url: "https://xlinux.nist.gov/dads/" },
    questions: [
      Q("dsa-stack", "easy", "Which access order defines a stack?", [L("Last in, first out."), S("First in, first out.", "First in, first out describes a queue."), L("Push and pop normally operate at the same end.")]),
      Q("dsa-queue", "easy", "Which access order defines a basic queue?", [L("First in, first out."), S("The newest item always leaves first.", "A queue removes the oldest enqueued item first."), L("Enqueue and dequeue normally operate at opposite ends.")]),
      Q("dsa-binary-search", "easy", "What prerequisite does ordinary binary search need?", [L("The searchable keys must be ordered under the comparison being used."), S("The target must be present.", "Binary search also terminates correctly when the target is absent."), L("Efficient random access is important for the usual logarithmic array bound.")]),
      Q("dsa-hash-complexity", "medium", "Is hash-table lookup always O(1)?", [S("Yes, every lookup is constant time in the worst case.", "Collisions can degrade worst-case lookup, potentially to linear time."), L("Expected lookup can be O(1) with a suitable hash function and load factor."), L("Resizing strategy affects amortized insertion cost.")]),
      Q("dsa-bfs-shortest", "medium", "When does breadth-first search find shortest paths?", [L("It finds paths with the fewest edges in an unweighted graph."), S("It directly handles arbitrary negative edge weights.", "Weighted shortest paths require an algorithm suited to those weights."), L("It explores vertices in nondecreasing distance from the source.")]),
      Q("dsa-stable-sort", "medium", "What does stability mean for a sorting algorithm?", [L("Equal-key items keep their original relative order."), S("The algorithm never uses extra memory.", "Stability and memory usage are separate properties."), L("Stability matters when sorting by multiple keys in stages.")]),
      Q("dsa-binary-heap", "medium", "What does a binary min-heap guarantee?", [L("The minimum element is at the root."), S("Every level is globally sorted from left to right.", "A heap only guarantees the parent-child order property."), L("Insertion and root removal take O(log n) time.")]),
      Q("dsa-union-find", "medium", "What problem does a disjoint-set union structure solve?", [L("It tracks which elements belong to the same connected component."), S("It returns the shortest weighted path between two vertices.", "Union-find tracks connectivity, not path length."), L("Path compression and union by rank make operations nearly constant amortized time.")]),
      Q("dsa-dynamic-programming", "medium", "When is dynamic programming a useful approach?", [L("When overlapping subproblems and reusable optimal substructure are present."), S("Whenever recursion appears, regardless of repeated work.", "Recursion alone does not imply that dynamic programming is helpful."), L("Memoization is a top-down way to cache subproblem results.")]),
      Q("dsa-dijkstra-negative", "hard", "Can standard Dijkstra's algorithm handle negative edge weights?", [S("Yes, as long as there is no negative cycle.", "A negative edge can invalidate Dijkstra's greedy finalization step."), L("Bellman-Ford is a common alternative when negative weights are allowed."), L("Dijkstra is correct with nonnegative edge weights.")]),
      Q("dsa-topological-sort", "hard", "When does a topological ordering exist?", [L("For a directed acyclic graph."), S("For every directed graph.", "A directed cycle makes a topological ordering impossible."), L("A graph can have more than one valid topological ordering.")]),
      Q("dsa-red-black-tree", "hard", "What do red-black tree invariants provide?", [L("They keep tree height O(log n)."), S("They force the tree to be perfectly balanced.", "Red-black trees allow controlled imbalance."), L("Search, insertion, and deletion remain O(log n) in the worst case.")])
    ]
  },
  {
    id: "java",
    name: "Java",
    reference: { title: "Java Language Specification", url: "https://docs.oracle.com/javase/specs/" },
    questions: [
      Q("java-reference-equality", "easy", "What does `==` compare for Java object references?", [L("It tests whether the references point to the same object."), S("It always compares object contents.", "Content equality is normally expressed by `equals`."), L("Two distinct String objects can be equal by `equals` but not by `==`.")]),
      Q("java-string-immutable", "easy", "What does Java String immutability mean?", [L("A String object's character sequence cannot change after construction."), S("A String variable can never reference a different String.", "The variable can be reassigned unless the variable itself is final."), L("Operations such as `replace` return a new String when content changes.")]),
      Q("java-equals-hashcode", "easy", "What must be true when two Java objects are equal according to `equals`?", [L("They must return the same hash code."), S("Objects with the same hash code must be equal.", "Unequal objects may have hash collisions."), L("Breaking the contract can make hash-based collections behave incorrectly.")]),
      Q("java-checked-exception", "medium", "How are checked exceptions treated by the Java compiler?", [L("They must be caught or declared, subject to the language rules."), S("They are ignored at compile time.", "Checked exception handling is verified by the compiler."), L("RuntimeException subclasses are unchecked exceptions.")]),
      Q("java-type-erasure", "medium", "What is a consequence of Java generic type erasure?", [L("Most generic type arguments are not available as distinct runtime classes."), S("A `List<String>` is a subclass of `List<Object>`.", "Java generics are invariant; those two parameterizations are not in a subtype relationship."), L("You cannot directly create `new T()` without another construction mechanism.")]),
      Q("java-stream-lazy", "medium", "When does a Java Stream pipeline normally execute?", [L("A terminal operation triggers evaluation."), S("Every intermediate operation immediately traverses the source.", "Intermediate operations are generally lazy."), L("A stream cannot normally be reused after a terminal operation.")]),
      Q("java-volatile", "medium", "What does `volatile` provide for a Java field?", [L("Visibility and ordering guarantees for reads and writes of that field."), S("It makes a compound increment such as `count++` atomic.", "Read-modify-write operations still need atomic classes or synchronization."), L("A volatile write happens-before a subsequent volatile read of that field.")]),
      Q("java-synchronized", "medium", "What does entering a Java synchronized block require?", [L("The thread acquires the monitor associated with the chosen object."), S("It locks every object in the JVM.", "Synchronization is associated with a particular monitor."), L("Monitor release and later acquisition establish visibility guarantees.")]),
      Q("java-record", "medium", "Does a Java record guarantee deep immutability?", [S("Yes, every object referenced by a component becomes immutable.", "Record components are final references, but referenced objects may remain mutable."), L("A record provides final component fields and generated accessors."), L("Defensive copies may still be needed for mutable components.")]),
      Q("java-optional", "hard", "What is a good use of Java Optional?", [L("Representing an absent return value in an API where absence is expected."), S("Replacing every nullable field in entity classes.", "Optional is primarily designed as a return type and is not universally suitable for fields."), L("Calling `orElseGet` can avoid eagerly computing a fallback.")]),
      Q("java-gc-reachability", "hard", "When is a Java object generally eligible for garbage collection?", [L("When it is no longer reachable through a chain from GC roots."), S("Immediately when a local variable goes out of its source-code scope.", "Eligibility depends on runtime reachability, not only lexical scope."), L("Cycles can be collected when the cycle is unreachable from roots.")]),
      Q("java-concurrent-map", "hard", "Is `containsKey` followed by `put` an atomic compound action on ConcurrentHashMap?", [S("Yes, all sequences of thread-safe method calls are automatically atomic.", "Separate method calls can interleave; use an atomic method such as `putIfAbsent` or `compute`."), L("Individual ConcurrentHashMap operations provide thread-safety guarantees."), L("Atomic compound methods help avoid check-then-act races.")])
    ]
  },
  {
    id: "sql",
    name: "SQL",
    reference: { title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/current/" },
    questions: [
      Q("sql-left-join", "easy", "What happens to unmatched left-side rows in a LEFT JOIN?", [L("They remain in the result with nulls for missing right-side columns."), S("They are removed from the result.", "A LEFT JOIN preserves every row from its left input."), L("A later WHERE condition on a right-side column can still filter them out.")]),
      Q("sql-null-comparison", "easy", "How should SQL test whether a value is null?", [L("Use `IS NULL` or `IS NOT NULL`."), S("Use `= NULL`.", "Comparisons with null evaluate to unknown rather than true."), L("Null represents an unknown or missing value, not an ordinary comparable value.")]),
      Q("sql-count", "easy", "What is the difference between `COUNT(*)` and `COUNT(column)`?", [L("`COUNT(*)` counts rows."), L("`COUNT(column)` ignores rows where that expression is null."), S("They always return the same number.", "Nullable expressions can make `COUNT(column)` smaller than `COUNT(*)`.")]),
      Q("sql-group-by", "medium", "What does GROUP BY do before aggregate results are produced?", [L("It partitions input rows into groups with equal grouping expressions."), S("It guarantees the final output order.", "Only ORDER BY guarantees presentation order."), L("Each group produces one aggregate result row unless further grouping features are used.")]),
      Q("sql-index-write-cost", "medium", "Can adding an index make every workload faster?", [S("Yes, indexes have no write or storage cost.", "Indexes consume storage and must be maintained during writes."), L("An index can speed selected reads while slowing inserts and updates."), L("The optimizer may ignore an index when another plan is cheaper.")]),
      Q("sql-transaction-atomicity", "medium", "What does transaction atomicity promise?", [L("The transaction's changes commit as a unit or are rolled back as a unit."), S("Other transactions can never run concurrently.", "Concurrency is controlled by isolation, not atomicity alone."), L("A failed transaction should not leave only part of its intended changes committed.")]),
      Q("sql-isolation", "medium", "Do all SQL isolation levels prevent every read anomaly?", [S("Yes, every level behaves like serial execution.", "Lower isolation levels allow specific anomalies."), L("Serializable aims to produce outcomes consistent with some serial order."), L("The exact behavior can depend on the database implementation.")]),
      Q("sql-window-function", "medium", "How does a window function differ from GROUP BY aggregation?", [L("It can compute across related rows without collapsing them into one row per group."), S("It can only be used without an ORDER BY clause.", "Many window calculations use ordering inside the window specification."), L("A partition defines which rows participate in each window calculation.")]),
      Q("sql-foreign-key", "medium", "What does a foreign key enforce?", [L("Referenced values must satisfy the declared referential relationship."), S("It automatically creates every useful index on the referencing table.", "Index creation behavior varies and referencing columns may need an explicit index."), L("Configured actions can control updates or deletes of referenced rows.")]),
      Q("sql-mvcc", "hard", "Why do MVCC databases keep multiple row versions?", [L("Readers can observe a consistent snapshot while concurrent changes proceed."), S("Old versions are always retained forever.", "Obsolete versions are eventually reclaimed by database maintenance."), L("Visibility rules decide which version a transaction can see.")]),
      Q("sql-upsert-race", "hard", "Why is a database-native upsert safer than a separate SELECT followed by INSERT?", [L("It can resolve the conflict atomically under the database's concurrency rules."), S("A prior SELECT permanently locks the absence of a row.", "Another transaction can insert between a separate check and insert."), L("A unique constraint normally defines the conflict being handled.")]),
      Q("sql-recursive-cte", "hard", "What can a recursive common table expression express?", [L("Iterative traversal such as following a hierarchy."), S("Only calculations that finish in one non-recursive query step.", "A recursive term repeatedly consumes rows produced by earlier iterations."), L("A termination condition is essential to avoid unbounded recursion.")])
    ]
  },
  {
    id: "system-design",
    name: "System Design",
    reference: { title: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" },
    questions: [
      Q("system-design-load-balancer", "easy", "What is a common role of a load balancer?", [L("Distribute incoming requests across healthy service instances."), S("Permanently store the application's primary data.", "A load balancer routes traffic; it is not the primary database."), L("Health checks can prevent routing to unhealthy instances.")]),
      Q("system-design-cache", "easy", "Why is a cache placed in front of a slower data source?", [L("To serve repeated reads with lower latency and less backend load."), S("To guarantee that data can never become stale.", "Caches need an explicit freshness and invalidation strategy."), L("A cache miss still requires access to the underlying source.")]),
      Q("system-design-replication", "easy", "What does data replication provide?", [L("Additional copies that can improve availability or read capacity."), S("Automatic protection from every application bug.", "A bad write can be replicated to every copy."), L("Replication introduces consistency and failover decisions.")]),
      Q("system-design-sharding", "medium", "What does database sharding change?", [L("It partitions data across multiple database nodes."), S("It removes the need to choose a partition key.", "The partition key determines placement and strongly affects balance."), L("Cross-shard queries and transactions can become more complex.")]),
      Q("system-design-idempotency", "medium", "Why are idempotency keys useful for write APIs?", [L("They help repeated delivery avoid creating the same logical operation twice."), S("They make network retries unnecessary.", "Retries still occur; the key helps the server recognize duplicates."), L("The server must store or derive the result associated with a key.")]),
      Q("system-design-queue", "medium", "What does a durable message queue help decouple?", [L("Producers from consumers in rate and availability."), S("It guarantees each message is processed exactly once without application logic.", "Many queues use at-least-once delivery, so consumers should handle duplicates."), L("Backlogs can absorb temporary traffic spikes.")]),
      Q("system-design-circuit-breaker", "medium", "What is the purpose of a circuit breaker?", [L("Stop repeated calls to a failing dependency for a period."), S("Repair the dependency automatically.", "It limits cascading damage but does not fix the underlying service."), L("A half-open state can probe whether recovery has occurred.")]),
      Q("system-design-rate-limit", "medium", "What does rate limiting protect?", [L("Capacity and fairness by restricting request volume over time."), S("It guarantees low latency after every accepted request.", "Accepted work can still be slow for other reasons."), L("Distributed rate limits require a strategy for shared state or approximation.")]),
      Q("system-design-cdn", "medium", "Why serve static assets through a CDN?", [L("Edge locations can reduce latency and origin traffic."), S("A CDN makes cache invalidation unnecessary.", "Changed content still needs versioning, expiry, or invalidation."), L("Cache keys and headers influence which response is reused.")]),
      Q("system-design-cap", "hard", "What choice does the CAP theorem highlight during a network partition?", [L("A distributed system cannot guarantee both linearizable consistency and availability for every request while the partition persists."), S("A system must permanently choose only two of three properties even without failures.", "The tradeoff concerns behavior while a partition prevents communication."), L("Different operations can make different tradeoffs.")]),
      Q("system-design-backpressure", "hard", "What is backpressure in a data-processing system?", [L("A way for slower consumers to limit or signal upstream production."), S("A requirement to buffer unlimited work in memory.", "Unlimited buffering delays failure and can exhaust resources."), L("Dropping, batching, blocking, or shedding work are possible policies.")]),
      Q("system-design-saga", "hard", "What does a saga coordinate?", [L("A sequence of local transactions with compensating actions for failures."), S("A single ACID transaction that locks every service database.", "Sagas avoid one global database transaction across services."), L("Compensation may not perfectly erase every real-world side effect.")])
    ]
  },
  {
    id: "aws",
    name: "AWS",
    reference: { title: "AWS Documentation", url: "https://docs.aws.amazon.com/" },
    questions: [
      Q("aws-region-az", "easy", "How do AWS Regions and Availability Zones relate?", [L("A Region contains multiple isolated Availability Zones."), S("An Availability Zone contains several Regions.", "Regions are the larger geographic units."), L("Deploying across zones can reduce some single-location failure risks.")]),
      Q("aws-iam-least-privilege", "easy", "What does least privilege mean in AWS IAM?", [L("Grant only the permissions needed for the intended task."), S("Give every application administrator access and rely on logs.", "Broad permissions increase the impact of mistakes and compromise."), L("Permissions should be reviewed as requirements change.")]),
      Q("aws-s3", "easy", "What kind of service is Amazon S3?", [L("An object storage service."), S("A block device mounted directly by every EC2 instance.", "S3 exposes object APIs rather than acting as a normal block device."), L("Objects are addressed within buckets by keys.")]),
      Q("aws-security-group", "medium", "How do EC2 security groups treat response traffic?", [L("They are stateful, so allowed inbound traffic permits its response."), S("They require a separate outbound rule for each response packet.", "Stateful connection tracking permits return traffic."), L("Rules allow traffic; security groups do not contain explicit deny rules.")]),
      Q("aws-nacl", "medium", "How do network ACLs differ from security groups?", [L("Network ACLs are stateless subnet-level controls."), S("Network ACLs are attached only to individual IAM users.", "They filter traffic at subnet boundaries."), L("They can contain both allow and deny rules.")]),
      Q("aws-lambda", "medium", "Does AWS Lambda remove every operational concern?", [S("Yes, serverless means there are no limits or failures to design for.", "Functions still have quotas, timeouts, dependencies, and failure modes."), L("Cold starts can affect latency for some workloads."), L("The platform manages servers while the customer manages function code and configuration.")]),
      Q("aws-rds-multi-az", "medium", "What is the main purpose of a traditional RDS Multi-AZ DB instance deployment?", [L("Improve availability through a standby and managed failover."), S("Automatically scale read traffic across the standby.", "A Multi-AZ DB instance standby is for availability and does not serve read traffic."), L("Applications still need retry and recovery behavior during failover.")]),
      Q("aws-dynamodb-key", "medium", "Why does DynamoDB partition-key design matter?", [L("It influences how data and traffic are distributed across partitions."), S("A constant partition key maximizes horizontal scaling.", "Concentrating traffic on one key can create a hot partition."), L("Access patterns should guide primary-key and index design.")]),
      Q("aws-cloudfront", "medium", "What does Amazon CloudFront provide?", [L("A content delivery network with edge caching."), S("A replacement for IAM authorization in every application.", "CloudFront distributes content; application authorization remains a separate concern."), L("Origins can include S3, load balancers, and custom servers.")]),
      Q("aws-sqs-delivery", "hard", "Should an Amazon SQS Standard queue consumer handle duplicate messages?", [L("Yes, consumers should be idempotent because messages can be delivered more than once."), S("No, Standard queues guarantee exactly-once processing.", "Standard queues use at-least-once delivery, so duplicate delivery is possible."), L("A visibility timeout is not the same as deleting a successfully processed message.")]),
      Q("aws-shared-responsibility", "hard", "What does the AWS shared responsibility model divide?", [L("AWS secures the cloud infrastructure while customers secure their workloads and configurations."), S("AWS is responsible for all customer data classification and IAM policy choices.", "Customers retain responsibility for their data and access configuration."), L("The exact division changes with the type of managed service.")]),
      Q("aws-auto-scaling", "hard", "Can automatic scaling alone guarantee application availability?", [S("Yes, adding instances fixes every failure mode.", "Scaling does not repair bad dependencies, unhealthy code, or flawed routing."), L("Scaling policies need useful metrics, limits, and cooldown behavior."), L("New capacity must become healthy quickly enough to absorb demand.")])
    ]
  },
  {
    id: "spring-boot",
    name: "Spring Boot",
    reference: { title: "Spring Boot Reference Documentation", url: "https://docs.spring.io/spring-boot/reference/" },
    questions: [
      Q("spring-boot-autoconfiguration", "easy", "What is Spring Boot auto-configuration trying to do?", [L("Configure common beans based on the classpath, properties, and existing beans."), S("Ignore application dependencies and always create the same beans.", "Auto-configuration is conditional on the application environment."), L("User-defined beans can cause many defaults to back off.")]),
      Q("spring-boot-starter", "easy", "What is a Spring Boot starter?", [L("A curated dependency descriptor for a common capability."), S("A running application server managed outside the project.", "A starter is a dependency bundle, not a separate server process."), L("Starters reduce the need to select every transitive library manually.")]),
      Q("spring-boot-embedded-server", "easy", "Can a Spring Boot web application run with an embedded server?", [L("Yes, it can package and launch a server with the application."), S("No, every deployment requires a separately installed application server.", "Executable Spring Boot applications commonly use an embedded server."), L("The server implementation can be changed through dependencies and configuration.")]),
      Q("spring-boot-constructor-injection", "medium", "Why is constructor injection often preferred?", [L("Required dependencies are explicit and can be final."), S("It hides dependencies from tests.", "Constructor parameters make dependencies straightforward to supply in tests."), L("A single constructor can be used without an explicit Autowired annotation.")]),
      Q("spring-boot-profile", "medium", "What do Spring profiles control?", [L("Conditional activation of beans and configuration for named environments."), S("Compile-time Java language features.", "Profiles are runtime configuration and bean-selection features."), L("Active profiles can be selected through external configuration.")]),
      Q("spring-boot-actuator", "medium", "What does Spring Boot Actuator add?", [L("Operational endpoints and production-oriented application information."), S("Automatic public exposure of every endpoint is always safe.", "Endpoint exposure and security must be configured deliberately."), L("Health and metrics integrations can support monitoring.")]),
      Q("spring-transaction-proxy", "medium", "Why can self-invocation bypass `@Transactional` in Spring's default proxy mode?", [L("A call through `this` does not pass through the Spring proxy."), S("Transactions only work on static methods.", "Proxy interception, not static dispatch, is the key issue."), L("Moving the call across beans or using another transaction mechanism can restore interception.")]),
      Q("spring-bean-scope", "medium", "What is the default scope of a Spring bean?", [L("Singleton within the application context."), S("A new instance for every method call.", "Prototype creates new instances on lookup; singleton is the default."), L("Web-aware contexts also provide request and session scopes.")]),
      Q("spring-config-precedence", "medium", "Can the same Spring Boot property come from multiple sources?", [L("Yes, defined precedence rules decide which value wins."), S("Only `application.properties` can supply configuration.", "Environment variables, command-line arguments, and other sources are supported."), L("External configuration can override packaged defaults.")]),
      Q("spring-validation", "hard", "What is needed for Bean Validation annotations to reject invalid request data?", [L("Validation must be triggered, commonly with `@Valid` or `@Validated`."), S("Annotations validate every object automatically when it is constructed.", "Constraints are checked when a validator is invoked through the relevant integration."), L("Binding errors should be translated into a clear client response.")]),
      Q("spring-test-slice", "hard", "What is the purpose of a Spring Boot test slice?", [L("Load a focused subset of application configuration for one layer."), S("Start every external production dependency.", "Slices intentionally narrow the context and often use test replacements."), L("`@WebMvcTest` focuses on MVC components rather than the full application.")]),
      Q("spring-graceful-shutdown", "hard", "What does graceful shutdown aim to do?", [L("Stop accepting new work while allowing in-flight requests time to finish."), S("Terminate the process immediately without notifying the server.", "Immediate termination can drop active work."), L("Infrastructure termination grace periods must be long enough for the application policy.")])
    ]
  },
  {
    id: "docker",
    name: "Docker",
    reference: { title: "Docker Documentation", url: "https://docs.docker.com/" },
    questions: [
      Q("docker-image-container", "easy", "How does a Docker image differ from a container?", [L("An image is an immutable template used to create containers."), S("An image is the running process itself.", "A container is a runtime instance created from an image."), L("Multiple containers can be created from one image.")]),
      Q("docker-volume", "easy", "Why use a Docker volume?", [L("To persist data outside a container's writable layer."), S("To bake source code permanently into an image.", "Image build instructions add files to images; volumes hold runtime data."), L("A volume can survive deletion of the container that used it.")]),
      Q("docker-port", "easy", "Does exposing a port in a Dockerfile publish it to the host?", [S("Yes, EXPOSE automatically creates a host mapping.", "Publishing requires a runtime port mapping; EXPOSE is metadata/documentation."), L("`docker run -p` can map a host port to a container port."), L("Containers on the same network can communicate without publishing every port to the host.")]),
      Q("docker-layer-cache", "medium", "Why copy dependency manifests before application source in many Dockerfiles?", [L("The dependency-install layer can remain cached when only source files change."), S("Docker cannot access the network after source code is copied.", "The ordering is a cache optimization, not a network rule."), L("A change to an earlier layer invalidates reuse of later layers.")]),
      Q("docker-bind-mount", "medium", "How does a bind mount differ from a named volume?", [L("A bind mount maps a specific host path into the container."), S("A bind mount is stored only inside the image.", "Bind mounts reference host filesystem paths at runtime."), L("Named volumes are managed through Docker's volume storage.")]),
      Q("docker-multistage", "medium", "Why use a multi-stage Docker build?", [L("Build tools can stay in an earlier stage while only runtime artifacts enter the final image."), S("Every stage runs as a separate production container.", "Stages are build phases; only selected outputs need to reach the final image."), L("Smaller final images can reduce transfer size and attack surface.")]),
      Q("docker-pid1", "medium", "Why does PID 1 behavior matter inside a container?", [L("The main process needs correct signal handling and must reap child processes when it creates them."), S("PID 1 cannot receive termination signals.", "PID 1 can receive signals, but the process and entrypoint must forward or handle them correctly."), L("An init process can help with signal forwarding and zombie reaping.")]),
      Q("docker-secrets", "medium", "Is an image environment variable a safe place for a permanent secret?", [S("Yes, image configuration is invisible to anyone who pulls it.", "Image metadata and layers can expose embedded values."), L("Secrets should be injected through an appropriate runtime secret mechanism."), L("Removing a secret in a later layer may not remove it from earlier image history.")]),
      Q("docker-healthcheck", "medium", "What does a Docker health check indicate?", [L("Whether a configured command considers the container healthy."), S("That every downstream dependency is permanently available.", "A health command only tests what it was designed to observe."), L("A running process can still be marked unhealthy.")]),
      Q("docker-compose-depends", "hard", "Does basic Compose `depends_on` prove a dependency is ready to serve requests?", [S("Yes, process start order guarantees application readiness.", "A started container may still be initializing; readiness needs a health condition or retry logic."), L("Applications should tolerate dependency startup delays."), L("Health-based conditions can improve orchestration when supported and configured.")]),
      Q("docker-network", "hard", "How do containers discover each other on a user-defined Docker network?", [L("They can use Docker-provided name resolution for container or service names."), S("They must all publish ports to the public host interface.", "Publishing is unnecessary for container-to-container traffic on the shared network."), L("Network isolation controls which containers can communicate directly.")]),
      Q("docker-non-root", "hard", "Why run a container process as a non-root user?", [L("It reduces the privileges available after an application compromise."), S("It makes host kernel vulnerabilities impossible.", "Least privilege reduces impact but does not eliminate container escape risks."), L("File ownership and low-port requirements must be designed for the chosen user.")])
    ]
  },
  {
    id: "networking",
    name: "Networking",
    reference: { title: "RFC Editor", url: "https://www.rfc-editor.org/" },
    questions: [
      Q("networking-tcp-udp", "easy", "How does TCP differ from UDP?", [L("TCP provides an ordered reliable byte stream."), S("UDP guarantees delivery and ordering.", "UDP datagrams can be lost, duplicated, or reordered."), L("UDP avoids connection setup and lets applications choose their own reliability strategy.")]),
      Q("networking-dns", "easy", "What does DNS normally resolve?", [L("Names such as hostnames into records including IP addresses."), S("It encrypts every application connection automatically.", "DNS resolution and transport encryption are separate mechanisms."), L("Resolvers may cache answers until their time-to-live expires.")]),
      Q("networking-http-idempotent", "easy", "What does idempotent mean for an HTTP method?", [L("Repeating the same request has the same intended effect as sending it once."), S("The request has no side effects.", "An idempotent request can change state; repetition should not add further intended change."), L("Idempotency can make some retries safer after connection failures.")]),
      Q("networking-tls-certificate", "medium", "What does a TLS server certificate help a client verify?", [L("That a trusted issuer bound a public key to the requested identity."), S("That the server application contains no vulnerabilities.", "Certificates authenticate identity and keys, not application correctness."), L("The hostname and validity period are part of normal verification.")]),
      Q("networking-nat", "medium", "What does network address translation commonly do?", [L("Rewrite address and often port information between network realms."), S("Provide end-to-end encryption by itself.", "NAT changes addressing; encryption requires a protocol such as TLS or IPsec."), L("Many private hosts can share one public IPv4 address through port translation.")]),
      Q("networking-subnet", "medium", "What does an IP subnet prefix length describe?", [L("Which leading address bits identify the network prefix."), S("The maximum TCP port number.", "Ports belong to the transport layer and are unrelated to the subnet prefix."), L("A host can compare the destination with its on-link prefixes when making a routing decision.")]),
      Q("networking-arp", "medium", "What does ARP do on an IPv4 local network?", [L("Map an IPv4 address to a link-layer address."), S("Resolve public domain names globally.", "DNS resolves names; ARP operates on a local link."), L("ARP requests are normally broadcast on the local network segment.")]),
      Q("networking-flow-congestion", "medium", "How do flow control and congestion control differ?", [L("Flow control protects the receiver from being overwhelmed."), L("Congestion control reacts to capacity and contention in the network."), S("They are two names for the same receiver buffer setting.", "They address different bottlenecks even though both can limit sending rate.")]),
      Q("networking-cors", "medium", "What does browser CORS enforcement control?", [L("Whether frontend code may read certain cross-origin responses."), S("Whether a non-browser client can send packets to the server.", "CORS is a browser security policy, not a network firewall."), L("The server opts into allowed origins through response headers.")]),
      Q("networking-quic", "hard", "Why does QUIC run over UDP?", [L("It can implement transport features in user space while using UDP datagrams for network traversal."), S("It gives up reliable ordered streams entirely.", "QUIC implements reliability and multiple streams above UDP."), L("Independent streams reduce transport-level head-of-line blocking between streams.")]),
      Q("networking-websocket", "hard", "What changes after an HTTP connection is upgraded to WebSocket?", [L("Client and server can exchange framed messages in both directions."), S("Every message becomes an independent HTTP request.", "WebSocket uses its own framing after the handshake."), L("The long-lived connection still needs failure detection and reconnection logic.")]),
      Q("networking-pmtud", "hard", "What problem does path MTU discovery address?", [L("Finding a packet size that can travel along the path without fragmentation."), S("Choosing the fastest DNS resolver.", "Path MTU concerns packet size, not name resolution."), L("Blocking required control messages can cause black-hole connectivity problems.")])
    ]
  },
  {
    id: "linux",
    name: "Linux",
    reference: { title: "Linux man-pages project", url: "https://man7.org/linux/man-pages/" },
    questions: [
      Q("linux-permissions", "easy", "How are traditional Linux read, write, and execute mode bits grouped?", [L("They are grouped for the owning user, owning group, and others."), S("They only apply to files downloaded from the internet.", "Mode bits apply broadly to filesystem objects."), L("Execute permission on a directory controls traversal rather than running the directory.")]),
      Q("linux-process", "easy", "What is a Linux process?", [L("A running program instance with execution state and resources."), S("A file that can never have more than one running instance.", "The same executable can be used by many processes."), L("Each process has an identifier and a virtual address space.")]),
      Q("linux-pipe", "easy", "What does a shell pipeline such as `a | b` connect?", [L("The standard output of `a` to the standard input of `b`."), S("The filesystems of two machines automatically.", "A shell pipe carries a byte stream between local processes unless other tools add networking."), L("The commands can run concurrently while data flows through the pipe.")]),
      Q("linux-fork", "medium", "What does `fork()` create?", [L("A child process initially based on the calling process."), S("A new thread sharing the exact same process ID.", "The child is a separate process with its own PID."), L("Copy-on-write commonly delays copying memory pages until one process writes.")]),
      Q("linux-signal", "medium", "What is a Unix signal?", [L("An asynchronous notification delivered to a process or thread."), S("A guaranteed queue that preserves unlimited repeated notifications.", "Standard signals can coalesce and are not an unlimited message queue."), L("Some signals can be handled or blocked, while SIGKILL cannot be caught.")]),
      Q("linux-symlink", "medium", "How does a symbolic link differ from a hard link?", [L("A symbolic link stores a path to another filesystem object."), S("A symbolic link must stay on the same filesystem as its target.", "Symbolic links can point across filesystem boundaries."), L("A symbolic link can become dangling when its target path disappears.")]),
      Q("linux-hard-link", "medium", "What does a hard link reference?", [L("The same inode and underlying file data as another directory entry."), S("A pathname that is followed dynamically each time.", "That describes a symbolic link; a hard link is another name for the inode."), L("Removing one hard link does not remove the data while another link remains.")]),
      Q("linux-load-average", "medium", "Does Linux load average equal CPU utilization percentage?", [S("Yes, a load of 1.0 always means 100 percent CPU use on every machine.", "Load average counts runnable and certain uninterruptible tasks and must be interpreted with CPU count."), L("I/O-waiting tasks can contribute to load average."), L("The three values summarize different time windows.")]),
      Q("linux-cgroup", "medium", "What do Linux control groups provide?", [L("Resource accounting and limits for groups of processes."), S("A replacement for all filesystem permissions.", "Cgroups manage resources, while permissions remain a separate security control."), L("Containers commonly use cgroups for CPU and memory controls.")]),
      Q("linux-namespace", "hard", "What do Linux namespaces isolate?", [L("Selected views of system resources such as process IDs, mounts, or networks."), S("They automatically encrypt all data between processes.", "Namespaces isolate views; encryption is a separate feature."), L("Containers combine multiple namespace types with other controls.")]),
      Q("linux-epoll", "hard", "Why use epoll for many file descriptors?", [L("It can report readiness changes without scanning every descriptor on each wait."), S("It turns blocking file operations into CPU-parallel work automatically.", "Epoll reports readiness; the application still performs the I/O."), L("Edge-triggered use requires draining readiness carefully to avoid missed progress.")]),
      Q("linux-oom", "hard", "What can happen when Linux cannot satisfy memory demand?", [L("The out-of-memory killer may select a process to terminate."), S("The kernel always adds physical RAM automatically.", "Memory is finite; reclaim, swap, and termination are possible responses."), L("Cgroup memory limits can trigger an OOM event within that group.")])
    ]
  },
  {
    id: "calculus",
    name: "Calculus",
    reference: { title: "OpenStax Calculus Volume 1", url: "https://openstax.org/details/books/calculus-volume-1" },
    questions: [
      Q("calculus-derivative", "easy", "For a real-valued function of one real variable, what does its derivative represent at a point?", [L("The instantaneous rate of change when the derivative exists."), S("The total area under the function from zero.", "Definite integration, not differentiation, describes accumulated signed area."), L("Geometrically it is the slope of the tangent line.")]),
      Q("calculus-power-rule", "easy", "For a positive integer n, what is the derivative of `x^n`?", [L("`n x^(n-1)`."), S("`x^(n+1)/(n+1)`.", "That expression is an antiderivative, not the derivative."), L("The exponent decreases by one and multiplies the result.")]),
      Q("calculus-integral-area", "easy", "Does a definite integral always equal ordinary geometric area?", [S("Yes, it is always nonnegative.", "A definite integral is signed; regions below the axis contribute negatively."), L("It represents accumulated signed change."), L("Geometric area may require integrating the absolute value or splitting intervals.")]),
      Q("calculus-chain-rule", "medium", "When is the chain rule used?", [L("When differentiating a composition of functions."), S("Only when multiplying two unrelated functions.", "Products use the product rule; compositions use the chain rule."), L("The outer derivative is multiplied by the derivative of the inner function.")]),
      Q("calculus-product-rule", "medium", "What is the derivative of a product `f(x)g(x)`?", [L("`f'(x)g(x) + f(x)g'(x)`."), S("`f'(x)g'(x)`.", "Differentiating each factor and multiplying omits two required terms."), L("Both factors contribute while the other is held in its original form.")]),
      Q("calculus-ftc", "medium", "What connection does the Fundamental Theorem of Calculus make?", [L("It connects accumulation by integration with antiderivatives."), S("It says every discontinuous function has an elementary antiderivative.", "The theorem has hypotheses and does not guarantee elementary formulas."), L("Under suitable conditions, differentiating an integral with a variable upper limit recovers the integrand.")]),
      Q("calculus-continuity", "medium", "Does continuity at a point guarantee differentiability there?", [S("Yes, every continuous graph has a tangent slope.", "A continuous function can have a corner or cusp and fail to be differentiable."), L("Differentiability implies continuity at that point."), L("The absolute-value function is continuous but not differentiable at zero.")]),
      Q("calculus-critical-point", "medium", "Does `f'(c) = 0` guarantee a local maximum or minimum?", [S("Yes, every stationary point is an extremum.", "A stationary point can be neither, as with `x^3` at zero."), L("It identifies a critical point that needs further analysis."), L("Sign changes or higher-derivative information can help classify the point.")]),
      Q("calculus-substitution", "medium", "What is substitution in integration designed to reverse?", [L("The chain rule."), S("The quotient rule only.", "Substitution broadly handles compositions paired with an inner derivative."), L("A successful substitution rewrites the integral in one new variable.")]),
      Q("calculus-partial", "hard", "What does a partial derivative hold fixed?", [L("The other independent variables while one variable changes."), S("The function value itself.", "The function value generally changes as the selected variable changes."), L("Partial derivatives describe coordinate-direction rates of change.")]),
      Q("calculus-gradient", "hard", "In Euclidean space, what does the gradient of a differentiable scalar field indicate?", [L("The direction of steepest local increase when the gradient is nonzero."), S("A direction tangent to every regular level surface.", "The gradient is normal to a regular level surface."), L("Its magnitude is the maximum directional derivative over unit directions at that point.")]),
      Q("calculus-taylor", "hard", "Does a function always equal its Taylor series wherever all derivatives exist?", [S("Yes, infinite differentiability guarantees equality.", "Some smooth functions have Taylor series that do not equal the function away from the expansion point."), L("Analyticity is stronger than infinite differentiability."), L("A remainder estimate is needed to justify approximation accuracy.")])
    ]
  },
  {
    id: "operating-systems",
    name: "Operating Systems",
    reference: { title: "Operating Systems: Three Easy Pieces", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/" },
    questions: [
      Q("os-kernel", "easy", "What is a primary role of an operating-system kernel?", [L("Manage hardware resources and provide protected services to programs."), S("Compile every application from source at startup.", "Compilation is performed by development tools, not the kernel's core runtime role."), L("System calls provide controlled entry to kernel services.")]),
      Q("os-virtual-memory", "easy", "What does virtual memory give a process?", [L("Its own virtual address space mapped to physical memory and other backing."), S("Direct unrestricted access to all physical memory.", "Address translation and protection isolate process memory."), L("Different processes can use the same virtual address for different physical storage.")]),
      Q("os-context-switch", "easy", "What happens in a context switch?", [L("The system saves one execution context and restores another."), S("The CPU permanently erases the previous process.", "The previous task can resume from its saved state."), L("Context switches add overhead because useful application work pauses.")]),
      Q("os-page-fault", "medium", "Does every page fault indicate a program bug?", [S("Yes, a page fault always crashes the process.", "Many page faults are handled normally by loading or mapping a page."), L("An invalid access can produce a fault the OS cannot resolve for the process."), L("Demand paging relies on recoverable page faults.")]),
      Q("os-thread-process", "medium", "How do threads within one process normally relate?", [L("They share the process address space and resources."), S("Each thread has a completely separate copy of all process memory.", "Threads share memory but have separate stacks and execution state."), L("Shared memory makes communication cheap but introduces synchronization risks.")]),
      Q("os-mutex-semaphore", "medium", "How does a counting semaphore differ from a mutex?", [L("A semaphore can represent multiple available permits."), S("A semaphore always has one owner that must release it.", "Ownership is a mutex concept; semaphore use need not enforce the same owner."), L("A mutex is designed for mutual exclusion around a critical section.")]),
      Q("os-race-condition", "medium", "What makes a race condition possible?", [L("The result depends on uncontrolled timing of concurrent accesses."), S("Merely having two functions in the same source file.", "Concurrency and shared or interacting state are required for a timing race."), L("Synchronization can establish a defined order or atomic access.")]),
      Q("os-deadlock", "medium", "Which conditions are associated with classic resource deadlock?", [L("Mutual exclusion, hold-and-wait, no preemption, and circular wait."), S("High CPU utilization alone.", "Load can be high without any circular resource dependency."), L("Breaking one necessary condition can prevent this form of deadlock.")]),
      Q("os-scheduler", "medium", "What tradeoff does a CPU scheduler manage?", [L("Responsiveness, throughput, fairness, and overhead."), S("It can maximize every metric simultaneously for every workload.", "Scheduling goals conflict and depend on workload."), L("Preemption lets the system interrupt a running task to schedule another.")]),
      Q("os-copy-on-write", "hard", "What is copy-on-write after process creation?", [L("Processes initially share pages until one attempts to modify a shared page."), S("Every page is copied before the child can run.", "Copy-on-write postpones copies and avoids copying untouched pages."), L("A write fault can trigger creation of a private copy.")]),
      Q("os-thrashing", "hard", "What is virtual-memory thrashing?", [L("The system spends excessive time moving pages instead of doing useful work."), S("A CPU executes instructions too quickly for memory.", "Thrashing comes from an insufficient working set and heavy paging."), L("Reducing active working sets or adding memory can help.")]),
      Q("os-page-cache", "hard", "Why does an operating system cache file data in memory?", [L("Repeated reads can avoid slower storage access."), S("Cached writes are guaranteed durable immediately.", "Durability requires the data to reach the required stable storage boundary."), L("The kernel can reclaim clean cache pages when memory is needed.")])
    ]
  },
  {
    id: "discrete-maths",
    name: "Discrete Maths",
    reference: { title: "OpenStax Contemporary Mathematics", url: "https://openstax.org/details/books/contemporary-mathematics" },
    questions: [
      Q("discrete-implication", "easy", "When is the implication `P implies Q` false?", [L("When P is true and Q is false."), S("Whenever P is false.", "In classical logic an implication with a false premise is true."), L("It is equivalent to `not P or Q`.")]),
      Q("discrete-set-union", "easy", "What does the union of two sets contain?", [L("Every element that is in either set or both."), S("Only elements common to both sets.", "Common elements form the intersection."), L("Duplicate membership does not create duplicate set elements.")]),
      Q("discrete-tree", "easy", "What is true of a finite undirected tree with n greater than or equal to 1 vertices?", [L("It has n minus 1 edges."), S("It contains at least one cycle.", "A tree is connected and acyclic."), L("There is exactly one simple path between any two vertices.")]),
      Q("discrete-de-morgan", "medium", "What is the negation of `P and Q`?", [L("`not P or not Q`."), S("`not P and not Q`.", "De Morgan's law changes AND to OR when negating the expression."), L("The law has an analogous set-complement form.")]),
      Q("discrete-injective", "medium", "What makes a function injective?", [L("Different inputs never map to the same output."), S("Every element of the codomain must be reached.", "Reaching the whole codomain defines surjectivity."), L("Each output has at most one preimage.")]),
      Q("discrete-surjective", "medium", "What makes a function surjective?", [L("Every element of the codomain has at least one preimage."), S("Every input maps to a different output.", "That condition describes injectivity."), L("A function can be both injective and surjective.")]),
      Q("discrete-permutation", "medium", "When does order matter: permutations or combinations?", [L("Order matters for permutations."), S("Order matters only for combinations.", "Combinations select groups without order."), L("Choosing a president and vice president is a permutation-style assignment.")]),
      Q("discrete-induction", "medium", "What are the core steps for proving a statement over consecutive integers by induction?", [L("Prove a base case and prove that one case implies the next."), S("Verify a large sample and assume the rest.", "Induction is a proof for all cases in the domain, not sampling."), L("Strong induction may assume all earlier cases in the inductive step.")]),
      Q("discrete-pigeonhole", "medium", "What does the pigeonhole principle guarantee?", [L("If more objects than boxes are assigned, some box receives at least two objects."), S("Every box receives exactly the same number of objects.", "The principle guarantees a collision, not equal distribution."), L("Its generalized form gives a lower bound using a ceiling.")]),
      Q("discrete-equivalence", "hard", "What properties define an equivalence relation?", [L("Reflexivity, symmetry, and transitivity."), S("Antisymmetry and total comparability.", "Those properties belong to order relations, not equivalence relations."), L("Equivalence classes partition the underlying set.")]),
      Q("discrete-modular", "hard", "For a positive integer n, what does `a` congruent to `b` modulo `n` mean?", [L("`n` divides `a - b`."), S("`a` and `b` must be equal as integers.", "Different integers can have the same remainder modulo n."), L("Congruence is preserved by addition and multiplication.")]),
      Q("discrete-bayes", "hard", "What does Bayes' theorem relate?", [L("A conditional probability to the reverse conditional probability and base rates."), S("It allows base rates to be ignored.", "The prior probabilities are essential terms in Bayes' theorem."), L("A highly accurate test can still have a modest positive predictive value when prevalence is very low.")])
    ]
  }
];

// These alternatives prevent a predictable "exactly one Sus" pattern. Each
// replaces one legitimate option in the named question before answer rotation.
const secondSusByQuestion = new Map([
  ["javascript-default-sort", S("It returns a new sorted array and leaves the original unchanged.", "The sort method rearranges the original array in place and returns that same array reference.")],
  ["javascript-arrow-this", S("Calling an arrow function with `call` or `apply` changes its `this` value.", "Arrow functions use lexical `this`; `call`, `apply`, and `bind` cannot replace it.")],
  ["javascript-module-bindings", S("The importing module may assign a new value directly to an imported binding.", "Imported bindings are live but read-only from the importing module.")],
  ["javascript-atomics", S("Atomics operations work on any ordinary JavaScript array.", "Atomics require a supported integer typed array backed by SharedArrayBuffer.")],

  ["python-range", S("A range accepts floating-point start, stop, and step arguments.", "The built-in range requires integer arguments or objects with an integer index interpretation.")],
  ["python-generator", S("A generator supports `len()` because it knows all future values.", "A generator produces values lazily and does not generally provide a length.")],
  ["python-context-manager", S("A context manager automatically suppresses every exception raised inside the block.", "An exception is suppressed only when the exit method explicitly returns a true value.")],
  ["python-frozen-dataclass", S("Every frozen dataclass instance is safely hashable regardless of its fields.", "Generated hashing still depends on the dataclass options and on whether component values are hashable.")],

  ["dsa-binary-search", S("Binary search always runs in O(log n) time on a linked list.", "Finding the middle of a basic linked list is not constant time, so the usual array bound does not apply.")],
  ["dsa-stable-sort", S("Every implementation of quicksort is stable.", "Quicksort is not inherently stable; stability depends on the algorithm and implementation.")],
  ["dsa-dynamic-programming", S("Dynamic programming always chooses the locally best option at each step.", "Choosing a locally best option describes a greedy strategy, not dynamic programming in general.")],
  ["dsa-red-black-tree", S("Every root-to-leaf path has exactly the same total number of nodes.", "Red-black invariants equalize black height, not the total node count of every path.")],

  ["java-equals-hashcode", S("Equal objects may return different hash codes as long as collisions are rare.", "The equals and hashCode contract requires equal objects to return the same hash code.")],
  ["java-stream-lazy", S("Changing a stream to parallel always makes the pipeline faster.", "Parallel execution has overhead and can be slower or unsuitable depending on the work and source.")],
  ["java-record", S("A record automatically generates mutating setter methods for its components.", "Record components are final, and records generate accessors rather than mutating setters.")],
  ["java-concurrent-map", S("ConcurrentHashMap accepts null keys and null values.", "ConcurrentHashMap does not permit null keys or null values.")],

  ["sql-count", S("`COUNT(column)` treats each null as a zero and counts it.", "COUNT(column) excludes rows where the counted expression is null.")],
  ["sql-transaction-atomicity", S("Atomicity alone guarantees that committed data survives a system crash.", "Survival of committed data is the durability property, not atomicity by itself.")],
  ["sql-foreign-key", S("A foreign key proves that every referenced row is valid under all business rules.", "A foreign key enforces the declared relationship only; other business rules need separate constraints or logic.")],
  ["sql-recursive-cte", S("A recursive CTE always detects and stops cycles automatically.", "Cycle handling depends on the query and database features; recursion needs an explicit safe stopping strategy.")],

  ["system-design-replication", S("A live replica is a complete substitute for an independent backup.", "Replication can copy deletion or corruption, so recovery still needs an appropriate backup strategy.")],
  ["system-design-queue", S("A queue always preserves one global message order across all consumers.", "Ordering guarantees depend on the queue type, partitioning, and consumer design.")],
  ["system-design-cdn", S("A CDN safely caches every origin response by default.", "Cacheability depends on method, headers, status, and CDN configuration; private responses need particular care.")],
  ["system-design-saga", S("A compensating action automatically rewinds database history as if the earlier step never happened.", "Compensation is new business logic and may not perfectly reverse every prior effect.")],

  ["aws-s3", S("S3 folders are real filesystem directories that contain objects.", "S3 is a flat object store; folder-like views are derived from key prefixes.")],
  ["aws-rds-multi-az", S("A Multi-AZ failover is guaranteed to cause zero application interruption.", "Failover can interrupt connections, so applications need retry and recovery behavior.")],
  ["aws-cloudfront", S("CloudFront can deliver only static files and cannot proxy dynamic requests.", "CloudFront can forward dynamic requests to origins as well as cache eligible content.")],
  ["aws-auto-scaling", S("Automatic scaling creates new healthy capacity instantly when traffic rises.", "Detection, instance launch, and health checks take time, so scaling is not instantaneous.")],

  ["spring-boot-embedded-server", S("An embedded server is suitable only for local development.", "Embedded servers are commonly used in production when deployed and operated appropriately.")],
  ["spring-boot-actuator", S("A healthy Actuator response proves every external dependency is healthy.", "A health result covers only the indicators that are configured and included.")],
  ["spring-config-precedence", S("When two property sources define the same key, the lower-priority source always wins.", "Spring Boot uses defined property-source precedence, and the higher-priority value wins.")],
  ["spring-graceful-shutdown", S("Graceful shutdown waits forever for every request by default.", "Graceful shutdown is bounded by configured application and infrastructure timeouts.")],

  ["docker-port", S("A port must appear in EXPOSE before `docker run -p` can publish it.", "Runtime port publishing can map a container port even when the Dockerfile does not declare EXPOSE.")],
  ["docker-multistage", S("A multi-stage build automatically updates every base image to its newest version.", "Base-image selection and update policy remain explicit build concerns.")],
  ["docker-healthcheck", S("A Docker health check by itself always restarts an unhealthy container.", "A health check reports status; restart behavior requires an orchestrator or other policy.")],
  ["docker-non-root", S("A non-root process cannot listen on any network port.", "Non-root processes can listen on unprivileged ports and may receive narrowly configured capabilities when needed.")],

  ["networking-http-idempotent", S("An idempotent request must return byte-for-byte identical responses every time.", "Idempotency concerns the intended server effect; response content can change between requests.")],
  ["networking-nat", S("NAT is a complete firewall that makes separate traffic policy unnecessary.", "Address translation is not a substitute for explicit firewall and access-control rules.")],
  ["networking-cors", S("CORS by itself prevents cross-site request forgery against the server.", "CORS mainly controls browser access to responses; CSRF needs its own defenses.")],
  ["networking-pmtud", S("Path MTU discovery matters only for IPv4 and never for IPv6.", "IPv6 also relies on path MTU discovery because routers do not fragment packets in transit.")],

  ["linux-pipe", S("A pipe preserves application-level message or record boundaries.", "A normal pipe is a byte stream; applications must define their own framing when needed.")],
  ["linux-symlink", S("The target must exist before a symbolic link can be created.", "A symbolic link can be created for a nonexistent path and will then be dangling.")],
  ["linux-cgroup", S("Control groups give processes separate views of process IDs and network interfaces.", "Namespaces isolate resource views; cgroups primarily account for and control resource usage.")],
  ["linux-oom", S("The OOM killer always terminates the process using the most memory.", "The kernel uses an OOM scoring policy, so raw memory use alone does not determine the victim.")],

  ["calculus-integral-area", S("If a definite integral is zero, the function must be zero everywhere on the interval.", "Positive and negative contributions can cancel, so a zero integral does not force the function to vanish.")],
  ["calculus-product-rule", S("If one factor is constant, the derivative of the whole product must be zero.", "A constant factor remains and multiplies the derivative of the other factor.")],
  ["calculus-substitution", S("A valid substitution never requires changing the bounds of a definite integral.", "For a definite integral, either transform the bounds to the new variable or return to the original variable before evaluating.")],
  ["calculus-taylor", S("Adding more Taylor terms always improves the approximation at every input.", "Improvement depends on the input, convergence region, and remainder; more terms do not give a universal guarantee.")],

  ["os-context-switch", S("A context switch can occur only between different processes, never between threads.", "The scheduler can switch between threads, including threads in the same process.")],
  ["os-mutex-semaphore", S("Declaring a semaphore automatically protects shared data even when code ignores its protocol.", "Synchronization works only when all relevant accesses follow the semaphore protocol correctly.")],
  ["os-scheduler", S("Giving a task lower priority guarantees that it will still run before starvation is possible.", "Priority scheduling needs an explicit fairness or aging policy to prevent starvation.")],
  ["os-page-cache", S("The operating-system page cache is the same hardware structure as a CPU cache.", "The page cache is managed by the kernel for file data; CPU caches are hardware caches for memory accesses.")],

  ["discrete-tree", S("Every vertex in a tree has degree at least two.", "Trees with more than one vertex have leaves of degree one, and a one-vertex tree has degree zero.")],
  ["discrete-surjective", S("Surjectivity prevents two different inputs from sharing an output.", "That restriction is injectivity; a surjective function may map multiple inputs to one output.")],
  ["discrete-pigeonhole", S("The pigeonhole principle identifies exactly which box must contain the collision.", "The principle guarantees that a collision exists without identifying a particular box.")],
  ["discrete-bayes", S("Bayes' theorem says `P(A given B)` always equals `P(B given A)`.", "The reverse conditionals are related through priors and the probability of the evidence, but are not generally equal.")]
]);

// Some questions contain no Sus statements. Their original misconception is
// replaced by its correction, producing a third independently true statement.
const zeroSusQuestionIds = new Set([
  "javascript-typeof-null", "javascript-closure",
  "python-is-vs-equals", "python-mutable-default",
  "dsa-stack", "dsa-hash-complexity",
  "java-reference-equality", "java-checked-exception",
  "sql-left-join", "sql-group-by",
  "system-design-load-balancer", "system-design-sharding",
  "aws-region-az", "aws-security-group",
  "spring-boot-autoconfiguration", "spring-boot-constructor-injection",
  "docker-image-container", "docker-layer-cache",
  "networking-tcp-udp", "networking-tls-certificate",
  "linux-permissions", "linux-fork",
  "calculus-derivative", "calculus-chain-rule",
  "os-kernel", "os-page-fault",
  "discrete-implication", "discrete-de-morgan"
]);

// One question per topic contains three Sus statements. These final
// alternatives are written explicitly so every correction remains precise.
const thirdSusByQuestion = new Map([
  ["javascript-atomics", S("Atomics operations guarantee that concurrent code never blocks.", "Atomics provide synchronization primitives, and operations such as Atomics.wait can block an eligible agent.")],
  ["python-frozen-dataclass", S("A frozen dataclass automatically deep-copies mutable constructor arguments.", "Frozen dataclasses do not deep-copy their fields; mutable objects passed to the constructor remain mutable.")],
  ["dsa-red-black-tree", S("Red-black tree lookup takes O(1) time in the worst case.", "The height is logarithmic, so lookup is O(log n) in the worst case.")],
  ["java-concurrent-map", S("ConcurrentHashMap locks the entire map for every read.", "ConcurrentHashMap reads generally do not lock the entire map.")],
  ["sql-recursive-cte", S("Recursive CTEs can traverse only trees, never graphs.", "Recursive CTEs can traverse graphs too, provided the query handles termination and cycles appropriately.")],
  ["system-design-saga", S("A saga guarantees globally serializable isolation across every participating service.", "A saga coordinates local transactions but does not by itself provide one globally serializable transaction.")],
  ["aws-auto-scaling", S("Scaling an EC2 group automatically scales every database dependency as well.", "Each dependency needs its own capacity and scaling design; scaling one tier does not scale the others.")],
  ["spring-graceful-shutdown", S("Graceful shutdown makes every interrupted request safe to retry.", "Retry safety depends on the operation's idempotency and application design, not shutdown behavior alone.")],
  ["docker-non-root", S("A Dockerfile USER instruction automatically changes ownership of files copied earlier.", "USER selects the account for later instructions and runtime; file ownership must be set separately, such as with COPY --chown.")],
  ["networking-pmtud", S("The largest MTU on any link is automatically safe for the whole path.", "The path MTU is constrained by the smallest supported MTU along the route.")],
  ["linux-oom", S("An out-of-memory event can occur only when swap is disabled.", "OOM can occur with or without swap when the relevant memory domain cannot satisfy an allocation.")],
  ["calculus-taylor", S("Every Taylor series has an infinite radius of convergence.", "A Taylor series can have a finite or even zero radius of convergence.")],
  ["os-page-cache", S("Reading file data from the page cache always performs a new disk read.", "A cache hit can satisfy the read from memory without accessing the storage device again.")],
  ["discrete-bayes", S("Bayes' theorem requires the two events to be independent.", "Bayes' theorem is useful precisely for relating conditional probabilities and does not require independence.")]
]);

const outputDir = path.join(process.cwd(), "datasets", "questions", "v1");
await mkdir(outputDir, { recursive: true });

if (banks.length !== 14) throw new Error(`Expected 14 topic banks, found ${banks.length}.`);

for (const [bankIndex, bank] of banks.entries()) {
  for (const question of bank.questions) {
    for (const answer of question.answers) {
      if (answer.verdict === "sus" && !answer.correction) {
        throw new Error(`${question.id} has a Sus answer without a correction.`);
      }
    }
  }
  const questions = bank.questions.map((question, questionIndex) => {
    const answers = question.answers.map((answer) =>
      zeroSusQuestionIds.has(question.id) && answer.verdict === "sus"
        ? L(answer.correction)
        : answer
    );
    const secondSus = secondSusByQuestion.get(question.id);
    if (secondSus) {
      const replaceIndex = answers.findLastIndex((answer) => answer.verdict === "legit");
      if (replaceIndex === -1) throw new Error(`${question.id} has no Legit answer to replace.`);
      answers[replaceIndex] = secondSus;
    }
    const thirdSus = thirdSusByQuestion.get(question.id);
    if (thirdSus) {
      const replaceIndex = answers.findLastIndex((answer) => answer.verdict === "legit");
      if (replaceIndex === -1) throw new Error(`${question.id} has no remaining Legit answer to replace.`);
      answers[replaceIndex] = thirdSus;
    }
    const rotation = (bankIndex + questionIndex) % 3;
    return ({
    id: question.id,
    difficulty: question.difficulty,
    prompt: question.prompt,
    answers: [...answers.slice(rotation), ...answers.slice(0, rotation)].map((answer, index) => ({
      id: ["a", "b", "c"][index],
      text: answer.text,
      verdict: answer.verdict,
      feedback: {
        legit: answer.verdict === "legit"
          ? `Correct. ${answer.text}`
          : `Not quite. ${answer.correction}`,
        sus: answer.verdict === "sus"
          ? `Correct. ${answer.correction}`
          : `This answer is legitimate. ${answer.text}`
      }
    })),
    reference: bank.reference,
    review_status: "approved"
  });
  });
  const file = {
    schema_version: "1.0",
    dataset_version: "v1",
    topic: { id: bank.id, name: bank.name },
    questions
  };
  await writeFile(path.join(outputDir, `${bank.id}.json`), `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

console.log(`Built ${banks.length} topic files.`);

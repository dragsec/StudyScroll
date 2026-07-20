export type Difficulty = "easy" | "medium" | "hard";
export type Verdict = "legit" | "sus";

export type Answer = {
  id: string;
  handle: string;
  role: string;
  text: string;
  verdict: Verdict;
  feedback: string;
};

export type Question = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  prompt: string;
  clue: string;
  source: string;
  answers: Answer[];
};

export const topics = [
  "All",
  "Javascript",
  "Python",
  "DSA",
  "Java",
  "SQL",
  "Docker",
  "Networking",
  "AWS",
  "Spring Boot",
  "Linux",
  "System Design",
] as const;

export const questions: Question[] = [
  {
    id: "js-typeof-null",
    topic: "Javascript",
    difficulty: "easy",
    prompt: "What does typeof null return in JavaScript?",
    clue: "> typeof null",
    source: "ECMAScript language types",
    answers: [
      {
        id: "a",
        handle: "@alex_senior",
        role: "Backend Engineer",
        text: "\"object\" because of a legacy representation bug in the original JavaScript engine. It stayed for web compatibility.",
        verdict: "legit",
        feedback: "Correct. The result is \"object\". Historical implementations used a type tag that collided with null, and compatibility preserved the behavior.",
      },
      {
        id: "b",
        handle: "@rookie_dev",
        role: "Junior Developer",
        text: "\"undefined\", because null means no value and no value should not have a type.",
        verdict: "sus",
        feedback: "Careful. Null and undefined are distinct JavaScript values. typeof undefined is \"undefined\"; typeof null is \"object\".",
      },
      {
        id: "c",
        handle: "@lin_code",
        role: "Language Historian",
        text: "\"object\". That does not mean null is an object; it is a historical compatibility quirk.",
        verdict: "legit",
        feedback: "Correct. The nuance matters: the operator returns \"object\", but null is still its own primitive value.",
      },
    ],
  },
  {
    id: "python-gil",
    topic: "Python",
    difficulty: "medium",
    prompt: "Why can the Python GIL still allow useful concurrency?",
    clue: "await fetch_profile(user_id)",
    source: "Python threading and asyncio documentation",
    answers: [
      {
        id: "a",
        handle: "@noor_backend",
        role: "Backend Engineer",
        text: "Threads can make progress while another thread waits for I/O, so network and file-heavy programs can still benefit.",
        verdict: "legit",
        feedback: "Correct. The GIL limits simultaneous Python bytecode execution, but I/O waits release opportunities for other work.",
      },
      {
        id: "b",
        handle: "@parallel_pete",
        role: "Platform Engineer",
        text: "The GIL disappears whenever a program creates more than four threads.",
        verdict: "sus",
        feedback: "No. Thread count does not remove the GIL. Native extensions may release it, and separate processes have separate interpreters.",
      },
      {
        id: "c",
        handle: "@async_ava",
        role: "Python Educator",
        text: "Async I/O provides concurrency without depending on multiple Python threads executing bytecode at the same instant.",
        verdict: "legit",
        feedback: "Correct. An event loop interleaves tasks at await points, which is useful for many I/O-bound workloads.",
      },
    ],
  },
  {
    id: "docker-layers",
    topic: "Docker",
    difficulty: "hard",
    prompt: "Why should dependency install steps come before app code in a Dockerfile?",
    clue: "COPY package*.json ./  →  RUN npm ci  →  COPY . .",
    source: "Docker build cache documentation",
    answers: [
      {
        id: "a",
        handle: "@maya_ops",
        role: "Platform Specialist",
        text: "Docker can reuse the dependency layer while only application files change, making repeated builds much faster.",
        verdict: "legit",
        feedback: "Correct. Stable dependency manifests preserve the expensive cached install layer across ordinary code edits.",
      },
      {
        id: "b",
        handle: "@container_kid",
        role: "Cloud Student",
        text: "Docker requires package files to be copied first or the final container cannot access the network.",
        verdict: "sus",
        feedback: "Not quite. This ordering is a cache optimization, not a networking requirement.",
      },
      {
        id: "c",
        handle: "@buildsmith",
        role: "Release Engineer",
        text: "Layer order affects cache invalidation: when an early layer changes, the layers after it must be rebuilt.",
        verdict: "legit",
        feedback: "Correct. Put infrequently changing inputs before frequently changing source files to retain useful cache hits.",
      },
    ],
  },
  {
    id: "sql-left-join",
    topic: "SQL",
    difficulty: "easy",
    prompt: "What happens to unmatched rows in a LEFT JOIN?",
    clue: "users LEFT JOIN orders ON users.id = orders.user_id",
    source: "PostgreSQL joined tables documentation",
    answers: [
      {
        id: "a",
        handle: "@query_queen",
        role: "Data Engineer",
        text: "Every left-side row remains. Missing right-side columns are filled with null values.",
        verdict: "legit",
        feedback: "Correct. A left outer join preserves all rows from the left relation.",
      },
      {
        id: "b",
        handle: "@indexfan",
        role: "Database Admin",
        text: "Unmatched rows are removed unless both tables have a primary key.",
        verdict: "sus",
        feedback: "No. Primary keys do not change the preservation rule of a LEFT JOIN.",
      },
      {
        id: "c",
        handle: "@relational_ray",
        role: "SQL Instructor",
        text: "A WHERE condition on a right-table column can remove those null-extended rows afterward.",
        verdict: "legit",
        feedback: "Correct. Filtering a right-side value in WHERE can make the result behave like an inner join for that condition.",
      },
    ],
  },
  {
    id: "http-idempotent",
    topic: "Networking",
    difficulty: "medium",
    prompt: "Does idempotent mean an HTTP request has no side effects?",
    clue: "PUT /profiles/42",
    source: "HTTP Semantics specification",
    answers: [
      {
        id: "a",
        handle: "@packet_path",
        role: "Network Engineer",
        text: "No. It means repeating the same request has the same intended effect as making it once.",
        verdict: "legit",
        feedback: "Correct. Logging or metrics may still occur; idempotency concerns the intended state-changing effect.",
      },
      {
        id: "b",
        handle: "@rest_ranger",
        role: "API Consultant",
        text: "Yes. Any request that writes to a database is automatically non-idempotent.",
        verdict: "sus",
        feedback: "No. PUT and DELETE can change state and still be idempotent when repeated requests settle on the same intended state.",
      },
      {
        id: "c",
        handle: "@cache_control",
        role: "Web Architect",
        text: "A client may retry an idempotent request more safely after a connection failure, though application details still matter.",
        verdict: "legit",
        feedback: "Correct. Idempotency supports safer retries, but concurrency and implementation bugs can still complicate behavior.",
      },
    ],
  },
  {
    id: "big-o-binary",
    topic: "DSA",
    difficulty: "easy",
    prompt: "When is binary search not O(log n) overall?",
    clue: "middle = low + (high - low) / 2",
    source: "Algorithm analysis fundamentals",
    answers: [
      {
        id: "a",
        handle: "@algo_amy",
        role: "CS Tutor",
        text: "If the data must first be sorted for a single search, sorting can dominate the total cost.",
        verdict: "legit",
        feedback: "Correct. Binary search is logarithmic after random-access sorted data is available; preparing that data may cost more.",
      },
      {
        id: "b",
        handle: "@complexity_cam",
        role: "Interview Coach",
        text: "Binary search becomes O(n) whenever the target is not present.",
        verdict: "sus",
        feedback: "No. An unsuccessful binary search still halves the remaining search range each step.",
      },
      {
        id: "c",
        handle: "@linked_liz",
        role: "Systems Student",
        text: "On a linked list, reaching each midpoint is not constant time, so the usual array analysis does not transfer cleanly.",
        verdict: "legit",
        feedback: "Correct. Binary search relies on efficient random access; linked traversal changes the cost model.",
      },
    ],
  },
  {
    id: "aws-multi-az",
    topic: "AWS",
    difficulty: "medium",
    prompt: "Does deploying across two Availability Zones guarantee zero downtime?",
    clue: "region → AZ-a + AZ-b",
    source: "AWS reliability guidance",
    answers: [
      {
        id: "a",
        handle: "@cloud_cleo",
        role: "Cloud Architect",
        text: "No. Multi-AZ removes some single points of failure, but the application, data layer, health checks, and failover path must also work.",
        verdict: "legit",
        feedback: "Correct. Redundant placement is one ingredient; recovery behavior and dependencies still determine availability.",
      },
      {
        id: "b",
        handle: "@uptime_uma",
        role: "Solutions Engineer",
        text: "Yes. AWS automatically makes every dependency highly available once two AZs are selected.",
        verdict: "sus",
        feedback: "No. Each dependency needs an appropriate multi-AZ design, and application-level failures can affect every zone.",
      },
      {
        id: "c",
        handle: "@resilience_ron",
        role: "SRE",
        text: "You still need to test failover because a redundant system that cannot switch traffic correctly is not resilient.",
        verdict: "legit",
        feedback: "Correct. Game days and failure testing validate that the designed recovery path actually works.",
      },
    ],
  },
  {
    id: "java-equals",
    topic: "Java",
    difficulty: "hard",
    prompt: "Why must equal Java objects have equal hash codes?",
    clue: "a.equals(b)  →  a.hashCode() == b.hashCode()",
    source: "Java Object contract",
    answers: [
      {
        id: "a",
        handle: "@jvm_jules",
        role: "Java Maintainer",
        text: "Hash collections choose a bucket before checking equality. Different hashes could place equal keys where the collection will not find them.",
        verdict: "legit",
        feedback: "Correct. The contract lets hash-based collections narrow the lookup and then use equals within the relevant bucket.",
      },
      {
        id: "b",
        handle: "@spring_sam",
        role: "Application Developer",
        text: "Equal hash codes also guarantee that equals will return true.",
        verdict: "sus",
        feedback: "No. Collisions are allowed: unequal objects may share a hash code.",
      },
      {
        id: "c",
        handle: "@bytecode_ben",
        role: "Runtime Engineer",
        text: "The reverse rule does not hold; unequal objects can legitimately collide.",
        verdict: "legit",
        feedback: "Correct. A hash is a compact value, so collisions are expected and equality resolves them.",
      },
    ],
  },
];
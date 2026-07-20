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
    prompt: "Okay, settle this: what does typeof null actually return in JavaScript?",
    clue: "> typeof null",
    source: "ECMAScript language types",
    answers: [
      {
        id: "a",
        handle: "@alex_senior",
        role: "Backend Engineer",
        text: "IIRC, it returns \"object\" because of a bug in the original engine. The web had already shipped, so the behavior stayed.",
        verdict: "legit",
        feedback: "Correct. The result is \"object\". Historical implementations used a type tag that collided with null, and compatibility preserved the behavior.",
      },
      {
        id: "b",
        handle: "@rookie_dev",
        role: "Junior Developer",
        text: "Wouldn't it be \"undefined\"? Null means no value, so giving it an actual type feels wrong.",
        verdict: "sus",
        feedback: "Careful. Null and undefined are distinct JavaScript values. typeof undefined is \"undefined\"; typeof null is \"object\".",
      },
      {
        id: "c",
        handle: "@lin_code",
        role: "Language Historian",
        text: "The weird part is that it returns \"object\", but null still isn't an object. It's just an old compatibility quirk.",
        verdict: "legit",
        feedback: "Correct. The nuance matters: the operator returns \"object\", but null is still its own primitive value.",
      },
    ],
  },
  {
    id: "python-gil",
    topic: "Python",
    difficulty: "medium",
    prompt: "Python thread discourse gets messy: why can the GIL still allow useful concurrency?",
    clue: "await fetch_profile(user_id)",
    source: "Python threading and asyncio documentation",
    answers: [
      {
        id: "a",
        handle: "@noor_backend",
        role: "Backend Engineer",
        text: "Threads still help when one is waiting on I/O. Network and file-heavy code can get real value from that overlap.",
        verdict: "legit",
        feedback: "Correct. The GIL limits simultaneous Python bytecode execution, but I/O waits release opportunities for other work.",
      },
      {
        id: "b",
        handle: "@parallel_pete",
        role: "Platform Engineer",
        text: "Pretty sure the GIL drops away once the program has more than four threads, right?",
        verdict: "sus",
        feedback: "No. Thread count does not remove the GIL. Native extensions may release it, and separate processes have separate interpreters.",
      },
      {
        id: "c",
        handle: "@async_ava",
        role: "Python Educator",
        text: "I'd reach for async I/O here. You get concurrency without needing several Python threads to run bytecode at once.",
        verdict: "legit",
        feedback: "Correct. An event loop interleaves tasks at await points, which is useful for many I/O-bound workloads.",
      },
    ],
  },
  {
    id: "docker-layers",
    topic: "Docker",
    difficulty: "hard",
    prompt: "Docker people, sanity-check me: why copy dependency files before the app code?",
    clue: "COPY package*.json ./  →  RUN npm ci  →  COPY . .",
    source: "Docker build cache documentation",
    answers: [
      {
        id: "a",
        handle: "@maya_ops",
        role: "Platform Specialist",
        text: "It's mostly a cache win. Docker can keep the dependency layer when only the app code changes, so rebuilds are much faster.",
        verdict: "legit",
        feedback: "Correct. Stable dependency manifests preserve the expensive cached install layer across ordinary code edits.",
      },
      {
        id: "b",
        handle: "@container_kid",
        role: "Cloud Student",
        text: "I thought Docker needed the package files first or the final container wouldn't get network access.",
        verdict: "sus",
        feedback: "Not quite. This ordering is a cache optimization, not a networking requirement.",
      },
      {
        id: "c",
        handle: "@buildsmith",
        role: "Release Engineer",
        text: "The bit people miss is cache invalidation. Change an early layer and Docker has to rebuild everything after it.",
        verdict: "legit",
        feedback: "Correct. Put infrequently changing inputs before frequently changing source files to retain useful cache hits.",
      },
    ],
  },
  {
    id: "sql-left-join",
    topic: "SQL",
    difficulty: "easy",
    prompt: "Quick SQL check: what really happens to unmatched rows in a LEFT JOIN?",
    clue: "users LEFT JOIN orders ON users.id = orders.user_id",
    source: "PostgreSQL joined tables documentation",
    answers: [
      {
        id: "a",
        handle: "@query_queen",
        role: "Data Engineer",
        text: "Every row from the left stays. If nothing matches on the right, those columns come back as null.",
        verdict: "legit",
        feedback: "Correct. A left outer join preserves all rows from the left relation.",
      },
      {
        id: "b",
        handle: "@indexfan",
        role: "Database Admin",
        text: "Aren't unmatched rows removed unless both tables have a primary key? That's how I remember it.",
        verdict: "sus",
        feedback: "No. Primary keys do not change the preservation rule of a LEFT JOIN.",
      },
      {
        id: "c",
        handle: "@relational_ray",
        role: "SQL Instructor",
        text: "Small gotcha: a WHERE filter on the right table can still remove those null-filled rows afterward.",
        verdict: "legit",
        feedback: "Correct. Filtering a right-side value in WHERE can make the result behave like an inner join for that condition.",
      },
    ],
  },
  {
    id: "http-idempotent",
    topic: "Networking",
    difficulty: "medium",
    prompt: "API debate: does idempotent actually mean 'no side effects'?",
    clue: "PUT /profiles/42",
    source: "HTTP Semantics specification",
    answers: [
      {
        id: "a",
        handle: "@packet_path",
        role: "Network Engineer",
        text: "Nope. It means repeating the same request has the same intended effect as sending it once.",
        verdict: "legit",
        feedback: "Correct. Logging or metrics may still occur; idempotency concerns the intended state-changing effect.",
      },
      {
        id: "b",
        handle: "@rest_ranger",
        role: "API Consultant",
        text: "Yeah, if it writes to the database it has a side effect, so it can't be idempotent.",
        verdict: "sus",
        feedback: "No. PUT and DELETE can change state and still be idempotent when repeated requests settle on the same intended state.",
      },
      {
        id: "c",
        handle: "@cache_control",
        role: "Web Architect",
        text: "The practical benefit is safer retries after a connection failure, though the implementation can still mess that up.",
        verdict: "legit",
        feedback: "Correct. Idempotency supports safer retries, but concurrency and implementation bugs can still complicate behavior.",
      },
    ],
  },
  {
    id: "big-o-binary",
    topic: "DSA",
    difficulty: "easy",
    prompt: "Interview-prep argument: when is binary search not O(log n) overall?",
    clue: "middle = low + (high - low) / 2",
    source: "Algorithm analysis fundamentals",
    answers: [
      {
        id: "a",
        handle: "@algo_amy",
        role: "CS Tutor",
        text: "If you sort the data just to do one search, that sorting step can dominate the total cost.",
        verdict: "legit",
        feedback: "Correct. Binary search is logarithmic after random-access sorted data is available; preparing that data may cost more.",
      },
      {
        id: "b",
        handle: "@complexity_cam",
        role: "Interview Coach",
        text: "Doesn't it degrade to O(n) when the target isn't there and you have to exhaust the search?",
        verdict: "sus",
        feedback: "No. An unsuccessful binary search still halves the remaining search range each step.",
      },
      {
        id: "c",
        handle: "@linked_liz",
        role: "Systems Student",
        text: "On a linked list, even reaching each midpoint costs time. The neat array analysis doesn't transfer cleanly.",
        verdict: "legit",
        feedback: "Correct. Binary search relies on efficient random access; linked traversal changes the cost model.",
      },
    ],
  },
  {
    id: "aws-multi-az",
    topic: "AWS",
    difficulty: "medium",
    prompt: "Cloud folks: do two Availability Zones actually guarantee zero downtime?",
    clue: "region → AZ-a + AZ-b",
    source: "AWS reliability guidance",
    answers: [
      {
        id: "a",
        handle: "@cloud_cleo",
        role: "Cloud Architect",
        text: "Not by itself. Multi-AZ removes some failure points, but the app, data, health checks, and failover path all have to cooperate.",
        verdict: "legit",
        feedback: "Correct. Redundant placement is one ingredient; recovery behavior and dependencies still determine availability.",
      },
      {
        id: "b",
        handle: "@uptime_uma",
        role: "Solutions Engineer",
        text: "I thought yes. Once you select two AZs, AWS makes the dependencies highly available for you.",
        verdict: "sus",
        feedback: "No. Each dependency needs an appropriate multi-AZ design, and application-level failures can affect every zone.",
      },
      {
        id: "c",
        handle: "@resilience_ron",
        role: "SRE",
        text: "You still have to test failover. Redundancy means very little if traffic can't switch when something breaks.",
        verdict: "legit",
        feedback: "Correct. Game days and failure testing validate that the designed recovery path actually works.",
      },
    ],
  },
  {
    id: "java-equals",
    topic: "Java",
    difficulty: "hard",
    prompt: "Java devs, settle this: why must equal objects share a hash code?",
    clue: "a.equals(b)  →  a.hashCode() == b.hashCode()",
    source: "Java Object contract",
    answers: [
      {
        id: "a",
        handle: "@jvm_jules",
        role: "Java Maintainer",
        text: "Hash collections pick a bucket before checking equals. Different hashes could send equal keys somewhere the lookup never checks.",
        verdict: "legit",
        feedback: "Correct. The contract lets hash-based collections narrow the lookup and then use equals within the relevant bucket.",
      },
      {
        id: "b",
        handle: "@spring_sam",
        role: "Application Developer",
        text: "And the reverse is true too, isn't it? Same hash code should mean equals returns true.",
        verdict: "sus",
        feedback: "No. Collisions are allowed: unequal objects may share a hash code.",
      },
      {
        id: "c",
        handle: "@bytecode_ben",
        role: "Runtime Engineer",
        text: "The reverse doesn't hold, though. Two unequal objects can absolutely collide on the same hash.",
        verdict: "legit",
        feedback: "Correct. A hash is a compact value, so collisions are expected and equality resolves them.",
      },
    ],
  },
];

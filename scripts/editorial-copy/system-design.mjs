export default {
  "system-design-load-balancer": {
    prompt: "Traffic is crushing one service instance while three others sit idle. What job should the load balancer be doing?",
    answers: [
      "Health checks help it avoid sending new traffic to instances that are not fit to serve.",
      "It distributes incoming requests across the healthy service instances instead of letting one absorb everything.",
      "Routing is the job. The load balancer is not where the application's primary data should be stored.",
    ],
  },
  "system-design-cache": {
    prompt: "Why put a cache in front of a slow data source if the cached value can eventually become stale?",
    answers: [
      "Repeated reads can return with lower latency while reducing pressure on the slower backend.",
      "A cache guarantees data is never stale. Once cached, the value always updates at the exact instant the source changes.",
      "Misses still fall through to the underlying source, so the backend remains part of the read path.",
    ],
  },
  "system-design-replication": {
    prompt: "What does keeping live copies of data improve, and why is replication not the same thing as a backup?",
    answers: [
      "Replication protects against every application bug. A bad delete reaches only the primary and never the replicas.",
      "A live replica is a complete backup because corruption and accidental writes cannot propagate to it.",
      "Additional copies can improve availability or serve more reads, depending on the replication design.",
    ],
  },
  "system-design-sharding": {
    prompt: "A database is split across several nodes by a shard key. Which problems got easier, and which queries got harder?",
    answers: [
      "Queries and transactions that cross shard boundaries become more complicated than single-node operations.",
      "Sharding partitions the dataset across multiple database nodes so one node does not hold everything.",
      "The partition key decides placement, so a poor key can create badly unbalanced storage and traffic.",
    ],
  },
  "system-design-idempotency": {
    prompt: "A client times out and retries the same payment request. How does an idempotency key prevent a second logical charge?",
    answers: [
      "Repeated deliveries carrying the same key can resolve to the same logical operation instead of creating another one.",
      "Keys remove the need for network retries. Once a request has a key, packets cannot be lost.",
      "The server must remember or derive the outcome associated with that key so a retry can reuse it.",
    ],
  },
  "system-design-queue": {
    prompt: "A producer spikes faster than its consumer can work. What does a durable queue decouple between them?",
    answers: [
      "It guarantees exactly-once processing without any idempotency or deduplication logic in the consumer.",
      "Every consumer sees one perfect global order, even across partitions and parallel workers.",
      "Producer and consumer can run at different rates and survive each other's temporary outages without meeting in real time.",
    ],
  },
  "system-design-circuit-breaker": {
    prompt: "A dependency is failing and every retry makes the outage worse. What should a circuit breaker do next?",
    answers: [
      "After a pause, a half-open state can allow limited probe traffic to see whether the dependency recovered.",
      "It stops repeated calls for a period so the caller fails quickly instead of hammering the broken dependency.",
      "The breaker repairs the downstream service automatically. Opening the circuit restarts its unhealthy instances.",
    ],
  },
  "system-design-rate-limit": {
    prompt: "An API has finite capacity and many competing clients. What does a rate limit protect and what can it not promise?",
    answers: [
      "Restricting request volume can protect capacity and enforce a chosen notion of fairness.",
      "Every accepted request is guaranteed low latency. Rate limiting removes all downstream bottlenecks.",
      "Distributed enforcement needs shared state, coordination, or an accepted approximation of the global limit.",
    ],
  },
  "system-design-cdn": {
    prompt: "Why serve static assets from CDN edge locations instead of making every user cross the network to the origin?",
    answers: [
      "A CDN eliminates cache invalidation. Once published, every edge updates instantly and consistently forever.",
      "It is safe to cache every origin response by default, including private and user-specific content.",
      "Nearby edge delivery can cut user latency and reduce repeated traffic reaching the origin.",
    ],
  },
  "system-design-cap": {
    prompt: "During a real network partition, what choice does CAP force between linearizable consistency and availability?",
    answers: [
      "Different operations in one system can make different tradeoffs rather than the entire product wearing one permanent label.",
      "While the partition persists, a distributed system cannot guarantee both linearizable consistency and a successful response to every request.",
      "CAP says every system permanently chooses only two of three properties, even when the network is completely healthy.",
    ],
  },
  "system-design-backpressure": {
    prompt: "A slow consumer cannot keep up with incoming work. How can backpressure stop the producer from flooding the system?",
    answers: [
      "The consumer signals or limits upstream production so work enters at a rate the pipeline can handle.",
      "Backpressure means buffering an unlimited amount in memory until the consumer eventually catches up.",
      "Depending on the system, the policy might block, batch, drop, sample, or shed some work.",
    ],
  },
  "system-design-saga": {
    prompt: "One business operation spans several services and databases. What does a saga coordinate when no global transaction exists?",
    answers: [
      "It opens one ACID transaction that locks every participating service database until the whole workflow commits.",
      "A compensating action rewinds database history perfectly, making the earlier step indistinguishable from never happening.",
      "Sagas guarantee globally serializable isolation across every service, even while steps run independently.",
    ],
  },
};


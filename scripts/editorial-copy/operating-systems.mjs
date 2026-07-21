export default {
  "os-kernel": {
    prompt: "What work belongs in an operating-system kernel rather than in an ordinary application or compiler?",
    answers: [
      "The kernel manages hardware resources and exposes protected services that programs can use safely.",
      "Compilers translate source code, but that is development tooling rather than the kernel's central runtime job.",
      "System calls are the controlled doorway from user programs into kernel services.",
    ],
  },
  "os-virtual-memory": {
    prompt: "Two processes both use address `0x1000` without colliding. What illusion is virtual memory creating for each one?",
    answers: [
      "Each process receives unrestricted access to every physical RAM address. Isolation would defeat virtual memory's purpose.",
      "The same virtual address can map to different physical storage in different processes.",
      "Each process sees its own virtual address space, which the OS maps to RAM and other backing storage.",
    ],
  },
  "os-context-switch": {
    prompt: "When the CPU switches from one runnable task to another, what state must the system save and restore?",
    answers: [
      "Context switches happen only between separate processes. Switching between threads never requires execution state to change.",
      "The system saves the outgoing execution context and restores the incoming one so it can continue.",
      "The CPU permanently deletes the old process state. A switched-out process cannot resume later.",
    ],
  },
  "os-page-fault": {
    prompt: "A process triggered a page fault. Is that automatically a crash, or can it be part of normal virtual-memory operation?",
    answers: [
      "Many page faults are routine: the OS maps or loads the needed page and lets the instruction continue.",
      "Some faults come from invalid access that the OS cannot resolve, which can terminate or signal the process.",
      "Demand paging depends on recoverable faults to bring pages into memory only when they are touched.",
    ],
  },
  "os-thread-process": {
    prompt: "Threads belong to one process. Which resources do they share, and why does that make synchronization necessary?",
    answers: [
      "Every thread gets a private copy of all process memory, so shared-state races cannot happen between threads.",
      "Sharing memory makes communication cheap, but unsynchronized access can make results depend on timing.",
      "Threads normally share the process address space and many process resources while keeping their own execution state.",
    ],
  },
  "os-mutex-semaphore": {
    prompt: "A mutex models ownership, while a counting semaphore models permits. How does that change their use?",
    answers: [
      "Declaring a semaphore protects the associated data automatically, even if every thread ignores the intended protocol.",
      "A counting semaphore can track several available permits rather than only a single locked or unlocked state.",
      "Every semaphore has one owning thread that must release it. Ownership is mandatory for semaphore signaling.",
    ],
  },
  "os-race-condition": {
    prompt: "Two correct-looking threads produce different answers depending on timing. What turns that timing into a race condition?",
    answers: [
      "The outcome depends on uncontrolled ordering between concurrent accesses to shared state.",
      "Putting two functions in the same source file creates a race, even if they never run concurrently or share data.",
      "Synchronization can impose an order or make an access atomic, removing the uncontrolled interleaving.",
    ],
  },
  "os-deadlock": {
    prompt: "Four conditions are usually named in classic resource deadlock. Which ones form the trap?",
    answers: [
      "High CPU utilization alone is enough. Busy processors eventually force every lock into deadlock.",
      "Break any one necessary condition and this classic form of deadlock cannot persist.",
      "The set is mutual exclusion, hold-and-wait, no preemption, and circular wait.",
    ],
  },
  "os-scheduler": {
    prompt: "Why can't a CPU scheduler maximize responsiveness, throughput, fairness, and low overhead all at once?",
    answers: [
      "Lower-priority work is guaranteed to run before starvation becomes possible, even without an aging policy.",
      "Schedulers balance competing goals such as response time, throughput, fairness, and scheduling overhead.",
      "One scheduling policy maximizes every metric for every workload. The goals never conflict in practice.",
    ],
  },
  "os-copy-on-write": {
    prompt: "After `fork`, parent and child appear to have separate memory. How does copy-on-write delay the expensive copying?",
    answers: [
      "They initially share physical pages, and a page is copied only when one process tries to modify it.",
      "The kernel duplicates every page before the child runs its first instruction. Sharing would violate process isolation.",
      "A write to a shared copy-on-write page faults so the OS can create a private writable copy.",
    ],
  },
  "os-thrashing": {
    prompt: "The machine is busy moving pages but barely doing application work. Is that the classic symptom of thrashing?",
    answers: [
      "Thrashing means the CPU executes instructions faster than RAM can understand them. Paging is unrelated.",
      "Reducing the active working sets or adding enough memory can move the system out of the thrashing regime.",
      "Yes. The system spends excessive time paging because the active memory demand does not fit effectively.",
    ],
  },
  "os-page-cache": {
    prompt: "Why keep file data in the OS page cache, and what durability mistake can that speed tempt developers to make?",
    answers: [
      "The page cache is literally the CPU's hardware cache. Both names refer to the same silicon structure.",
      "A page-cache hit still requires a fresh disk read. Cached data only helps the disk choose sectors faster.",
      "Once a write reaches the page cache it is guaranteed durable, even before the storage device receives it.",
    ],
  },
};


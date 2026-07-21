export default {
  "linux-permissions": {
    prompt: "Linux permissions show three little `rwx` groups. Who does each group apply to, and what does execute mean on a directory?",
    answers: [
      "Those mode bits apply to filesystem objects broadly, not only to regular executable files.",
      "For a directory, execute controls traversal and access through it. You are not 'running' the directory.",
      "The three groups belong to the owning user, the owning group, and everyone else.",
    ],
  },
  "linux-process": {
    prompt: "A program file can launch more than once, so what makes each running Linux process its own thing?",
    answers: [
      "Each process gets an identifier and its own virtual address-space context among its runtime resources.",
      "Think of it as a running instance of a program, complete with execution state and resources managed by the kernel.",
      "A process is just the executable file on disk, and Linux permits only one running instance of that file.",
    ],
  },
  "linux-pipe": {
    prompt: "In `a | b`, what stream leaves command `a`, and where exactly does the shell connect it on `b`?",
    answers: [
      "The shell connects `a`'s standard output to `b`'s standard input.",
      "It automatically joins the filesystems of the machines running the two commands, even across a network.",
      "The pipe preserves whatever record boundaries the first application used, so the second receives intact messages.",
    ],
  },
  "linux-fork": {
    prompt: "After a process calls `fork()`, what exists on the other side of that call, and is all memory copied immediately?",
    answers: [
      "The child is a separate process with its own PID, even though it begins from the parent's state.",
      "Copy-on-write commonly lets them share physical pages until one process modifies a page.",
      "You get a child process initially based on the caller. Both processes continue from the return point of `fork()`.",
    ],
  },
  "linux-signal": {
    prompt: "Unix signals are called asynchronous notifications. How reliable are they as a message queue, and can every signal be caught?",
    answers: [
      "Some signals can be handled or blocked, but `SIGKILL` cannot be caught or ignored.",
      "A signal is an asynchronous notification delivered to a process or, in some cases, a particular thread.",
      "Signals form an unlimited reliable queue. Repeated identical notifications are always preserved one by one.",
    ],
  },
  "linux-symlink": {
    prompt: "What does a symbolic link store, and why can it cross filesystems or point at something that does not exist yet?",
    answers: [
      "It stores a path that will be resolved when the link is followed.",
      "A symlink and its target must share a filesystem because they reference the same inode.",
      "Linux refuses to create a symbolic link until the target path already exists and is readable.",
    ],
  },
  "linux-hard-link": {
    prompt: "If two directory entries are hard links to the same file, what are they both pointing at underneath?",
    answers: [
      "They store a target pathname and follow that name again on every access, just like symbolic links.",
      "Removing one name does not remove the data while another hard link still references it.",
      "Both directory entries refer to the same inode and therefore the same underlying file data.",
    ],
  },
  "linux-load-average": {
    prompt: "A server shows load average `1.0`. Why can't I translate that directly into '100% CPU'?",
    answers: [
      "The three reported numbers summarize load over different windows, commonly one, five, and fifteen minutes.",
      "`1.0` always equals 100 percent CPU usage, whether the machine has one core or sixty-four.",
      "Tasks waiting on certain I/O can contribute to load average, so it is not just a CPU-utilization meter.",
    ],
  },
  "linux-cgroup": {
    prompt: "Containers use Linux control groups, but what are cgroups actually controlling or measuring?",
    answers: [
      "They group processes for resource accounting, allocation, and limits such as CPU or memory controls.",
      "Cgroups replace filesystem ownership and permission checks, so container files no longer need Unix modes.",
      "Separate PID and network views come from namespaces. Cgroups provide those isolated views instead.",
    ],
  },
  "linux-namespace": {
    prompt: "When people say a container has an 'isolated view' of Linux, which kernel feature creates those separate views?",
    answers: [
      "Namespaces encrypt all communication between processes automatically. Isolation is cryptographic by default.",
      "Containers combine several namespace types with cgroups, capabilities, and other controls rather than relying on one switch.",
      "Namespaces isolate selected views such as process IDs, mount points, host names, users, or network stacks.",
    ],
  },
  "linux-epoll": {
    prompt: "Why does `epoll` scale better than repeatedly scanning thousands of file descriptors for readiness?",
    answers: [
      "With edge-triggered notification, you need to drain the resource carefully or you can wait forever for an edge that already happened.",
      "The kernel can report ready descriptors without the caller rescanning the entire descriptor set on every wait.",
      "It converts every blocking file operation into CPU-parallel work. Readiness and parallel execution are the same thing.",
    ],
  },
  "linux-oom": {
    prompt: "When Linux cannot satisfy memory demand, what can the OOM path do, and what myths about its victim choice should I avoid?",
    answers: [
      "An out-of-memory event can happen only when swap is completely disabled. With swap configured, memory is unlimited.",
      "The kernel responds by adding physical RAM automatically. Applications never need to handle memory exhaustion.",
      "The OOM killer always selects whichever process currently uses the most memory. Its scoring has no other inputs.",
    ],
  },
};


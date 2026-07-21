export default {
  "docker-image-container": {
    prompt: "Someone on my team uses 'image' and 'container' like they are synonyms. What is the clean distinction?",
    answers: [
      "One image can launch many independent containers. The image is reused; the runtime state is not shared by default.",
      "Think template, not running process. An image is the immutable package used to create containers.",
      "A container is what you get when that image is instantiated and running with its own writable state.",
    ],
  },
  "docker-volume": {
    prompt: "My container is disposable but its database files are not. Is that exactly the problem a Docker volume solves?",
    answers: [
      "Yes. Put persistent data outside the container's writable layer so replacing the container does not erase it.",
      "Volumes are for baking source code permanently into the image. They make the build artifact immutable.",
      "A named volume can outlive the container that used it. Deleting the process wrapper does not automatically delete the data.",
    ],
  },
  "docker-port": {
    prompt: "I added `EXPOSE 3000` to a Dockerfile. Can the host reach that port now, or am I missing a separate step?",
    answers: [
      "You still need a publish mapping such as `docker run -p`. That connects a host port to the container port.",
      "Publishing with `-p` only works for ports previously listed in `EXPOSE`. Docker rejects every other mapping.",
      "`EXPOSE` creates the host mapping automatically. The port is public as soon as the container starts.",
    ],
  },
  "docker-layer-cache": {
    prompt: "Why do so many Dockerfiles copy the package manifest, install dependencies, and only then copy the application code?",
    answers: [
      "Docker reuses layers in order. Change an early input and the layers built after it may need to run again.",
      "Source files change constantly; dependency manifests usually do not. This ordering preserves the expensive install layer more often.",
      "It is a build-cache optimization, not a requirement for package registries or container networking.",
    ],
  },
  "docker-bind-mount": {
    prompt: "I need local files inside a container. When would I choose a bind mount instead of a named volume?",
    answers: [
      "A bind mount exposes a specific path from the host, which is handy when the exact local directory matters.",
      "Bind mounts are saved inside the image layers. The host path is copied once and then disconnected.",
      "Named volumes live in storage managed by Docker rather than at a host path you choose directly.",
    ],
  },
  "docker-multistage": {
    prompt: "My final image contains a compiler, package manager, and half the internet. How does a multi-stage build clean that up?",
    answers: [
      "Every stage becomes a production container and keeps running beside the final one. Nothing is actually removed.",
      "Declaring multiple stages also upgrades every base image to its newest tag. That is where the size saving comes from.",
      "Compile in one stage, then copy only the runtime artifacts into the final stage. The build toolchain stays behind.",
    ],
  },
  "docker-pid1": {
    prompt: "Why do containers care so much about the process running as PID 1? Isn't it just another process ID?",
    answers: [
      "A small init can forward signals and reap orphaned child processes, which avoids several PID 1 surprises.",
      "If the main process creates children, it needs to handle signals correctly and reap them instead of leaving zombies.",
      "PID 1 cannot receive termination signals at all, so graceful shutdown is impossible inside a container.",
    ],
  },
  "docker-secrets": {
    prompt: "Can I bake an API key into an image environment variable if the repository itself stays private?",
    answers: [
      "Sure. Image configuration is invisible to anyone who pulls or inspects the image, so the key remains private.",
      "Use a runtime secret mechanism and keep long-lived credentials out of the image artifact entirely.",
      "Deleting the secret in a later layer may leave it recoverable from earlier image history. Layers remember more than the final filesystem view.",
    ],
  },
  "docker-healthcheck": {
    prompt: "A container reports `healthy`. How much does that status really prove about the application and its dependencies?",
    answers: [
      "It proves every downstream service will remain available for the entire lifetime of the container.",
      "Docker always restarts a container the moment its health check fails. No orchestrator policy is needed.",
      "It proves only that the configured health command currently returns a healthy result. The check is as good as the command you wrote.",
    ],
  },
  "docker-compose-depends": {
    prompt: "Compose started the database before the API. Does basic `depends_on` mean the database is ready for connections?",
    answers: [
      "Not by itself, although supported health-based conditions can make startup coordination more meaningful.",
      "Yes. Process start order is the same thing as application readiness, so the first API connection is safe.",
      "The API should still tolerate a dependency taking time to become ready. Retry and recovery belong in the application path.",
    ],
  },
  "docker-network": {
    prompt: "Two containers share a user-defined Docker network. How should one find the other without hard-coding an IP address?",
    answers: [
      "Use Docker's built-in name resolution and connect by the container or Compose service name.",
      "Both containers must publish their ports on the host's public interface before they can talk to each other.",
      "Network membership also creates an isolation boundary. Containers need a shared reachable network before direct communication works.",
    ],
  },
  "docker-non-root": {
    prompt: "Running the container as non-root is good advice, but what does it reduce rather than magically eliminate?",
    answers: [
      "It makes host-kernel vulnerabilities impossible to exploit. A non-root UID is a complete container escape defense.",
      "Non-root processes cannot listen on any TCP or UDP port, including high-numbered ports such as 8080.",
      "Adding `USER` also fixes ownership for every file copied earlier in the Dockerfile. No `chown` is ever needed.",
    ],
  },
};


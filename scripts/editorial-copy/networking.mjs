export default {
  "networking-tcp-udp": {
    prompt: "If I am choosing between TCP and UDP, what reliability work does TCP take on that UDP leaves to the application?",
    answers: [
      "TCP gives the application one ordered, reliable byte stream instead of a pile of independent packets.",
      "UDP datagrams may vanish, arrive twice, or show up out of order. The protocol does not repair that for you.",
      "UDP skips connection setup and lets the application decide whether it needs retries, ordering, or no reliability layer at all.",
    ],
  },
  "networking-dns": {
    prompt: "When an app asks DNS about a hostname, what kind of answer comes back, and why might a resolver reuse it?",
    answers: [
      "DNS also encrypts the application's entire connection automatically. Once the name resolves, TLS is unnecessary.",
      "Resolvers can cache a record until its time-to-live expires instead of repeating the lookup every time.",
      "DNS maps names to records, including address records that contain IPv4 or IPv6 addresses.",
    ],
  },
  "networking-http-idempotent": {
    prompt: "People call an HTTP method idempotent when retries are safer. What stays the same after repeating the request?",
    answers: [
      "Every retry must return the exact same response bytes, headers, timestamp, and status code.",
      "The intended effect on server state should match the effect of sending the request once.",
      "Idempotent means side-effect free. Any request that changes stored data is automatically non-idempotent.",
    ],
  },
  "networking-tls-certificate": {
    prompt: "A browser accepts a server's TLS certificate. What identity and key binding has it actually verified?",
    answers: [
      "It verifies that a trusted issuer bound the presented public key to the identity the client requested.",
      "That authenticates identity and key material, not whether the server's application code is secure or correct.",
      "Normal validation also checks details such as the requested hostname and the certificate's validity period.",
    ],
  },
  "networking-nat": {
    prompt: "A packet crosses a NAT boundary. Which parts of its addressing are commonly rewritten, and what security does that not imply?",
    answers: [
      "NAT encrypts the packet end to end. Address translation and confidentiality are the same service.",
      "It is a complete firewall by itself, so separate allow and deny policies only duplicate what NAT already guarantees.",
      "NAT commonly rewrites IP addresses and often ports as traffic moves between network realms.",
    ],
  },
  "networking-subnet": {
    prompt: "What does the `/24` part of an IP network tell a host when it decides whether a destination is on-link?",
    answers: [
      "The host compares the destination against its configured on-link prefixes before choosing a direct path or a router.",
      "The prefix length says how many leading address bits identify the network portion.",
      "It sets the highest TCP or UDP port number available to hosts inside the subnet.",
    ],
  },
  "networking-arp": {
    prompt: "My IPv4 host knows a neighbor's IP address but needs to send an Ethernet frame. What does ARP discover?",
    answers: [
      "ARP resolves the neighbor's IPv4 address to its link-layer address on the local network.",
      "It resolves public domain names across the internet, acting as a lower-level replacement for DNS.",
      "The request is normally broadcast on the local segment so the owner of that IPv4 address can reply.",
    ],
  },
  "networking-flow-congestion": {
    prompt: "TCP has both flow control and congestion control. Which one protects the receiver, and which one reacts to the network?",
    answers: [
      "Congestion control responds to contention and limited capacity along the network path.",
      "They are two labels for the same receiver-buffer value. Neither one considers conditions in the network.",
      "Flow control keeps a fast sender from overwhelming the receiving endpoint's available capacity.",
    ],
  },
  "networking-cors": {
    prompt: "A browser blocks frontend code from reading a cross-origin response. What is CORS enforcing, and what is it not stopping?",
    answers: [
      "CORS stops cross-site request forgery by preventing the browser from sending the request to the server at all.",
      "It controls whether browser-based frontend code may read certain responses from another origin.",
      "It is a network firewall for every client. Curl and backend services cannot send packets when CORS denies an origin.",
    ],
  },
  "networking-quic": {
    prompt: "QUIC wants reliable streams, so why build it on UDP instead of putting everything back inside TCP?",
    answers: [
      "UDP provides datagram traversal while QUIC implements transport behavior in user space, where it can evolve more quickly.",
      "It abandons reliability and ordered streams completely. QUIC is fast only because lost data is ignored.",
      "Separate QUIC streams reduce transport-level head-of-line blocking between streams when one stream loses data.",
    ],
  },
  "networking-websocket": {
    prompt: "After the HTTP upgrade to WebSocket succeeds, what communication model replaces ordinary request and response?",
    answers: [
      "Every WebSocket message starts a brand-new HTTP request, complete with fresh headers and a separate connection.",
      "The long-lived connection still fails sometimes, so applications need detection, reconnection, and state-recovery logic.",
      "Client and server can send framed messages in both directions over the upgraded connection.",
    ],
  },
  "networking-pmtud": {
    prompt: "A large packet fits the first link but not a smaller link later in the route. What is path MTU discovery trying to learn?",
    answers: [
      "It is an IPv4-only concern. IPv6 paths never contain links with different MTUs.",
      "Just use the largest MTU found anywhere on the path; every smaller link will adapt automatically.",
      "It chooses the fastest DNS resolver, which then advertises a safe packet size for the route.",
    ],
  },
};

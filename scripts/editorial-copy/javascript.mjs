export default {
  "javascript-typeof-null": {
    prompt: "JavaScript says `typeof null` is `\"object\"`. Is null secretly an object, or is the language carrying old baggage?",
    answers: [
      "It is old baggage. The operator returns `\"object\"` because of a compatibility quirk that the web cannot simply remove.",
      "You do get `\"object\"`, but null is still a primitive. The result is not a reliable object test.",
      "So null does not suddenly gain normal object behavior. The label is historical, not a description of what null can do.",
    ],
  },
  "javascript-const-object": {
    prompt: "I declared an object with `const` and then changed one of its properties. Why did JavaScript allow that?",
    answers: [
      "It should not. `const` recursively freezes every property and nested object reachable from the variable.",
      "The binding stays fixed, but the object behind it can still mutate unless something else freezes or restricts it.",
      "`const` stops you assigning a different value to that variable. It does not promise deep immutability.",
    ],
  },
  "javascript-default-sort": {
    prompt: "Why does `[2, 10, 1].sort()` produce a result that looks wrong for numbers? What comparison is happening?",
    answers: [
      "It also returns a new array, so at least the original numeric order remains untouched.",
      "Without a comparator, values are converted to strings and ordered by their UTF-16 code-unit sequences.",
      "Numbers are always compared numerically from smallest to largest. A comparator only changes ascending to descending.",
    ],
  },
  "javascript-closure": {
    prompt: "A function runs after its outer function has already returned. How can a closure still see those old variables?",
    answers: [
      "The function retains access to bindings from the lexical environment where it was created.",
      "It captures the bindings themselves, not frozen snapshots, so later updates can still be observed.",
      "That environment can outlive the original call. Returning the inner function does not erase the variables it closes over.",
    ],
  },
  "javascript-microtasks": {
    prompt: "I queued a resolved Promise callback and a zero-delay timer. Which one normally gets its turn first?",
    answers: [
      "The `then` callback runs immediately inside the current call. Resolved promises are synchronous.",
      "Promise reactions normally drain as microtasks before the event loop picks up the next timer task.",
      "The current JavaScript stack finishes first, then the Promise callback runs from the microtask queue.",
    ],
  },
  "javascript-arrow-this": {
    prompt: "Why doesn't `call`, `apply`, or `new` give an arrow function a fresh `this` like a normal function?",
    answers: [
      "`call` and `apply` absolutely replace an arrow's `this`. Lexical binding only applies when it is invoked normally.",
      "An arrow reads `this` from the surrounding lexical scope instead of receiving one from how it is called.",
      "Use `new` and the arrow becomes a constructor with a brand-new instance as `this`.",
    ],
  },
  "javascript-promise-all": {
    prompt: "One task inside `Promise.all` rejected. What happens to the combined promise, and do the other tasks stop running?",
    answers: [
      "The combined promise rejects using that rejection reason rather than waiting for a successful array of results.",
      "JavaScript automatically cancels every other operation in the list. Rejection acts like a broadcast abort signal.",
      "The remaining work may keep running because `Promise.all` does not provide cancellation by itself.",
    ],
  },
  "javascript-map-async": {
    prompt: "I wrote `items.map(async item => work(item))` and got an array of pending things. What did `map` actually return?",
    answers: [
      "`map` waits for every async callback and replaces the promises with their resolved values before returning.",
      "The mapping pass itself is synchronous. It calls each callback and immediately collects what that callback returns.",
      "An async callback returns a promise, so the final value is an array of promises. Use an aggregation step if you need their results.",
    ],
  },
  "javascript-module-bindings": {
    prompt: "If an ES module updates an exported variable, does an importer see the update or keep the original value forever?",
    answers: [
      "The importer can assign directly to the imported name whenever it wants. Live bindings are writable from both modules.",
      "Imports are live views of exported bindings, so updates made by the exporting module become visible.",
      "Importing copies the current value once. From then on, the two modules hold unrelated variables.",
    ],
  },
  "javascript-weakmap": {
    prompt: "Why does storing metadata in a `WeakMap` avoid keeping an otherwise unreachable object alive?",
    answers: [
      "The map does not hold a strong reference that keeps its object key alive by itself.",
      "String keys are weak too, which makes `WeakMap` ideal for temporary IDs and cache keys.",
      "Keys are deliberately not enumerable because exposing them would make garbage-collection lifetime observable.",
    ],
  },
  "javascript-proxy-invariants": {
    prompt: "Can a Proxy trap lie about absolutely anything, or does JavaScript still enforce invariants from the target object?",
    answers: [
      "Break one of the required Proxy invariants and the operation can throw a `TypeError` instead of accepting the lie.",
      "For a non-extensible target, traps cannot report certain impossible property states. The target still constrains the illusion.",
      "A Proxy replaces all object rules. Every trap result is accepted, even when it contradicts a frozen target.",
    ],
  },
  "javascript-atomics": {
    prompt: "When do JavaScript `Atomics` matter? Are they general-purpose locks for ordinary arrays and object properties?",
    answers: [
      "They operate on every normal JavaScript array. Shared memory is optional because the runtime synchronizes the values for you.",
      "Atomic operations guarantee concurrent code never blocks. Waiting is impossible once `Atomics` is involved.",
      "They make arbitrary object-property updates thread-safe, even when those objects are not backed by shared memory.",
    ],
  },
};


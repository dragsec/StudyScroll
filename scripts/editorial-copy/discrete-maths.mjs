export default {
  "discrete-implication": {
    prompt: "Logic notation is bullying me again. Out of all the truth-value combinations, when does `P implies Q` actually fail?",
    answers: [
      "A false premise makes the implication true in classical logic. Weird in conversation, completely standard in the truth table.",
      "Rewrite it as `not P or Q`. The only way that expression fails is when both pieces are false.",
      "`P` has to be true while `Q` is false. That is the single false row in the table.",
    ],
  },
  "discrete-set-union": {
    prompt: "If I merge sets `A` and `B`, do shared elements appear twice, and which elements make it into the union?",
    answers: [
      "Sets do not keep duplicate memberships. An element appearing in both inputs still appears once in the union.",
      "Take anything that belongs to `A`, to `B`, or to both. That full collection is `A union B`.",
      "Union keeps only the overlap. If an element is not present in both sets, it gets dropped.",
    ],
  },
  "discrete-tree": {
    prompt: "For a finite undirected tree with `n` vertices, what structural facts can I rely on without inspecting the whole graph?",
    answers: [
      "A tree with `n` vertices has exactly `n - 1` edges. That identity is one of the quickest tree checks.",
      "It needs at least one cycle; otherwise the vertices would not be tied together strongly enough.",
      "Every vertex has degree two or more. Leaves are a feature of directed trees, not undirected ones.",
    ],
  },
  "discrete-de-morgan": {
    prompt: "I need to negate `P and Q` without accidentally changing the meaning. What does De Morgan turn it into?",
    answers: [
      "Negation flips the AND into an OR while negating both propositions.",
      "The same pattern shows up with sets: complement an intersection and you get the union of the complements.",
      "Write `not P or not Q`. It says at least one of the original propositions fails.",
    ],
  },
  "discrete-injective": {
    prompt: "People keep saying an injective function is 'one-to-one.' What restriction does that place on inputs and outputs?",
    answers: [
      "No output can have more than one preimage. One destination cannot be claimed by two different inputs.",
      "Distinct inputs must land on distinct outputs. Collisions are exactly what injectivity rules out.",
      "Every value in the codomain has to be reached. If even one is missed, the function is not injective.",
    ],
  },
  "discrete-surjective": {
    prompt: "Now for surjective functions: what has to happen to every element sitting in the codomain?",
    answers: [
      "Each codomain element needs at least one input mapping to it. Nothing on the target side can be left uncovered.",
      "Every input needs its own unique output. Any shared output breaks surjectivity immediately.",
      "Surjective means two inputs are forbidden from meeting at the same output. It is the collision-free property.",
    ],
  },
  "discrete-permutation": {
    prompt: "Assigning president and vice president is not the same as choosing two committee members. Which one cares about order?",
    answers: [
      "Combinations care about order; permutations only care which objects were selected.",
      "President and vice president are different roles, so swapping the people changes the outcome. That is permutation territory.",
      "Order matters for permutations. Combinations treat the same selected group as one result regardless of arrangement.",
    ],
  },
  "discrete-induction": {
    prompt: "What do I actually need to prove in an induction argument, beyond checking a suspiciously large pile of examples?",
    answers: [
      "With strong induction, the step may assume every earlier case rather than only the immediately previous one.",
      "Establish a base case, then prove that the assumed case leads to the next one. That closes the chain.",
      "Test enough values to make the pattern convincing, then assume the remaining integers behave the same way.",
    ],
  },
  "discrete-pigeonhole": {
    prompt: "Eleven files are assigned to ten folders. What can the pigeonhole principle promise, and what can it not identify?",
    answers: [
      "At least one folder must receive two or more files. More objects than containers forces a collision somewhere.",
      "It guarantees a perfectly even distribution, so every folder receives the same number of files.",
      "It tells you exactly which folder contains the duplicate before the assignment is even made.",
    ],
  },
  "discrete-equivalence": {
    prompt: "Before I call a relation an equivalence relation, which three properties need to survive the checklist?",
    answers: [
      "Antisymmetry and total comparability are the key pair. Those are what make equivalence classes possible.",
      "Once the relation is an equivalence relation, its equivalence classes partition the underlying set.",
      "Reflexive, symmetric, and transitive. Miss any one of those and the label does not apply.",
    ],
  },
  "discrete-modular": {
    prompt: "When I write `a` congruent to `b` modulo positive `n`, what exact divisibility claim am I making?",
    answers: [
      "You can add or multiply congruent values and preserve congruence. That algebra is one reason the notation is useful.",
      "The statement means `n` divides the difference `a - b` with no remainder.",
      "It is just a decorated equality sign. `a` and `b` must be the same integer before they can be congruent.",
    ],
  },
  "discrete-bayes": {
    prompt: "Bayes' theorem gets quoted whenever probabilities change after new evidence. What relationship is it actually expressing?",
    answers: [
      "It only works when the events are independent. Dependence makes the conditional probabilities unusable.",
      "The theorem lets you ignore the base rate and focus entirely on how convincing the new evidence feels.",
      "It says `P(A given B)` and `P(B given A)` are always equal. You can swap the condition without adjusting anything.",
    ],
  },
};


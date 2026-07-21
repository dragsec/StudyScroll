export default {
  "calculus-derivative": {
    prompt: "I can calculate derivatives, but what is the number actually telling me at a point: slope, accumulated area, or something else?",
    answers: [
      "On the graph, it is the slope of the tangent line at that point, assuming the derivative exists there.",
      "I think of it as the function's instant rate of change, like zooming in until the local behavior looks linear.",
      "Accumulated signed area belongs to definite integration, not to the derivative at one point.",
    ],
  },
  "calculus-power-rule": {
    prompt: "Sanity check on the power rule: if `f(x) = x^n` for a positive integer `n`, what should `f'(x)` be?",
    answers: [
      "Bring the exponent down as a coefficient and reduce it by one: `f'(x) = n x^(n-1)`.",
      "You raise the exponent and divide, so it becomes `x^(n+1)/(n+1)`. Same move as the power rule.",
      "The old exponent becomes the multiplier, then the new exponent is one smaller. That is the pattern I remember.",
    ],
  },
  "calculus-integral-area": {
    prompt: "My definite integral came out zero even though the function was not zero. Can area below the axis cancel area above it?",
    answers: [
      "Yes. A definite integral tracks signed accumulation, so positive and negative contributions can cancel.",
      "No. If the integral is zero, the function had to stay at zero for the entire interval.",
      "Definite integrals are ordinary area, which can never be negative. Cancellation is not part of the definition.",
    ],
  },
  "calculus-chain-rule": {
    prompt: "A student keeps mixing up the chain rule and the product rule. What pattern would you point out first?",
    answers: [
      "Differentiate the outside function, leave the inside in place, then multiply by the derivative of that inside function.",
      "Look for one function nested inside another. A composition is the chain rule's natural habitat.",
      "Two functions multiplied together call for the product rule; one function fed into another calls for the chain rule.",
    ],
  },
  "calculus-product-rule": {
    prompt: "No shortcuts: if `h(x) = f(x)g(x)`, what does `h'(x)` expand to?",
    answers: [
      "`h'(x) = f'(x)g(x) + f(x)g'(x)`. Differentiate each factor once while keeping the other one.",
      "Easy: `h'(x) = f'(x)g'(x)`. Just differentiate both sides of the product.",
      "If either factor is constant, the derivative of the entire product is zero. Constants kill the product rule.",
    ],
  },
  "calculus-ftc": {
    prompt: "How would you explain the Fundamental Theorem without reciting its name? What are differentiation and integration doing to each other?",
    answers: [
      "It guarantees an elementary antiderivative for every discontinuous function. That is the theorem's main point.",
      "Under the right conditions, differentiate an integral whose upper limit moves and you recover the integrand.",
      "It ties accumulated change from integration to antiderivatives. In that precise sense, the two operations undo each other.",
    ],
  },
  "calculus-continuity": {
    prompt: "A curve has no break at a point. Is that enough to know a derivative exists there too?",
    answers: [
      "No. `|x|` stays continuous at zero but has a sharp corner there, so the derivative does not exist.",
      "Yes. If you can draw through the point without lifting your pen, a tangent slope must exist.",
      "The implication runs the other way: differentiability at a point guarantees continuity at that point.",
    ],
  },
  "calculus-critical-point": {
    prompt: "I found `f'(c) = 0`. Can I call `c` a maximum or minimum already, or is that jumping the gun?",
    answers: [
      "Call it an extremum. Every stationary point has to be either a local maximum or a local minimum.",
      "That only makes `c` a critical point worth investigating. It does not classify the point for you.",
      "Check how the derivative changes sign, or use suitable higher-derivative information, before naming the point.",
    ],
  },
  "calculus-substitution": {
    prompt: "When I use `u`-substitution in an integral, which differentiation rule am I effectively running backward?",
    answers: [
      "It is the quotient rule in reverse, and only the quotient rule. Products and compositions are unrelated.",
      "The bounds of a definite integral stay untouched after substitution. Only the variable name changes.",
      "You are reversing the chain rule: spot an inner expression and account for its derivative.",
    ],
  },
  "calculus-partial": {
    prompt: "With `∂f/∂x`, what am I pretending stays unchanged while `x` moves?",
    answers: [
      "A partial derivative measures the rate of change along one coordinate direction.",
      "Hold the other independent variables fixed, then let `x` vary. That is the whole setup.",
      "You freeze the function's output value and change `x` underneath it. The other inputs can move freely.",
    ],
  },
  "calculus-gradient": {
    prompt: "For a scalar field in Euclidean space, where does the gradient point, and what does its length tell you?",
    answers: [
      "When it is nonzero, the gradient points in the direction of steepest local increase.",
      "It lies tangent to every regular level surface. Following it keeps the scalar value unchanged.",
      "Its magnitude is the largest directional derivative available among unit directions at that point.",
    ],
  },
  "calculus-taylor": {
    prompt: "If a function has derivatives of every order, can I safely replace it with its Taylor series everywhere?",
    answers: [
      "Absolutely. Every Taylor series converges for every input, so the radius is always infinite.",
      "More terms always improve the approximation at every input. Taylor error can only decrease.",
      "Yes. Infinite differentiability is exactly the condition that makes a function equal its Taylor series.",
    ],
  },
};

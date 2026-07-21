export default {
  "spring-boot-autoconfiguration": {
    prompt: "Spring Boot created beans I never declared. What evidence does auto-configuration inspect before adding those defaults?",
    answers: [
      "The decisions are conditional on the application environment rather than one fixed setup for every project.",
      "Define your own bean and many matching defaults back off instead of fighting your configuration.",
      "It looks at the classpath, properties, and beans already present, then configures common infrastructure when the conditions match.",
    ],
  },
  "spring-boot-starter": {
    prompt: "What does a Spring Boot starter save me from choosing manually in a Maven or Gradle build?",
    answers: [
      "It bundles a curated dependency set so you do not have to select and align every transitive library yourself.",
      "Think dependency descriptor for a common capability, such as web or data access, rather than executable code by itself.",
      "A starter is an external application server that runs separately and deploys your Boot project into itself.",
    ],
  },
  "spring-boot-embedded-server": {
    prompt: "Can a Spring Boot web app ship and launch its own server, or does production always require a separately installed one?",
    answers: [
      "It can package an embedded server and start that server as part of launching the application.",
      "Every deployment needs a separately installed application server. Embedded servers work only in tutorials.",
      "An embedded server is strictly a local-development feature and must be removed from production builds.",
    ],
  },
  "spring-boot-constructor-injection": {
    prompt: "Why do Spring teams often prefer constructor injection for required dependencies instead of hiding them in fields?",
    answers: [
      "Tests can pass dependencies directly through the constructor without relying on container-driven field mutation.",
      "With one constructor, Spring can use it without an explicit `@Autowired` annotation.",
      "Required collaborators become visible in the API and can live in final fields, making invalid construction harder.",
    ],
  },
  "spring-boot-profile": {
    prompt: "What changes when I activate a Spring profile, and how can that activation be supplied outside the code?",
    answers: [
      "Active profiles can come from external configuration, which lets deployment choose them without recompiling.",
      "Profiles conditionally activate beans and configuration intended for named environments or modes.",
      "They toggle Java language features at compile time, changing which syntax the compiler accepts.",
    ],
  },
  "spring-boot-actuator": {
    prompt: "What does Actuator expose about a running Spring Boot app, and why is one green health response not the whole story?",
    answers: [
      "It adds operational endpoints and production-oriented information about the running application.",
      "Every endpoint is safely public by default, including sensitive environment and configuration details.",
      "A healthy top-level response proves every external dependency is reachable and correct, regardless of health configuration.",
    ],
  },
  "spring-transaction-proxy": {
    prompt: "Why can `this.doTransactionalWork()` skip `@Transactional` even though the called method has the annotation?",
    answers: [
      "Transactions work only on static methods. Instance methods cannot participate in Spring transactions.",
      "Calling through another proxied bean, or using another transaction mechanism, restores the interception point.",
      "A self-call through `this` stays inside the object and never passes through Spring's default transaction proxy.",
    ],
  },
  "spring-bean-scope": {
    prompt: "When I declare a Spring bean without a scope, how many instances does one application context normally create?",
    answers: [
      "Web-aware contexts also offer scopes such as request and session when those lifetimes fit the component.",
      "The default is one singleton bean instance per application context.",
      "Spring constructs a fresh bean for every method call. Invocation scope is the default.",
    ],
  },
  "spring-config-precedence": {
    prompt: "The same Spring Boot property appears in several sources. How does the application decide which value wins?",
    answers: [
      "Spring Boot has defined precedence rules, so the higher-priority source overrides the others for that key.",
      "Only `application.properties` is a real configuration source. Environment variables and command-line values are ignored.",
      "The lower-priority source always wins because defaults are loaded first and protected from later overrides.",
    ],
  },
  "spring-validation": {
    prompt: "I put Bean Validation annotations on a request object, but invalid JSON still reached my controller. What step is missing?",
    answers: [
      "Nothing is missing. Merely constructing any annotated object runs validation automatically everywhere in Java.",
      "When binding fails, translate the resulting errors into a clear response the API client can act on.",
      "Trigger validation at the boundary, commonly by adding `@Valid` or `@Validated` in the appropriate place.",
    ],
  },
  "spring-test-slice": {
    prompt: "Why use a Spring Boot test slice instead of starting the entire application for every focused component test?",
    answers: [
      "`@WebMvcTest`, for example, loads MVC-focused components rather than the complete application graph.",
      "A slice loads a targeted subset of configuration for one layer, reducing noise and startup work.",
      "Its purpose is to start every real production dependency so the test environment exactly matches deployment.",
    ],
  },
  "spring-graceful-shutdown": {
    prompt: "During deployment, what should graceful shutdown do with new traffic and requests already in flight?",
    answers: [
      "It makes every interrupted request automatically safe to retry, even when the operation was not idempotent.",
      "It kills the process immediately without telling the embedded server. Fast termination is the graceful part.",
      "It waits forever for every request by default. No timeout or forced termination can ever end the process.",
    ],
  },
};


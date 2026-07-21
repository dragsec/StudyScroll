export default {
  "sql-left-join": {
    prompt: "I need every customer even when they have no orders. What happens to the unmatched customer rows in a `LEFT JOIN`?",
    answers: [
      "Every row from the left input survives the join, whether or not the right side finds a match.",
      "Careful with the later `WHERE`: filtering a right-side column there can remove the null-extended rows again.",
      "For an unmatched customer, the order columns come back as null while the customer columns remain.",
    ],
  },
  "sql-null-comparison": {
    prompt: "Why does `column = NULL` fail to find missing values, and what test should the query use instead?",
    answers: [
      "Null represents unknown or missing information, so ordinary equality does not treat it like a normal value.",
      "Use `IS NULL` to find it and `IS NOT NULL` to reject it. SQL gives null its own predicates.",
      "`= NULL` is the standard comparison. If that returns nothing, the column contains empty strings instead.",
    ],
  },
  "sql-count": {
    prompt: "A nullable column makes `COUNT(column)` smaller than `COUNT(*)`. Which rows is each expression counting?",
    answers: [
      "`COUNT(*)` counts result rows without asking whether a particular column is null.",
      "`COUNT(column)` converts nulls to zero and counts them, so nullability cannot change the result.",
      "The two counts are guaranteed identical. SQL engines normalize both expressions to the same operation.",
    ],
  },
  "sql-group-by": {
    prompt: "Before aggregate functions produce results, what groups does `GROUP BY` create, and does it promise output order?",
    answers: [
      "Grouping does not promise display order. Only an `ORDER BY` can request that presentation order.",
      "Each group normally contributes one aggregate result row unless additional grouping features change the shape.",
      "Rows with equal values for the grouping expressions are placed into the same group for aggregation.",
    ],
  },
  "sql-index-write-cost": {
    prompt: "An index sped up one query. Why can adding that index still make the overall workload slower?",
    answers: [
      "The optimizer can ignore the index when its cost model predicts a cheaper scan or another access path.",
      "Indexes consume no storage and add no work to inserts or updates. They are free read acceleration.",
      "Maintaining the index costs storage and write work, even if selected reads become much faster.",
    ],
  },
  "sql-transaction-atomicity": {
    prompt: "A transaction updates five rows and fails on the last one. What does atomicity promise about the first four?",
    answers: [
      "The transaction commits all its changes as one unit or rolls them all back as one unit.",
      "Atomicity prevents other transactions from running at the same time. Concurrency stops until commit.",
      "It also guarantees committed bytes survive every crash. Atomicity and durability are the same property.",
    ],
  },
  "sql-isolation": {
    prompt: "Do lower SQL isolation levels behave like serial execution, or can different read anomalies still appear?",
    answers: [
      "Serializable aims for outcomes consistent with some serial order, although implementations may achieve that differently.",
      "Exact guarantees and anomaly behavior can depend on the database's implementation of each named level.",
      "Every isolation level prevents every anomaly. The names only describe performance settings.",
    ],
  },
  "sql-window-function": {
    prompt: "How can a window function calculate across related rows without collapsing them the way `GROUP BY` does?",
    answers: [
      "Its partition defines which related rows participate in the calculation for the current row.",
      "The original rows remain in the result while the function computes over the chosen window.",
      "Window functions are valid only when the window has no `ORDER BY` clause. Ordering disables the feature.",
    ],
  },
  "sql-foreign-key": {
    prompt: "What integrity does a foreign key enforce, and which indexes or business rules does it not create for me?",
    answers: [
      "Referenced values must satisfy the relationship declared by the foreign-key constraint.",
      "The database automatically creates every index the referencing table could ever need.",
      "A valid foreign key proves the whole row satisfies every business rule, not merely the referential one.",
    ],
  },
  "sql-mvcc": {
    prompt: "Why would a database keep several versions of one logical row instead of overwriting the old value immediately?",
    answers: [
      "Old versions are permanent. An MVCC database can never reclaim them without breaking transaction history.",
      "Visibility rules choose which version belongs in each transaction's view of the database.",
      "Readers can keep a consistent snapshot while concurrent transactions create newer versions.",
    ],
  },
  "sql-upsert-race": {
    prompt: "Two workers both see that a row is missing and try to insert it. Why is native upsert safer than `SELECT` then `INSERT`?",
    answers: [
      "A unique constraint usually defines the conflict that the upsert handles.",
      "The database can resolve that conflict atomically inside its own concurrency rules instead of trusting a stale pre-check.",
      "The first `SELECT` permanently locks the fact that no row exists, so another worker cannot insert before you do.",
    ],
  },
  "sql-recursive-cte": {
    prompt: "Can a recursive CTE walk only a neat parent-child tree, or can it express broader iterative graph traversal too?",
    answers: [
      "Trees only. The moment two paths meet the same node, SQL recursion can no longer represent the traversal.",
      "A recursive CTE still finishes in one non-recursive query step. The word recursive refers only to the syntax.",
      "Cycle detection and termination are automatic. The database always knows when recursive results should stop expanding.",
    ],
  },
};


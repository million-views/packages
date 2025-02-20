# @m5nv/abac

**Attribute-Based Access Control Made Simple**\
_A lightweight, intuitive, and powerful library for fine-grained access
control._

---

## Overview

@m5nv/abac is an Attribute-Based Access Control (ABAC) library that lets you
define and enforce access policies using simple, composable condition functions.
With human-readable policy keys similar to OAuth scopes, this library minimizes
duplication and reduces the risk of mismatches between policy definitions and
permission checks.

Key features include:

- **Modular and Expressive Conditions:** Build reusable condition functions and
  combine them with logical operators (AND, OR, NOT) to define complex policies.
- **Flexible Policy Merging:** Duplicate policy keys are automatically merged
  into an OR-AND tree, ensuring that if any complete set of conditions passes,
  access is granted.
- **Fail-Closed Security:** A default fallback ensures that unexpected errors
  never grant access.
- **Debug-Friendly:** Built-in debugging support helps trace policy evaluations
  and assert failures during development.

---

## Installation

Install via npm:

```bash
npm install @m5nv/abac
```

---

## Getting Started

### 1. Define Your Primitive Conditions

Start by writing small, reusable condition functions that capture your business
rules. Each function receives a **subject** (e.g., the user) and a **context**
(e.g., resource data, session information).

```js
const authenticated = (sub, ctx) => !!ctx.session;
const owner = (sub, ctx) => ctx.resource && ctx.resource.ownerId === sub.id;
const admin = (sub, ctx) => sub.roles.includes("admin");
const visitor = (sub, ctx) => sub.kind === "visitor";
```

### 2. Compose Policies with Conditions

Combine your primitive conditions using logical combinators to build policies.
Policies are defined with keys that identify both the policy and its intended
action or resource.

```js
import { AND, OR } from "@m5nv/abac";

const policies = [
  { key: "view:account", conditions: [authenticated, OR(owner, admin)] },
  { key: "update:account", conditions: [authenticated, OR(owner, admin)] },
  { key: "upgrade:account", conditions: [authenticated, OR(owner, visitor)] },
];
```

### 3. Instantiate the ABAC Engine

Initialize the ABAC engine by passing your policies. Optionally, enable
debugging to log policy evaluation details and assertion failures.

```js
import abac from "@m5nv/abac";

const is_allowed = abac({ debug: true, policies });
```

### 4. Check Permissions

Use the PermissionChecker function returned by the ABAC engine to enforce
policies. Supply the policy key, the subject, and the context. Optionally,
include an assertion tuple for quick testing.

```js
const user = { id: "user1", roles: ["user"], kind: "user" };
const ctx = { session: { token: "abc123" }, resource: { ownerId: "user1" } };

const allowed = is_allowed("view:account", user, ctx, [
  true,
  "view account (self)",
]);

if (allowed) {
  console.log("Access granted!");
} else {
  console.log("Access denied!");
}
```

If an assertion fails, a detailed error is logged, enabling you to quickly
identify and fix policy misconfigurations. For a live demo showcasing @m5nv/abac
in action, check out our example on the [Svelte Playground][m5nv-abac-demo].

[m5nv-abac-demo]: https://svelte.dev/playground/fe9a7438f73e42a18231839034079208?version=5.19.9

---

## API Reference

### Core Concepts

- **Key:**\
  A critical element in the ABAC system, the key serves as the unique identifier
  for a policy. Typically formatted as "action:resource-name" (e.g.,
  "view:account"), the key is used at runtime to look up and enforce the
  corresponding policy. Its format should be well-documented and consistently
  used across all application components—ensuring that policy enforcement is
  reliable and unambiguous.

- **Subject:**\
  Represents the entity requesting access. It must contain an `id` and may
  include additional properties like `roles` or `kind`.

- **Context:**\
  Provides runtime information needed for access control, such as the resource
  instance being accessed (`ctx.resource`), session data, or any other pertinent
  parameters.

- **Policy:**\
  A contract consisting of a key and an array of conditions. Conditions within a
  single policy are combined using **AND**. When multiple policies share the
  same key, they are merged using **OR** to form an OR-AND tree.

- **Condition:**\
  A function that takes a subject and a context and returns a boolean value
  indicating whether access should be granted.

### Built-in Conditions

- **`TRUE`:**\
  Always returns `true`.

- **`FALSE`:**\
  Always returns `false`.

### Logical Combinators

- **`AND(...conds)`**\
  Returns a condition that is `true` if all provided conditions return `true`.

- **`OR(...conds)`**\
  Returns a condition that is `true` if at least one provided condition returns
  `true`.

- **`NOT(cond)`**\
  Returns a condition that negates the result of the given condition.

### Initializing the Engine

#### `abac(options)`

Initializes the ABAC engine with the following options:

- **`debug`**: Boolean or a custom debug interface (with `log`, `assert`, and
  `error` methods) for logging.
- **`policies`**: An array of policy objects, each with a `key` and an array of
  `conditions`.
- **`fallback`**: A fallback array of conditions used when no matching policy is
  found (defaults to `[FALSE]`).

Returns a **PermissionChecker** function that accepts:

- `key` (string): The policy key.
- `subject` (Subject): The subject requesting access.
- `context` (Context): Additional runtime information.
- `assert` (optional): A tuple for quick testing/validation (expected boolean
  result and a descriptive string).

The PermissionChecker also exposes:

- **`asserts`**: Count of failed assertions.
- **`merges`**: Number of policy merges performed (i.e., duplicate keys merged).

Example:

```js
const check = abac({ policies, debug: console });
const isAllowed = check("edit:document", subject, context);
```

---

## Advanced Usage

### Policy Merging

When multiple policies share the same key, their conditions are merged with the
**OR** combinator. In effect, if any complete set of conditions (evaluated using
**AND**) passes, the overall policy check succeeds. This design minimizes
combinatorial complexity and speeds up permission checks.

### Debugging and Assertions

Debugging can be enabled by passing `true` or a custom debug interface to the
`abac` function. This will log detailed messages during policy evaluation and
record assertion failures, making it easier to troubleshoot and validate your
policies during development.

---

## Contributing

We welcome contributions to enhance @m5nv/abac. Whether you have suggestions,
improvements, or bug fixes, please submit an issue or pull request on our GitHub
repository.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

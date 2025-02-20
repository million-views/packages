// @ts-check

/** FALSE condition always returns false.
 * @type {Condition}
 */
const FALSE = (_sub, _ctx) => false;

/** TRUE always returns true.
 * @type {Condition}
 */
const TRUE = (_sub, _ctx) => true;

/** AND retuns a function that yields true iff all `conds` eval to true
 * @type {Combinator}
 */
function AND(...conds) {
  return (sub, ctx) => conds.every((cond) => cond(sub, ctx));
}

/** OR retuns a function that yields true at least one of `conds` evals to true
 * @type {Combinator}
 */
function OR(...conds) {
  return (sub, ctx) => conds.some((cond) => cond(sub, ctx));
}

/** NOT returns a function that negates the result of the provided condition.
 * @param {Condition} cond - A condition function.
 * @returns {Condition}
 */
function NOT(cond) {
  return (sub, ctx) => !cond(sub, ctx);
}

/** Initialize the ABAC rules engine.
 * @type {Abac}
 */
function abac({
  debug = false,
  policies = [],
  fallback = [FALSE],
} = {}) {
  /** @type {DebugInterface} */
  let dbi;
  if (
    typeof debug === "object" && debug !== null &&
    typeof debug.log === "function" && typeof debug.assert === "function"
  ) {
    dbi = debug;
  } else {
    dbi = debug === true ? console : {
      log: () => undefined,
      assert: () => undefined,
      error: () => undefined,
    };
  }

  // Don't let the user trip themselves and us; we expect non-null conditions
  fallback = fallback ?? [FALSE];
  policies = policies ?? [];
  const fallback_policy = { key: "fallback", conditions: fallback };
  const merged_policies = [...policies, fallback_policy];
  const policy_map = new Map();
  let merges = 0;

  for (let i = 0, imax = merged_policies.length; i < imax; i++) {
    const p = merged_policies[i];
    const curr = AND(...p.conditions);
    if (policy_map.has(p.key)) {
      const prev = policy_map.get(p.key);
      // Create/update OR-AND tree
      policy_map.set(p.key, OR(prev, curr));
      merges++;
    } else {
      policy_map.set(p.key, curr);
    }
  }
  dbi.log(
    `abac: ${
      policy_map.size - 1
    } primary policies, merged ${merges} duplicate policies`,
  );

  let asserts = 0; //<- assertion count
  /** @type {PermissionChecker} */
  const checker = function (key, subject, context, assert = undefined) {
    const conditions = policy_map.get(key) || policy_map.get("fallback");
    let result = false; // default to fail-closed strategy
    try {
      result = conditions(subject, context);
    } catch (_e) {
      // don't let exceptions by pass access
      result = false;
      const e = /** @type {Error} */ (_e);
      dbi.error(`Check '${key}' policy, caught error: ${e.message}`);
    }

    if (assert && result !== assert[0]) {
      asserts++;
      const msg = `abac(${
        assert[1]
      }): {sid:${subject.id}, ${key}} => ${result}`;
      dbi.assert(false, msg);
    }
    return result;
  };
  Object.defineProperty(checker, "asserts", { get: () => asserts });
  Object.defineProperty(checker, "merges", { get: () => merges });
  return checker;
}

export default abac;
export { AND, FALSE, NOT, OR, TRUE };

////////////////////////////////////////////////////////////////////////////////
/**
 * The Subject interface represents minimal identity information needed to be
 * checked for access control.
 *
 * The following fields are expected to be present:
 * - id: a unique identifier for the subject.
 * - roles?: optional array of roles (e.g. "member", "admin", "moderator").
 * - kind?: optional string representing the subject's kind (e.g. "visitor", "user").
 *
 * @typedef {({
 *   id: string|null,
 *   roles?: string[],
 *   kind?: string,
 * } & { [prop: string]: any })} Subject
 */

/**
 * The Resource type can either be a string or an object with an 'id' property
 * and any other properties you might need.
 *
 * @typedef {string | { id: string, [prop: string]: any }} Resource
 */

/**
 * The Context interface provides additional runtime information for
 * for access control decisions, including resource instance to work
 * with. NOTE: the `key` in a {@link Policy} includes the resource-name,
 * whereas the instance of that resource is passed using the context.
 *
 * In addition to the resource instance, some commonly needed pieces of
 * runtime data are defined in context. Since it is an intersection type,
 * additional information can be included as needed by the condition variables
 * to make control decisions.
 *
 * @typedef {({
 *   resource?: Resource,
 *   session?: any,
 *   params?: { [key: string]: any },
 *   url?: URL,
 *   locals?: { [key: string]: any },
 * } & { [prop: string]: any })} Context
 */

/**
 * A Condition is a function that returns a boolean indicating whether access
 * condition is met. It accepts a {@link Subject} and a {@link Context}.
 *
 * @typedef {function(Subject, Context): boolean} Condition
 */

/**
 * A Combinator takes variadic list of conditions and returns the combined
 * value of evaluating each condition.
 *
 * @typedef {(...conds: Condition[]) => Condition} Combinator
 */

/**
 * A Policy is a contract evaluated at runtime for access control. It consists
 * of a key and an array of conditions. The key is typically a concatenation of
 * "action:resource-name", but this library treats it as an opaque string,
 * leaving the format definition to the user.
 *
 * Note that the key's format is a critical design element in your ABAC system.
 * Policies are looked up at runtime using the key, so it should be documented
 * and publicized similarly to an OAuth scope. All application components,
 * including integration and testing code, must share the same key definitions
 * to ensure consistent policy evaluation. Thus, defining the key format is a
 * crucial early decision when implementing Policy Enforcement Points (PEP) and
 * Policy Decision Points (PDP).
 *
 * Within a single Policy, conditions are evaluated using the {@link AND}
 * combinator – every condition must pass. If multiple policies share the same
 * key, they are merged using the {@link OR} combinator, resulting in an
 * OR-AND tree: the overall condition is an OR of several AND-combined policies.
 *
 * @typedef {({ key: string, conditions: Condition[] })} Policy
 */

/**
 * A DebugInterface is an object that provides logging methods.
 *
 * @typedef {Object} DebugInterface
 * @property {(...args: any[]) => void} log
 * @property {(...args: any[]) => void} assert
 * @property {(...args: any[]) => void} error
 */

/**
 * Options for initializing the ABAC engine.
 *
 * - debug?: Enables debugging output. Accepts a boolean or a DebugInterface.
 * - policies?: An array of Policy objects. Each policy's conditions are
 *   evaluated using AND, and if multiple policies share the same key, they are
 *   merged using OR (i.e. a policy is granted if any one complete set of
 *   ANDed conditions passes).
 * - fallback?: A fallback array of conditions to use when no matching policy
 *   is found. Defaults to [FALSE].
 *
 * The resulting merged policies form an OR-AND tree, ensuring that the
 * effective condition for a key is the OR of the ANDed conditions from each
 * individual policy.
 *
 * @typedef {({
 *   debug?: boolean|DebugInterface,
 *   policies?: Policy[],
 *   fallback?: Condition[]
 * })} Options
 * @property {Policy[]} [policies=[]] - The policies array
 * @property {Condition[]} [fallback=[FALSE]] - The fallback array
 */

/**
 * An optional Assert parameter for quick test/validation of policies:
 * - [0]: a boolean indicating the expected result.
 * - [1]: a descriptive string to be used when assertion fails.
 *
 * @typedef {[boolean, string]} Assert
 */

/**
 * A PermissionChecker is a function that accepts:
 *   - key: a string representing the policy key,
 *   - subject: a Subject,
 *   - context: an object containing additional data (e.g., resource data is
 *     available as ctx.resource),
 *   - assert?: an optional Assert parameter for testing/validation.
 *
 * It returns a boolean indicating whether access is to be granted.
 *
 * The PermissionChecker also exposes:
 *   - asserts: the total count of failed assertions,
 *   - merges: the number of policy merges performed (i.e. how many duplicate policy keys were merged).
 *
 * @typedef {(
 *   (key: string, subject: Subject, context?: Context|null, assert?: Assert) => boolean
 * ) & { asserts: number, merges: number }} PermissionChecker
 */

/**
 * The abac function accepts {@link Options} object, initializes the
 * ABAC engine and returns a PermissionChecker.
 *
 * During initialization, a lookup table (cache) is built where each policy
 * key maps to an effective condition function. Within a policy, conditions
 * are combined using AND, and if multiple policies share the same key, they are
 * merged using OR (forming an OR-AND tree). This design provides a fast lookup
 * for permission checks and minimizes combinatorial complexity.
 *
 * NOTE: The return value can be assigned to any appropriately named variable
 * that conveys the intent of checking permissions, e.g `has_permission`,
 * `is_allowed`, `can_access`, `check_permissions` or simply `check` are some
 * of the common names used.
 *
 * @typedef {function(Options=): PermissionChecker} Abac
 */

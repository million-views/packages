import { describe, expect, it } from "vitest";
import abac, { AND, FALSE, NOT, OR, TRUE } from "@m5nv/abac";

/* -------------------------------------------------------------------------- */
/* Example 1: Using TRUE and FALSE                                            */
/* -------------------------------------------------------------------------- */
describe("ABAC TRUE/FALSE usage", () => {
  it("should allow public info access and deny secret data access", () => {
    const policies = [
      { key: "GET:/public/info", conditions: [TRUE] }, // Always allow
      { key: "GET:/secret/data", conditions: [FALSE] }, // Always deny
    ];
    /** @type {import('@m5nv/abac').PermissionChecker} */
    const check_permission = abac({ debug: false, policies });
    expect(check_permission("GET:/public/info", {}, {})).toBe(true);
    expect(check_permission("GET:/secret/data", {}, {})).toBe(false);
    // No matching policy => fallback (default [FALSE]) denies access.
    expect(check_permission("delete:any-resource", {}, {})).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Example 2: Overriding the fallback policy                                  */
/* -------------------------------------------------------------------------- */
describe("ABAC Override Fallback", () => {
  it("should allow access when fallback is overridden with [TRUE]", () => {
    const check_permission = abac({ fallback: [TRUE] });
    // No matching policy => fallback ([TRUE]) allows access.
    expect(check_permission("read:any-resource", {}, {})).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Example 3: Using custom policies                                           */
/* -------------------------------------------------------------------------- */
describe("ABAC Custom Policies", () => {
  it("should enforce custom policies correctly", () => {
    // Define conditions.
    const authenticated = (sub, ctx) => !!(ctx && ctx.session);
    const owner = (sub, ctx) => ctx && ctx.owner_id === sub.id;
    const admin = (sub, ctx) => sub.roles.includes("admin");
    const superadmin = (sub, ctx) => sub.roles.includes("superadmin");
    const visitor = (sub, ctx) => sub.kind === "visitor";
    const valid_reset_token = (_sub, ctx) =>
      ctx && ctx.reset_token_valid === true;

    /** @type {import('@m5nv/abac').Policy[]} */
    const policies = [
      // Identity endpoints
      { key: "POST:/identity/register", conditions: [NOT(authenticated)] },
      { key: "POST:/identity/login", conditions: [TRUE] },
      { key: "POST:/identity/logout", conditions: [authenticated, owner] },
      { key: "GET:/identity/profile", conditions: [authenticated, owner] },
      { key: "POST:/identity/reset-password", conditions: [valid_reset_token] },
      // Account endpoints
      // "view" and "update" require authentication and either ownership or admin privileges.
      {
        key: "view:account",
        conditions: [authenticated, OR(owner, admin, superadmin)],
      },
      {
        key: "update:account",
        conditions: [authenticated, OR(owner, admin, superadmin)],
      },
      // "upgrade:account" allows a visitor (who is not authenticated) to upgrade,
      // if they are the owner and their kind is "visitor".
      {
        key: "upgrade:account",
        conditions: [OR(AND(owner, visitor), admin, superadmin)],
      },
    ];

    /** @type {import('@m5nv/abac').PermissionChecker} */
    const check_permission = abac({ debug: false, policies });

    // Define subjects.
    const user1 = { id: "user1", roles: ["user"], kind: "user" };
    const user2 = { id: "user2", roles: ["admin"], kind: "user" };
    // Visitor user: no session expected.
    const visitor_user = { id: "visitor1", roles: ["user"], kind: "visitor" };

    // For user1 and user2, use a context with a session.
    const ctx_with_session = {
      owner_id: "user1",
      session: { token: "abc123" },
    };
    // For a missing session.
    const ctx_no_session = { owner_id: "user1", session: null };

    // Test identity and account endpoints for regular users.
    expect(
      check_permission("GET:/identity/profile", user1, ctx_with_session),
    ).toBe(true);
    expect(check_permission("view:account", user1, ctx_with_session)).toBe(
      true,
    );
    expect(check_permission("view:account", user1, ctx_no_session)).toBe(false);
    expect(
      check_permission("view:account", user2, {
        owner_id: "user1",
        session: { token: "something" },
      }),
    ).toBe(true);

    // ---- Visitor tests ----
    // When the visitor is the owner, the upgrade should succeed.
    const ctx_visitor_owner = { owner_id: "visitor1", session: null };
    // When the visitor is not the owner, upgrade should fail.
    const ctx_visitor_not_owner = { owner_id: "someone_else", session: null };

    expect(
      check_permission("update:account", visitor_user, ctx_visitor_owner),
    ).toBe(false);
    expect(
      check_permission("upgrade:account", visitor_user, ctx_visitor_owner),
    ).toBe(true);
    expect(
      check_permission("upgrade:account", visitor_user, ctx_visitor_not_owner),
    ).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Example 4: Using Assert interface                                          */
/* -------------------------------------------------------------------------- */

describe("ABAC Assert interface usage", () => {
  it("should log assertion failures via the custom debug interface", () => {
    // Create a custom debug interface that records logs and asserts.
    const logs = [];
    const debug = {
      log: (...args) => logs.push({ level: "log", message: args.join(" ") }),
      assert: (condition, message) => {
        if (!condition) {
          logs.push({ level: "assert", message });
        }
      },
      error: (...args) =>
        logs.push({ level: "error", message: args.join(" ") }),
    };

    // Define a condition that checks for authentication.
    const authenticated = (sub, ctx) => !!(ctx && ctx.session);

    // Use this condition for the "view:account" policy.
    const policies = [
      { key: "view:account", conditions: [authenticated] },
    ];

    // Initialize the ABAC engine with the custom debug interface.
    const check = abac({ debug, policies });

    // Define a subject.
    const u1 = { id: "user1", roles: ["user"], kind: "user" };

    // Define two contexts:
    // - ctx_wis: With session (should pass the 'authenticated' check).
    // - ctx_wos: Without session (should fail the 'authenticated' check).
    const ctx_wis = { session: { token: "valid-token" } };
    const ctx_wos = { session: null };

    // Check permission with an assertion that expects success.
    check("view:account", u1, ctx_wis, [true, "view account (self, wis)"]);
    // Check permission with an assertion that expects success, even though it will fail.
    // This is done to trigger an assertion failure.
    check("view:account", u1, ctx_wos, [true, "view account (self, wos)"]);

    // Verify that one assertion failure was recorded.
    expect(check.asserts).toBe(1);

    // Verify that our debug interface logged the failed assertion message.
    expect(
      logs.some(
        (log) =>
          log.level === "assert" &&
          log.message.includes("view account (self, wos)"),
      ),
    ).toBe(true);
  });
});

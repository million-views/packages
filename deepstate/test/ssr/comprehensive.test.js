// test/ssr/deepstate-v2.test.js - Tests for DeepState v2 in SSR mode
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { batch, effect } from "@preact/signals-core";
import { computedProp, reify, shallow } from "@m5nv/deepstate/core";

// // Setup for SSR mode - run before each test
// beforeEach(() => {
//   // Force SSR mode by removing window (if it exists)
//   global.originalWindow = global.window;
//   delete global.window;

//   // Ensure SSR mode by setting the environment variable
//   process.env.DEEPSTATE_MODE = "SSR";
// });

// // Restore environment after each test
// afterEach(() => {
//   // Restore window if it existed
//   if (global.originalWindow) {
//     global.window = global.originalWindow;
//   }

//   // Reset environment variable
//   delete process.env.DEEPSTATE_MODE;
// });

describe("DeepState Core Functionality (SSR Mode)", () => {
  describe("Basic Reactivity", () => {
    it("creates reactive state with direct property access", () => {
      const store = reify({ count: 0 });
      expect(store.state.count).toBe(0);

      store.state.count = 1;
      expect(store.state.count).toBe(1);
    });

    it("supports nested objects with deep reactivity", () => {
      const store = reify({
        user: {
          profile: {
            name: "John",
            age: 30,
          },
        },
      });

      expect(store.state.user.profile.name).toBe("John");

      store.state.user.profile.name = "Jane";
      expect(store.state.user.profile.name).toBe("Jane");
    });

    it("supports arrays with reactive elements", () => {
      const store = reify({
        items: [{ id: 1, value: "one" }, { id: 2, value: "two" }],
      });

      expect(store.state.items[0].value).toBe("one");

      store.state.items[0].value = "first";
      expect(store.state.items[0].value).toBe("first");
    });
  });

  describe("Computed Properties", () => {
    it("supports inline computed properties using computedProp", () => {
      const store = reify({
        count: 0,
        doubleCount: computedProp(function (self) {
          return self.count * 2;
        }),
      });

      expect(store.state.doubleCount).toBe(0);

      store.state.count = 5;
      expect(store.state.doubleCount).toBe(10);
    });

    it("supports chained computed properties", () => {
      const store = reify({
        count: 2,
        double: computedProp(function (self) {
          return self.count * 2;
        }),
        quadruple: computedProp(function (self) {
          return self.double * 2;
        }),
      });

      expect(store.state.double).toBe(4);
      expect(store.state.quadruple).toBe(8);

      store.state.count = 3;
      expect(store.state.double).toBe(6);
      expect(store.state.quadruple).toBe(12);
    });

    it("supports cross-object references via root parameter", () => {
      const store = reify({
        products: [
          { id: 1, price: 10 },
          { id: 2, price: 20 },
        ],
        cart: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
        totalPrice: computedProp(function (self, root) {
          return self.cart.reduce((total, item) => {
            const product = root.products.find((p) => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
          }, 0);
        }),
      });

      expect(store.state.totalPrice).toBe(40); // (10*2 + 20*1)

      store.state.products[0].price = 15;
      expect(store.state.totalPrice).toBe(50); // (15*2 + 20*1)

      store.state.cart[0].quantity = 3;
      expect(store.state.totalPrice).toBe(65); // (15*3 + 20*1)
    });

    it("re-evaluates computed properties on each access in SSR mode", () => {
      const computeSpy = vi.fn((self) => self.count * 2);

      const store = reify({
        count: 0,
        doubleCount: computedProp(computeSpy),
      });

      // Access computed property once
      expect(store.state.doubleCount).toBe(0);
      expect(computeSpy).toHaveBeenCalledTimes(1);

      // Access again without changing dependencies - should recompute in SSR mode
      expect(store.state.doubleCount).toBe(0);
      expect(computeSpy).toHaveBeenCalledTimes(2);

      // Change dependency and access
      store.state.count = 5;
      expect(store.state.doubleCount).toBe(10);
      expect(computeSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("Shallow Objects", () => {
    it("shallow objects do not prevent computed updates in SSR mode", () => {
      const staticObj = { id: 1, nested: { value: 42 } };
      const store = reify({
        data: shallow(staticObj),
        nestedValue: computedProp((s) => s.data.nested.value),
      });

      expect(store.state.data).toBe(staticObj);
      expect(store.state.nestedValue).toBe(42);

      // In SSR mode, computed properties re-run on every access, so changing the shallow object
      // causes the computed property to update on next access
      store.state.data.nested.value = 100;
      expect(store.state.nestedValue).toBe(100);
    });
  });

  describe("Array Operations", () => {
    it("handles array mutations properly", () => {
      const store = reify({
        items: [1, 2, 3],
      });

      // Push
      store.state.items.push(4);
      expect(store.state.items).toEqual([1, 2, 3, 4]);

      // Pop
      const popped = store.state.items.pop();
      expect(popped).toBe(4);
      expect(store.state.items).toEqual([1, 2, 3]);

      // Splice
      const spliced = store.state.items.splice(1, 1, 22, 33);
      expect(spliced).toEqual([2]);
      expect(store.state.items).toEqual([1, 22, 33, 3]);
    });

    it("prevents whole array replacement for deep arrays", () => {
      const store = reify({
        items: [1, 2, 3],
      });

      expect(() => {
        store.state.items = [4, 5, 6];
      }).toThrow(/Whole array replacement is disallowed for deep arrays/);
    });

    it("allows whole array replacement for deep arrays via the $ escape hatch", () => {
      const store = reify({ todos: [1, 2, 3] });

      expect(() => {
        // In SSR mode, the implementation should allow direct assignment to $todos
        // since it's unwrapped to the primitive value
        store.state.$todos = [...store.state.todos, 4];
      }).not.toThrow();

      expect(store.state.todos).toEqual([1, 2, 3, 4]);
    });

    it("allows whole array replacement for shallow arrays", () => {
      const store = reify({
        items: shallow([1, 2, 3]),
      });

      store.state.items = [4, 5, 6];
      expect(store.state.items).toEqual([4, 5, 6]);
    });
  });

  describe("Edge Cases", () => {
    it("rejects direct assignment of $ properties with value objects", () => {
      const store = reify({ count: 0 });

      expect(() => {
        store.state.$count = { value: 99 };
      }).toThrow(
        "Cannot directly set '$count'. Use the signal's 'value' property.",
      );
    });

    it("enforces strict mode by default", () => {
      const store = reify({ initial: true });

      // Attempt to add new property should throw
      expect(() => {
        store.state.dynamic = "should fail";
      }).toThrow(/Cannot add new property/);
    });

    it("handles dynamic property addition in permissive mode", () => {
      const store = reify({ initial: true }, { permissive: true });

      // Add new property
      store.state.dynamic = "added later";
      expect(store.state.dynamic).toBe("added later");
    });
  });

  describe("Serialization", () => {
    it("properly serializes state to JSON", () => {
      const store = reify({
        count: 0,
        user: { name: "John" },
        computed: computedProp(function (self) {
          return self.count * 2;
        }),
      });

      const json = JSON.stringify(store.state);
      const parsed = JSON.parse(json);

      // Should include regular properties
      expect(parsed.count).toBe(0);
      expect(parsed.user.name).toBe("John");

      // Should not include computed properties
      expect(parsed.computed).toBeUndefined();
    });
  });

  describe("Escape Hatch", () => {
    it("provides primitive values via escape hatch in SSR mode", () => {
      const store = reify({ count: 0 });

      // In SSR mode, $count returns the primitive value directly
      expect(typeof store.state.$count).toBe("number");
      expect(store.state.$count).toBe(0);

      // Update via direct assignment in SSR mode
      store.state.$count = 5;
      expect(store.state.count).toBe(5);
    });

    it("provides computed values as primitives in SSR mode", () => {
      const store = reify({
        count: 0,
        double: computedProp(function (self) {
          return self.count * 2;
        }),
      });

      // In SSR mode, $double returns the computed primitive value
      expect(typeof store.state.$double).toBe("number");
      expect(store.state.$double).toBe(0);

      // Update dependency
      store.state.count = 5;
      expect(store.state.$double).toBe(10);
    });
  });

  describe("SSR-Specific Features", () => {
    it("unwraps signals for direct access in SSR", () => {
      const store = reify({ count: 42 });

      // In SSR mode, signal values are directly returned without .value
      expect(typeof store.state.$count).not.toBe("object");
      expect(store.state.$count).toBe(42);
    });

    it("stringifies correctly in SSR", () => {
      const store = reify({
        count: 42,
        message: "Hello",
        double: computedProp(function (self) {
          return self.count * 2;
        }),
      });

      // In SSR, signals should stringify to their primitive values
      const jsonString = JSON.stringify({
        value: store.state.count,
        computed: store.state.double,
      });
      const parsed = JSON.parse(jsonString);

      expect(parsed.value).toBe(42);
      expect(parsed.computed).toBe(84);
    });

    it("renders in template literals correctly", () => {
      const store = reify({
        name: "John",
        greeting: computedProp(function (self) {
          return `Hello, ${self.name}!`;
        }),
      });

      // In SSR, signals should stringify correctly in template literals
      const renderedString = `<div>${store.state.greeting}</div>`;

      expect(renderedString).toBe("<div>Hello, John!</div>");
    });

    it("supports primitive coercion for computed properties", () => {
      const store = reify({
        count: 5,
        message: computedProp(function (self) {
          return `Count: ${self.count}`;
        }),
      }, { permissive: true });

      // Test string concatenation (implicit toString)
      const withPrefix = "Message: " + store.state.message;
      expect(withPrefix).toBe("Message: Count: 5");

      // Test numeric coercion
      const numComputed = computedProp((self) => self.count * 2);
      store.state.numericValue = numComputed;

      const result = store.state.numericValue + 10;
      expect(result).toBe(20); // 5*2 + 10
    });
  });
});

// Complex use case tests adapted for SSR mode
describe("DeepState Complex Use Cases (SSR Mode)", () => {
  describe("Form Validation Example", () => {
    function createFormStore() {
      return reify({
        form: {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        },
        touched: {
          username: false,
          email: false,
          password: false,
          confirmPassword: false,
        },
        validation: computedProp(function (self) {
          return {
            username: self.form.username.length < 3
              ? "Username must be at least 3 characters"
              : "",
            email: !self.form.email.includes("@")
              ? "Invalid email address"
              : "",
            password: self.form.password.length < 8
              ? "Password must be at least 8 characters"
              : "",
            confirmPassword: self.form.password !== self.form.confirmPassword
              ? "Passwords do not match"
              : "",
          };
        }),
        isValid: computedProp(function (self, root) {
          // Check if all validation messages are empty
          return Object.values(root.validation).every((msg) => msg === "");
        }),
        errors: computedProp(function (self, root) {
          // Only return errors for touched fields
          const result = {};
          Object.keys(root.validation).forEach((field) => {
            if (self.touched[field] && root.validation[field]) {
              result[field] = root.validation[field];
            }
          });
          return result;
        }),
      }).attach({
        updateField(state, field, value) {
          if (field in state.form) {
            state.form[field] = value;
            state.touched[field] = true;
          }
        },
        resetForm(state) {
          // Reset form fields
          Object.keys(state.form).forEach((key) => {
            state.form[key] = "";
          });
          // Reset touched state
          Object.keys(state.touched).forEach((key) => {
            state.touched[key] = false;
          });
        },
        submitForm(state) {
          // Mark all fields as touched
          Object.keys(state.touched).forEach((key) => {
            state.touched[key] = true;
          });
          // Only proceed if valid
          return state.isValid;
        },
      });
    }

    it("validates form correctly in SSR mode", () => {
      const store = createFormStore();

      // Update form fields
      store.actions.updateField("username", "john");
      store.actions.updateField("email", "john@example.com");
      store.actions.updateField("password", "password123");
      store.actions.updateField("confirmPassword", "password123");

      // Verify validation works in SSR
      expect(store.state.isValid).toBe(true);
      expect(Object.keys(store.state.errors).length).toBe(0);

      // Break the validation
      store.actions.updateField("password", "short");

      // Should show validation errors for touched fields
      expect(store.state.isValid).toBe(false);
      expect(store.state.errors.password).toBeTruthy();
    });

    it("renders form state correctly in HTML templates", () => {
      const store = createFormStore();

      store.actions.updateField("username", "jo"); // too short

      // In SSR mode, error messages should render correctly in HTML
      const errorTemplate = `<div class="error">${
        store.state.errors.username || ""
      }</div>`;
      expect(errorTemplate).toBe(
        '<div class="error">Username must be at least 3 characters</div>',
      );

      // Fix the validation error
      store.actions.updateField("username", "john");

      // Error message should be empty now
      const updatedTemplate = `<div class="error">${
        store.state.errors.username || ""
      }</div>`;
      expect(updatedTemplate).toBe('<div class="error"></div>');
    });
  });

  describe("Data Rendering Example", () => {
    it("handles server-side rendering of derived data", () => {
      const store = reify({
        users: [
          { id: 1, name: "John", role: "admin" },
          { id: 2, name: "Jane", role: "user" },
          { id: 3, name: "Bob", role: "user" },
        ],
        adminCount: computedProp(function (self) {
          return self.users.filter((u) => u.role === "admin").length;
        }),
        userCount: computedProp(function (self) {
          return self.users.filter((u) => u.role === "user").length;
        }),
        greeting: computedProp(function (self) {
          return `Hello, there are ${self.adminCount} admins and ${self.userCount} users.`;
        }),
      });

      // Simulate rendering a server component that uses these values
      const template = `
        <div class="stats">
          <p>${store.state.greeting}</p>
          <ul>
            ${
        store.state.users.map((user) => `<li>${user.name} (${user.role})</li>`)
          .join("")
      }
          </ul>
        </div>
      `;

      // Values should be correctly interpolated into the template
      expect(template).toContain("Hello, there are 1 admins and 2 users.");
      expect(template).toContain("<li>John (admin)</li>");

      // Update data
      store.state.users.push({ id: 4, name: "Alice", role: "admin" });

      // Re-render (simulating re-render during SSR build)
      const updatedTemplate = `
        <div class="stats">
          <p>${store.state.greeting}</p>
          <ul>
            ${
        store.state.users.map((user) => `<li>${user.name} (${user.role})</li>`)
          .join("")
      }
          </ul>
        </div>
      `;

      // Should have updated values
      expect(updatedTemplate).toContain(
        "Hello, there are 2 admins and 2 users.",
      );
      expect(updatedTemplate).toContain("<li>Alice (admin)</li>");
    });
  });
});

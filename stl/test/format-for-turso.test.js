import { describe, expect, it } from "vitest";
import stl from "@m5nv/stl";

describe("STL with Turso driver", () => {
  const sql = stl({ debug: false, format: "turso" });

  it("formats basic queries correctly", () => {
    const query = sql`SELECT * FROM users WHERE id = ${1}`;
    expect(query).toEqual({
      sql: "SELECT * FROM users WHERE id = $1",
      args: { $1: 1 },
    });
  });

  it("should interpolate values correctly", () => {
    const var1 = 123, var2 = "abc";
    const query = sql`
      SELECT * FROM x WHERE name = ${var2} AND id = ${var1}
    `;

    expect(query).toEqual(
      {
        sql: `
      SELECT * FROM x WHERE name = $1 AND id = $2
    `, //<- formatting is important for the test to pass
        args: { $1: "abc", $2: 123 },
      },
    );
  });

  it("handles multiple parameters", () => {
    const name = "Alice";
    const age = 30;
    const query = sql`
      SELECT * FROM users 
      WHERE name = ${name} 
      AND age > ${age}
    `;
    expect(query).toEqual({
      sql: expect.stringMatching(
        /SELECT \* FROM users\s+WHERE name = \$1\s+AND age > \$2/,
      ),
      args: { $1: "Alice", $2: 30 },
    });
  });

  it("works with dynamic column selection", () => {
    const columns = ["name", "age"];
    const query = sql`SELECT ${sql(columns)} FROM users`;
    expect(query).toEqual({
      sql: 'SELECT "name", "age" FROM users',
      args: {},
    });
  });

  it("handles dynamic inserts", () => {
    const user = {
      name: "Bob",
      age: 25,
      email: "bob@example.com",
    };
    const query = sql`INSERT INTO users ${sql(user)}`;
    expect(query).toEqual({
      sql: 'INSERT INTO users ("name", "age", "email") values ($1, $2, $3)',
      args: { $1: "Bob", $2: 25, $3: "bob@example.com" },
    });
  });

  it("supports bulk inserts", () => {
    const users = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];
    const query = sql`INSERT INTO users ${sql(users)}`;
    expect(query).toEqual({
      sql: 'INSERT INTO users ("name", "age") values ($1, $2),($3, $4)',
      args: { $1: "Alice", $2: 30, $3: "Bob", $4: 25 },
    });
  });

  it("works with dynamic updates", () => {
    const updates = {
      name: "Updated Name",
      age: 31,
    };
    const query = sql`UPDATE users SET ${sql(updates)} WHERE id = ${1}`;
    expect(query).toEqual({
      sql: 'UPDATE users SET "name"=$1, "age"=$2 WHERE id = $3',
      args: { $1: "Updated Name", $2: 31, $3: 1 },
    });
  });

  it("handles nested queries", () => {
    const minAge = 25;
    const status = "active";
    const subquery = sql`SELECT id FROM roles WHERE name = ${status}`;
    const query = sql`
      SELECT * FROM users 
      WHERE age > ${minAge}
      AND role_id IN (${subquery})
    `;
    expect(query).toEqual({
      sql: expect.stringMatching(
        /SELECT \* FROM users\s+WHERE age > \$1\s+AND role_id IN \(SELECT id FROM roles WHERE name = \$2\)/,
      ),
      args: { $1: 25, $2: "active" },
    });
  });

  it("works with unsafe queries", () => {
    const query = sql.unsafe("SELECT * FROM users WHERE id = ?", [1]);
    // NOTE: when query is unsafe, named args is not supported; all
    // parameters (?) are assumed to be positional and returned as an
    // an array instead of named args
    expect(query).toEqual({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [1],
    });
  });

  it("handles conditional query building", () => {
    const name = "Alice";
    const age = null;
    const query = sql`
      SELECT * FROM users
      WHERE name = ${name}
      ${age ? sql`AND age = ${age}` : sql``}
    `;
    expect(query).toEqual({
      sql: expect.stringMatching(/SELECT \* FROM users\s+WHERE name = \$1/),
      args: { $1: "Alice" },
    });
  });

  it('supports "IN" clause with arrays', () => {
    const ids = [1, 2, 3];
    const query = sql`SELECT * FROM users WHERE id IN ${sql(ids)}`;
    expect(query).toEqual({
      sql: "SELECT * FROM users WHERE id IN ($1, $2, $3)",
      args: { $1: 1, $2: 2, $3: 3 },
    });
  });

  it('supports "IN" clause with 1 item in array', () => {
    const ids = [1];
    const query = sql`SELECT * FROM users WHERE id IN ${sql(ids)}`;
    expect(query).toEqual({
      sql: "SELECT * FROM users WHERE id IN ($1)",
      args: { $1: 1 },
    });
  });

  it("handles array of subqueries", () => {
    const activeStatus = "active";
    const subquery1 = sql`SELECT id FROM roles WHERE status = ${activeStatus}`;
    const subquery2 = sql`SELECT id FROM permissions WHERE level > ${3}`;
    const query = sql`
      SELECT * FROM users
      WHERE id IN (${subquery1}, ${subquery2})
    `;
    expect(query).toEqual({
      sql: expect.stringMatching(
        /SELECT \* FROM users\s+WHERE id IN \(SELECT id FROM roles WHERE status = \$1,\s+SELECT id FROM permissions WHERE level > \$2\)/,
      ),
      args: { $1: "active", $2: 3 },
    });
  });

  it("handles UNION of multiple subqueries for dynamic filtering", () => {
    const activeStatus = "active";
    const minAge = 30;
    const recentPurchaseDate = "2023-01-01";

    // Each subquery here represents a distinct condition and will be combined using UNION
    const subquery1 =
      sql`SELECT user_id FROM users WHERE status = ${activeStatus}`;
    const subquery2 = sql`SELECT user_id FROM users WHERE age > ${minAge}`;
    const subquery3 =
      sql`SELECT user_id FROM purchases WHERE purchase_date >= ${recentPurchaseDate}`;

    // The main query will filter users whose IDs are in any of these subqueries
    const query = sql`
      SELECT * FROM users
      WHERE id IN (${subquery1}, ${subquery2}, ${subquery3})
    `;

    expect(query).toEqual({
      sql: expect.stringMatching(
        /SELECT \* FROM users\s+WHERE id IN \(SELECT user_id FROM users WHERE status = \$1,\s+SELECT user_id FROM users WHERE age > \$2,\s+SELECT user_id FROM purchases WHERE purchase_date >= \$3\)/,
      ),
      args: { $1: activeStatus, $2: minAge, $3: recentPurchaseDate },
    });
  });

  it("handles dynamic WHERE clause conditions with AND", () => {
    const activeStatus = "active";
    const minAge = 30;
    const recentPurchaseDate = "2023-01-01";

    // Each condition is a standalone fragment that will be combined with "AND"
    const condition1 = sql`status = ${activeStatus}`;
    const condition2 = sql`AND age > ${minAge}`;
    const condition3 = sql`AND purchase_date >= ${recentPurchaseDate}`;

    // The main query combines conditions dynamically
    const query = sql`
      SELECT * FROM users
      WHERE ${[condition1, condition2, condition3]}
    `;
    // console.log('fooooo', query.sql, query.args);
    expect(query).toEqual({
      sql: expect.stringMatching(
        /SELECT \* FROM users\s+WHERE\s+status = \$1 AND age > \$2 AND purchase_date >= \$3/,
      ),
      args: { $1: activeStatus, $2: minAge, $3: recentPurchaseDate },
    });
  });

  describe("error cases", () => {
    it("throws on undefined values", () => {
      const query = sql`SELECT * FROM users WHERE id = ${undefined}`;
      /// query keys have to be accessed to trigger an error
      expect(() => {
        query.sql;
      }).toThrow(/undefined values are not allowed/);
    });

    it("throws on too many parameters", () => {
      const manyParams = Array(65535).fill(1);
      const query = sql`SELECT * FROM users WHERE id IN ${sql(manyParams)}`;
      /// query keys have to be accessed to trigger an error

      expect(() => {
        query.sql;
      }).toThrow(/max number of parameters/);
    });
  });
});

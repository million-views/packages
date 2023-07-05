import { assert, expect, test, describe, it } from "vitest";
import stl from "@m5nv/stl";

// helper
const strip_ws = (str) => str.replace(/\s+/g, " ").trim();

describe("sql - basic happy path", () => {
  const sql = stl();

  const validCases = [
    {
      input: sql`
        SELECT * FROM users WHERE id = ${123}
      `,
      output: {
        string: "SELECT * FROM users WHERE id = $1",
        parameters: [123],
      },
    },
    {
      input: sql`
        SELECT * FROM users WHERE id = ${123} AND name = ${"John"}
      `,
      output: {
        string: "SELECT * FROM users WHERE id = $1 AND name = $2",
        parameters: [123, "John"],
      },
    },
    {
      input: sql`
        SELECT * FROM users WHERE name = ${"John; DROP TABLE users;--"}
      `,
      output: {
        string: "SELECT * FROM users WHERE name = $1",
        parameters: ["John; DROP TABLE users;--"],
      },
    },
    {
      input: sql`
        SELECT * FROM users WHERE name = ${"John AND 1=1"}
      `,
      output: {
        string: "SELECT * FROM users WHERE name = $1",
        parameters: ["John AND 1=1"],
      },
    },
  ];

  test.each(validCases)(
    "should return a query and params",
    ({ input, output }) => {
      expect({
        string: strip_ws(input.string), parameters: input.parameters
      }).toEqual(output);
    }
  );
});

describe("sql - basic SQL interpolation", () => {
  const sql = stl({debug: false});

  it("should interpolate values correctly", () => {
    const var1 = 123, var2 = "abc";
    const query = sql`
      SELECT * FROM x WHERE name = ${var2} AND id = ${var1}
    `;
    expect(strip_ws(query.string)).to.be.equal(
      "SELECT * FROM x WHERE name = $1 AND id = $2"
    );
    expect(query.parameters).to.have.ordered.members(["abc", 123]);
  });

  it("should interpolate partials correctly", () => {
    const var1 = 123, var2 = "abc";
    const condition1 = sql`name = ${var2}`;
    const condition2 = sql`id = ${var1}`;
    const where_clause = sql`${condition1} AND ${condition2}`;
    const query = sql`
      SELECT * FROM users WHERE ${where_clause}
    `;
    expect(strip_ws(query.string)).to.be.equal(
      "SELECT * FROM users WHERE name = $1 AND id = $2"
    );
    expect(query.parameters).to.have.ordered.members(["abc", 123]);
  });
});

describe("sql - IN clause", () => {
  const sql = stl({debug: false});

  it("should handle IN values correctly", () => {
    const data = [3, "abc", 9];
    const q = sql`SELECT * FROM b WHERE col1 in ${sql(data)}`;
    expect(q.string).to.equal("SELECT * FROM b WHERE col1 in ($1, $2, $3)");
    expect(q.parameters).to.have.ordered.members([3, "abc", 9]);
  });

  it("should handle empty array for IN values correctly", () => {
    const q =  sql`SELECT * FROM b WHERE col1 in ${sql([])}`;
    expect(q.string).to.equal("SELECT * FROM b WHERE col1 in (null)");
    expect(q.parameters).to.have.ordered.members([]);
  });
});

describe("stl - inserts", () => {
  const sql = stl({debug: false});

  it("can handle multiple row inserts", () => {
    const users = [
      { age: 50, name: "Andrew" },
      { age: 51, name: "Carol" },
      { age: 52, name: "Bob" },
    ];
    const query = sql`
      insert into users ${sql(users, "age", "name")}
    `;
    expect(strip_ws(query.string)).toEqual(
      'insert into users ("age", "name") values ($1, $2),($3, $4),($5, $6)'
    );
    expect(query.parameters).to.have.ordered.members([
      50, 'Andrew', 51, 'Carol', 52, 'Bob'
    ]);
  });
});

describe('sql - erroneous function invocation', () => {
  // TODO: more intentionally incorrect usage tests
  const likes = 100;

  it('reject untagged identifier or string literal', () => {
    const sql = stl({debug: false});
    let error;
    try {
      // access to trigger error
      sql(`SELECT * FROM posts WHERE likes > ${likes}`).string;
    } catch(e) {
      error = e.cause.code;
    }
    expect(error).toEqual("NOT_TAGGED_CALL");
  });

  it('reject untagged use with arguments', () => {
    const sql = stl({debug: false});
    let error;
    try {
      // access to trigger error
      sql(`SELECT * FROM posts WHERE likes > ${likes}`, 123, 435).string;
    } catch(e) {
      error = e.cause.code;
    }
    expect(error).toEqual("NOT_TAGGED_CALL");
  });

  it('reject empty argument', () => {
    const sql = stl({debug: false});
    let error;
    try {
      sql();
    } catch(e) {
      error = e.cause.code;
    }
    expect(error).toEqual("UNDEFINED_VALUE");
  });

  it('reject empty argument in expression', () => {
    const sql = stl({debug: false});
    let error;
    try {
      sql`select ${sql()}`;
    } catch(e) {
      error = e.cause.code;
    }
    expect(error).toEqual("UNDEFINED_VALUE");
  });
});

describe('sql - subquery', () => {
  it('handles subquery properly', () => {
    const sql = stl({debug: false});
    const query = sql`
      insert into users (age)
        select age from users
        where age in ${sql([68, 75, 23])}
    `;
    expect(strip_ws(query.string)).toEqual(
      'insert into users (age) select age from users where age in ($1, $2, $3)'
    );
    expect(query.parameters).to.have.ordered.members([68, 75, 23]);
  });

  it('handles CTE subquery properly', () => {
    const sql = stl({debug: false});
    const query = sql`
      with insertables as (
        select age from users
        where age in ${sql([68, 75, 23])}
      )
      insert into users (age)
      select * from insertables
    `;
    expect(strip_ws(query.string)).toEqual(
      strip_ws(`
        with insertables as ( 
          select age from users where age in ($1, $2, $3) 
        ) insert into users (age) select * from insertables
      `)
    );
    expect(query.parameters).to.have.ordered.members([68, 75, 23]);
  });

  it('handles updates properly', () => {
    const sql = stl({debug: false});
    let data = [
      { id: 'foo', selected: true },
      { id: 'bar', selected: false },
    ];

    // transform array of objects to array of arrays
    // see https://github.com/porsager/postgres/issues/456
    data = data.map((d) => [d.id, d.selected]);

    const query = sql`
      UPDATE test_table as ca
      SET is_selected = c.is_selected
      FROM (VALUES ${sql(data)}) AS c
      WHERE c.id = ca.id
      RETURNING *
    `;
    expect(strip_ws(query.string)).toEqual(
      strip_ws(`
        UPDATE test_table as ca 
        SET is_selected = c.is_selected 
        FROM (VALUES ($1, $2),($3, $4)) AS c 
        WHERE c.id = ca.id RETURNING *
      `)
    );
    expect(query.parameters).to.have.ordered.members([
      'foo', true, 'bar', false
    ]);
  });
});
import { expect, test, describe, it } from "vitest";
import stl from "@m5nv/stl";

// helper
const strip_ws = (str) => str.replace(/\s+/g, " ").trim();

describe("happy path", () => {
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

describe("unsafe", () => {
  test("raw unsafe queries", async () => {
    let sql = stl({ debug: false });
    const iGotPwned = "'Alice' AND 1=1"; // say good bye to your data!
    const query = sql.unsafe(`
      SELECT * FROM users WHERE name = ${iGotPwned}
    `);

    // const query = sql`${sql.unsafe("friend_created")}`;
    expect(strip_ws(query.string)).toEqual(
      "SELECT * FROM users WHERE name = 'Alice' AND 1=1"
    );
    expect(query.parameters).to.have.ordered.members([]);
  });

  test("once unsafe always unsafe", async () => {
    let sql = stl({ debug: false });
    const iGotPwned = "'Alice' AND 1=1"; // say good bye to your data!
    const query = sql`
      SELECT * FROM users WHERE name = ${sql.unsafe(iGotPwned)}
    `;

    expect(strip_ws(query.string)).toEqual(
      "SELECT * FROM users WHERE name = \'Alice\' AND 1=1"
    );
    expect(query.parameters).to.have.ordered.members([]);
  });

  test("nonsensical use of unsafe", async () => {
    let sql = stl({ debug: false });

    let query = sql.unsafe("truly fubared - don't do this");
    expect(strip_ws(query.string)).toEqual(
      "truly fubared - don\'t do this"
    );
    expect(query.parameters).to.have.ordered.members([]);

    query = sql`
      ${sql('or "this" for that matter')},
      ${sql("or.that")}
    `;
    expect(strip_ws(query.string)).toEqual(
      '"or ""this"" for that matter", "or"."that"'
    );
    expect(query.parameters).to.have.ordered.members([]);
  });


  test("valid use case for unsafe", async () => {
    let sql = stl({ debug: false });

    const triggerName = "friend_created";
    const triggerFnName = "on_friend_created";
    const eventType = "insert";
    const schema_name = "app";
    const table_name = "friends";

    let query = sql`
      create or replace trigger ${sql(triggerName)}
      after ${sql.unsafe(eventType)} 
        on ${sql.unsafe(`${schema_name}.${table_name}`)}
      for each row
      execute function ${sql(triggerFnName)}()
    `;
    expect(strip_ws(query.string)).toEqual(
      strip_ws(
        `create or replace trigger "friend_created" 
         after insert on app.friends 
         for each row
         execute function "on_friend_created"()
        `
      )
    );
    expect(query.parameters).to.have.ordered.members([]);


    const password = 'fubar';
    query = sql`
      create role friend_service 
      with login password ${sql.unsafe(`'${password}'`)}
    `;
    expect(strip_ws(query.string)).toEqual(
      "create role friend_service with login password \'fubar\'"
    );
    expect(query.parameters).to.have.ordered.members([]);
  });
});

describe("basic SQL interpolation", () => {
  const sql = stl({ debug: false });

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

describe("identifiers and functions", () => {
  test("invoke as a function to create identifiers", async () => {
    let sql = stl({ debug: false });
    let query = sql`
      SELECT * FROM ${sql("table_name")}
    `;

    expect(strip_ws(query.string)).toEqual('SELECT * FROM "table_name"');
    expect(query.parameters).to.have.ordered.members([]);

    query = sql`
      select ${sql(["a", "b", "c"])} as x
    `;
    expect(strip_ws(query.string)).toEqual('select "a", "b", "c" as x');
    expect(query.parameters).to.have.ordered.members([]);
  });

  test("sql functions", async () => {
    let sql = stl({ debug: false });

    let date = null;
    let query = sql`
      update users set updated_at = ${date || sql`now()`}
    `;
    expect(strip_ws(query.string)).toEqual("update users set updated_at = now()");
    expect(query.parameters).to.have.ordered.members([]);

    date = Date.now();
    query = sql`
      update users set updated_at = ${date || sql`now()`}
    `;
    expect(strip_ws(query.string)).toEqual("update users set updated_at = $1");
    expect(query.parameters).to.have.ordered.members([date]);
  });
});

describe("values in `IN clause` and elsewhere", () => {
  const sql = stl({ debug: false });

  test("multiple `in` values", () => {
    const data = [3, "abc", 9];
    const q = sql`SELECT * FROM b WHERE col1 in ${sql(data)}`;
    expect(q.string).to.equal("SELECT * FROM b WHERE col1 in ($1, $2, $3)");
    expect(q.parameters).to.have.ordered.members([3, "abc", 9]);
  });

  test("one `in` value", () => {
    const data = ["abc"];
    const q = sql`SELECT * FROM b WHERE col1 in ${sql(data)}`;
    // console.log(q.string);
    expect(q.string).to.equal("SELECT * FROM b WHERE col1 in ($1)");
    expect(q.parameters).to.have.ordered.members(["abc"]);
  });

  test("empty `in` values", () => {
    const q = sql`SELECT * FROM b WHERE col1 in ${sql([])}`;
    expect(q.string).to.equal("SELECT * FROM b WHERE col1 in (null)");
    expect(q.parameters).to.have.ordered.members([]);
  });

  test("`in` values and additional parameters", async () => {
    let sql = stl({ debug: false });
    let query = sql`
      select
        *
      from users
      where age in ${sql([68, 75, 23])}
      and age != ${23}
    `;

    expect(strip_ws(query.string)).toEqual(
      "select * from users where age in ($1, $2, $3) and age != $4"
    );
    expect(query.parameters).to.have.ordered.members([68, 75, 23, 23]);
  });

  test("values in a CTE", async () => {
    // OR
    // TODO: what does this do? and is it supported in sqlite3?
    // See: https://stackoverflow.com/questions/43913457/how-do-i-name-columns-in-a-values-clause
    // ^^^ is it the same?
    const sql = stl({ debug: false });
    const query = sql`
    with my_values(a, b, c) as (
      values ${sql(["a", "b", "c"])}
      )
      select * from my_values
    `;
    expect(strip_ws(query.string)).toEqual(
      "with my_values(a, b, c) as ( values ($1, $2, $3) ) select * from my_values"
    );
    expect(query.parameters).to.have.ordered.members(["a", "b", "c"]);
  });

  test("values in an insert", async () => {
    const sql = stl({ debug: false });
    const data = [
      [1, 35, 565],
      [3, 89, 224],
      [6, 11, 456],
      [14, 87, 475],
    ];

    const query = sql`
    INSERT INTO myTable (id, posX, posY) VALUES ${sql(data)}
    ON CONFLICT (id) DO UPDATE SET
      posX = excluded.posX, posY = excluded.posY
    `;
    expect(strip_ws(query.string)).toEqual(
      strip_ws(`
        INSERT INTO myTable (id, posX, posY) 
        VALUES 
          ($1, $2, $3),($4, $5, $6),($7, $8, $9),($10, $11, $12) 
        ON CONFLICT (id) 
        DO UPDATE 
          SET posX = excluded.posX, posY = excluded.posY
      `)
    );
    expect(query.parameters).to.have.ordered.members([
      1, 35, 565, 3, 89, 224, 6, 11, 456, 14, 87, 475,
    ]);
  });
});

describe("sum of parts and expressions", () => {
  test("use of empty sql`` in a conditional", async () => {
    let sql = stl({ debug: false });

    // control variable
    let filterAge = true;
    const olderThan = (x) => sql`and age > ${x}`;
    let query = sql`
      select
       *
      from users
      where name is not null ${filterAge ? olderThan(50) : sql``}
    `;
    expect(strip_ws(query.string)).toEqual(
      "select * from users where name is not null and age > $1"
    );
    expect(query.parameters).to.have.ordered.members([50]);

    filterAge = false;
    query = sql`
      select
       *
      from users
      where name is not null ${filterAge ? olderThan(50) : sql``}
    `;
    expect(strip_ws(query.string)).toEqual(
      "select * from users where name is not null"
    );
    expect(query.parameters).to.have.ordered.members([]);
  });

  test("dynamic filters", async () => {
    let sql = stl({ debug: false });

    // control variable
    let id;
    let query = sql`
      select
       *
      from users ${id ? sql`where user_id = ${id}` : sql``}
    `;
    expect(strip_ws(query.string)).toEqual("select * from users");
    expect(query.parameters).to.have.ordered.members([]);

    id = 42;
    query = sql`
      select
      *
      from users ${id ? sql`where user_id = ${id}` : sql``}
    `;
    expect(strip_ws(query.string)).toEqual(
      "select * from users where user_id = $1"
    );
    expect(query.parameters).to.have.ordered.members([42]);
  });

  test("join fragments into full query", async () => {
    let sql = stl({ debug: false });

    let filter = {
      email: 'foo@foo.com',
      minAge: 20,
      maxAge: 30
    };

    // v.a can we improve DX for this use case?
    // conditions
    const email = sql`
      ${filter.email ? sql`email like ${filter.email}` : sql``}
    `;
    const min_age = sql`
      ${filter.minAge ? sql`age > ${filter.minAge}` : sql``}
    `;
    const max_age = sql`
      ${filter.maxAge ? sql`age < ${filter.maxAge}` : sql``}
    `;
    const query = sql`
      select * from test where ${email} and ${min_age} and ${max_age}
    `;

    expect(strip_ws(query.string)).toEqual(
      strip_ws(`
        select * from test where
          email like $1 and
          age > $2 and
          age < $3
      `)
    );
    expect(query.parameters).to.have.ordered.members(
      ['foo@foo.com', 20, 30]
    );
  });
});

describe("selects", () => {
  test("with query parameters", async () => {
    let sql = stl({ debug: false });

    const name = "Mur", age = 60;
    const query = sql`
      select
        name,
        age
      from users
      where
        name like ${name + "%"}
        and age > ${age}
    `;

    expect(strip_ws(query.string)).toEqual(
      "select name, age from users where name like $1 and age > $2"
    );
    expect(query.parameters).to.have.ordered.members(["Mur%", 60]);
  });

  test("from values", async () => {
    let sql = stl({ debug: false });
    const data = [
      [50, "Andrew"],
      [51, "Carol"],
      [52, "Bob"],
    ];

    const query = sql`
      select * from (values ${sql(data)})
    `;

    expect(strip_ws(query.string)).toEqual(
      "select * from (values ($1, $2),($3, $4),($5, $6))"
    );
    expect(query.parameters).to.have.ordered.members(data.flat());
  });

  test("select dynamic column", async () => {
    let sql = stl({ debug: false });
    const columns = ["name", "age"];
    const id = "id";
    let query = sql`
      select ${sql(id)},
        ${sql(columns)}
      from users
    `;

    expect(strip_ws(query.string)).toEqual('select "id", "name", "age" from users');
    expect(query.parameters).to.have.ordered.members([]);
  });

  test("dynamic select as", async () => {
    const sql = stl({ debug: false });
    const aliases = {
      fullname: "Tom Hardy",
      realage: 52,
    };

    const query = sql`select ${sql(aliases)} from fubar`;

    expect(strip_ws(query.string)).toEqual(
      'select $1 as "fullname", $2 as "realage" from fubar'
    );
    expect(query.parameters).to.have.ordered.members(["Tom Hardy", 52]);
  });

  test("all together", async () => {
    let sql = stl({ debug: false });
    const table = "users",
      column = "id";
    const alias = "foo";

    const data = {
      name: "Bad Alice",
      age: 25,
      email: "alice@example.com",
    };

    const data2 = [
      [50, "Andrew"],
      [51, "Carol"],
      [52, "Bob"],
    ];

    const query = sql`
      select ${sql(column)} as ${sql(alias)} 
      from (values ${sql(data2)} ) as ${sql(table)}
      where name = ${data.name}
    `;

    expect(strip_ws(query.string)).toEqual(
      'select "id" as "foo" from (values ($1, $2),($3, $4),($5, $6) ) as "users" where name = $7'
    );
    expect(query.parameters).to.have.ordered.members([
      50, "Andrew",
      51, "Carol",
      52, "Bob",
      "Bad Alice",
    ]);
  });
});

describe("inserts", () => {
  test("json", async () => {
    let sql = stl({ debug: false });
    const data = {
      name: "Alice",
      age: 25,
      email: "alice@example.com",
    };
    const query = sql`
      INSERT INTO users (id, data) 
      VALUES (1, json_encode(${data}))
    `;
    expect(strip_ws(query.string)).toEqual(
      "INSERT INTO users (id, data) VALUES (1, json_encode($1))"
    );
    expect(query.parameters).to.have.ordered.members([data]);
  });

  test("simple dynamic data insert", async () => {
    let sql = stl({ debug: false });
    const user = {
      name: "Murray",
      age: 68,
    };

    const query = sql`
      insert into users ${sql(user, "name", "age")}
    `;

    expect(strip_ws(query.string)).toEqual(
      'insert into users ("name", "age") values ($1, $2)'
    );
    expect(query.parameters).to.have.ordered.members(["Murray", 68]);
  });

  it("can handle multiple row inserts", () => {
    const sql = stl({ debug: false });

    const data = [
      { id: 1, age: 50, name: "Andrew" },
      { id: 2, age: 51, name: "Carol" },
      { id: 3, age: 52, name: "Bob" },
    ];
    let query = sql`
      insert into users ${sql(data, "age", "name")}
    `;
    expect(strip_ws(query.string)).toEqual(
      'insert into users ("age", "name") values ($1, $2),($3, $4),($5, $6)'
    );
    expect(query.parameters).to.have.ordered.members([
      50, 'Andrew', 51, 'Carol', 52, 'Bob'
    ]);

    query = sql`insert into users ${sql(data)}`;
    expect(strip_ws(query.string)).toEqual(
      'insert into users ("id", "age", "name") values ($1, $2, $3),($4, $5, $6),($7, $8, $9)'
    );
  });
});

describe("updates", () => {
  test("dynamic columns", async () => {
    let sql = stl({ debug: false });
    const user = {
      id: 1,
      name: "Murray",
      age: 68,
    };

    const query = sql`
      update users set ${sql(user, "name", "age")}
      where user_id = ${user.id}
    `;

    expect(strip_ws(query.string)).toEqual(
      'update users set "name"=$1, "age"=$2 where user_id = $3'
    );
    expect(query.parameters).to.have.ordered.members(["Murray", 68, 1]);
  });

  test("multiple updates in one query", async () => {
    let sql = stl({ debug: false });
    const data = [
      [1, "John", 34],
      [2, "Jane", 27],
    ];

    const query = sql`
      update users set name = update_data.name, age = update_data.age
      from (values ${sql(data)}) as update_data (id, name, age)
      where users.id = update_data.id
    `;

    expect(strip_ws(query.string)).toEqual(
      strip_ws(
        `
          update users 
            set name = update_data.name, age = update_data.age 
          from (values ($1, $2, $3),($4, $5, $6)) as update_data (id, name, age) 
          where users.id = update_data.id
        `
      )
    );
    expect(query.parameters).to.have.ordered.members([
      1, "John", 34,
      2, "Jane", 27,
    ]);
  });
});

describe('erroneous invocations', () => {
  // TODO: more intentionally incorrect usage tests
  const likes = 100;

  it('reject untagged identifier or string literal', () => {
    const sql = stl({ debug: false });
    let error;
    try {
      // access to trigger error
      sql(`SELECT * FROM posts WHERE likes > ${likes}`).string;
    } catch (e) {
      error = e.cause.code;
    }
    expect(error).toEqual("NOT_TAGGED_CALL");
  });

  it('reject untagged use with arguments', () => {
    const sql = stl({ debug: false });
    let error;
    try {
      // access to trigger error
      sql(`SELECT * FROM posts WHERE likes > ${likes}`, 123, 435).string;
    } catch (e) {
      error = e.cause.code;
    }
    expect(error).toEqual("NOT_TAGGED_CALL");
  });

  it('reject empty argument', () => {
    const sql = stl({ debug: false });
    let error;
    try {
      sql();
    } catch (e) {
      error = e.cause.code;
    }
    expect(error).toEqual("UNDEFINED_VALUE");
  });

  it('reject empty argument in expression', () => {
    const sql = stl({ debug: false });
    let error;
    try {
      sql`select ${sql()}`;
    } catch (e) {
      error = e.cause.code;
    }
    expect(error).toEqual("UNDEFINED_VALUE");
  });

  test("partial fragments cannot be reified", async () => {
    let sql = stl({ debug: false });
    let error;
    try {
      error = undefined;
      const data = [
        [1, "John", 34],
        [2, "Jane", 27],
      ];
      // access is needed to trigger
      sql`${sql(data)}`.string;
    } catch (e) {
      error = e.cause.code;
    }
    expect(error).toEqual("DATA_LACKS_CONTEXT");

    try {
      error = undefined;
      const data = [
        { id: 1, name: "John", age: 34 },
        { id: 2, name: "Jane", age: 27 },
      ];
      sql`${sql(data, "id", "name")}`.string;
    } catch (e) {
      error = e.cause.code;
    }
    expect(error).toEqual("DATA_LACKS_CONTEXT");
  });
});

describe('subquery', () => {
  it('handles subquery properly', () => {
    const sql = stl({ debug: false });
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
    const sql = stl({ debug: false });
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
    const sql = stl({ debug: false });
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
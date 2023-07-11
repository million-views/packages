import { assert, expect, test } from "vitest";
import stl from "@m5nv/stl";

// helper
const strip_ws = (str) => str.replace(/\s+/g, " ").trim();

/// miscellaneous
test("debug option", async () => {
  const my_debugger = function () {
    // console.log(arguments);
  };
  let sql = stl({ debug: my_debugger });

  const query = sql`
    create table test(int int)
  `;

  expect(strip_ws(query.string)).toEqual("create table test(int int)");
  expect(query.parameters).to.have.ordered.members([]);
});

/// primitive tests
test("null", async () => {
  const sql = stl({debug: false});

  const query = sql`select ${null} as x`;
  expect(query.string).toEqual("select $1 as x");
  expect(query.parameters).to.have.ordered.members([null]);
});

test("integer", async () => {
  const sql = stl({debug: false});

  const query = sql`select ${1} as x`;
  expect(query.string).toEqual("select $1 as x");
  expect(query.parameters).to.have.ordered.members([1]);
});

test("string", async () => {
  const sql = stl({debug: false});

  const query = sql`select ${"hello"} as x`;
  expect(query.string).toEqual("select $1 as x");
  expect(query.parameters).to.have.ordered.members(["hello"]);
});

test("boolean false", async () => {
  const sql = stl({debug: false});

  const query = sql`select ${false} as x`;
  expect(query.string).toEqual("select $1 as x");
  expect(query.parameters).to.have.ordered.members([false]);
});

test("boolean true", async () => {
  const sql = stl({debug: false});

  const query = sql`select ${true} as x`;
  expect(query.string).toEqual("select $1 as x");
  expect(query.parameters).to.have.ordered.members([true]);
});

test("date", async () => {
  const sql = stl({debug: false});

  const now = new Date();
  const query = sql`select ${now} as x`;
  expect(query.string).toEqual("select $1 as x");
  expect(now - query.parameters[0]).toEqual(0);
});

test("json", async () => {
  const sql = stl({debug: false});

  const data = { a: "hello", b: 42 };
  const query = sql`
    select ${data} as x
  `;
  expect(strip_ws(query.string)).toEqual("select $1 as x");
  expect(query.parameters).toEqual([data]);
});

test("empty array", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${[]} as x
  `;
  expect(strip_ws(query.string)).toEqual("select $1 as x");
  expect(query.parameters).toEqual([[]]);
});

test("array of integers", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${[1, 2, 3]} as x
  `;
  expect(strip_ws(query.string)).toEqual("select $1 as x");
  expect(query.parameters).toEqual([[1, 2, 3]]);
});

test("array of strings", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${["a", "b", "c"]} as x
  `;
  expect(strip_ws(query.string)).toEqual("select $1 as x");
  expect(query.parameters).toEqual([["a", "b", "c"]]);
});

test("array of dates", async () => {
  const sql = stl({debug: false});

  const now = new Date();
  const query = sql`
    select ${[now, now, now]} as x
  `;
  expect(strip_ws(query.string)).toEqual("select $1 as x");
  expect(query.parameters).toEqual([[now, now, now]]);
});

test("nested array n2", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${[
      [1, 2],
      [3, 4],
    ]} as x
  `;
  expect(strip_ws(query.string)).toEqual("select $1 as x");
  expect(query.parameters).toEqual([[[1, 2], [3,4]]]);
});

test("nested array n3", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${[
      [[1, 2]], 
      [[3, 4]], 
      [[5, 6]]]
    } as x
  `;
  expect(strip_ws(query.string)).toEqual("select $1 as x");
  expect(query.parameters).toEqual([[[[1, 2]], [[3,4]], [[5,6]]]]);
});

test("escape in arrays", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${['Hello "you"', "c:\\windows"]} as x
  `;
  expect(strip_ws(query.string)).toEqual("select $1 as x");
  expect(query.parameters).toEqual([['Hello "you"', 'c:\\windows']]);
});

test("escapes", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select 1 as ${sql('hej"hej')}
  `;
  expect(strip_ws(query.string)).toEqual('select 1 as "hej""hej"');
  expect(query.parameters).toEqual([]);
});

test("null for int", async () => {
  const sql = stl({debug: false});

  const query = sql`
    insert into test values(${null})
  `;
  expect(strip_ws(query.string)).toEqual('insert into test values($1)');
  expect(query.parameters).toEqual([null]);
});

/// error conditions
test("undefined values throws", async () => {
  const sql = stl({debug: false});

  let error;
  try {
    // access to trigger error
    sql`select ${undefined} as x`.string;
  } catch (x) {
    error = x.cause.code;
  };
  expect(error).toEqual("UNDEFINED_VALUE");
});

test("null sets to null", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${null} as x
  `;
  expect(strip_ws(query.string)).toEqual('select $1 as x');
  expect(query.parameters).toEqual([null]);
});

/// unsafe stuff
test("unsafe insert with parameters", async () => {
  const sql = stl({debug: false});

  const query = sql.unsafe(
    "insert into test values ($1) returning *", 
    [50]
  );
  expect(strip_ws(query.string)).toEqual(
    'insert into test values ($1) returning *'
  );
  expect(query.parameters).toEqual([50]);
});

test("unsafe simple", async () => {
  const sql = stl({debug: false});

  const query = sql.unsafe("select 1 as x");
  expect(strip_ws(query.string)).toEqual("select 1 as x");
  expect(query.parameters).toEqual([]);
});

test("unsafe insert", async () => {
  const sql = stl({debug: false});

  const uq = "insert into test values (1)";
  const query = sql.unsafe(uq);
  expect(strip_ws(query.string)).toEqual(uq);
  expect(query.parameters).toEqual([]);
});

// v.a: postgress library errors stating it cannot insert multiple
// commands into a prepared statement when using describe method;
// live query works fine. 
// todo: figure out what sqlite does and then fix test as needed.
test("simple query using unsafe with multiple statements", async () => {
  const sql = stl({debug: false});

  const query = sql.unsafe(
    "select 1 as x;select 2 as x"
  );
  expect(strip_ws(query.string)).toEqual(
    "select 1 as x;select 2 as x"
  );
  expect(query.parameters).toEqual([]);
});

/// stress tests
test("big query body", async () => {  
  const sql = stl({debug: false});

  const query = sql`
    insert into test ${sql(
      [...Array(50000).keys()].map((x) => ({ x }))
    )}
  `;
  expect(strip_ws(query.string)).toEqual(
    'insert into test ("x") values ' +
    [...Array(50000).keys()].map((x, i) => `($${i+1})`)
  );
});

test("throws if more than 65534 parameters", async () => {
  const sql = stl({debug: false});

  let error;
  try {
    // access to trigger error
    sql`
      insert into test ${sql(
        [...Array(65535).keys()].map((x) => ({ x }))
      )}
    `.parameters;
  } catch(e) {
    error = e.cause.code;
  }
  expect(error).toEqual("MAX_PARAMETERS_EXCEEDED");
});

// v.a: this test may not be applicable to `sqlite` since
// it is dynamically typed.
test("implicit cast of unknown types", async () => {
  const sql = stl({debug: false});

  const date = new Date().toISOString();
  const query = sql`
    insert into test values (${date}) returning *
  `;
  expect(strip_ws(query.string)).toEqual(
    "insert into test values ($1) returning *"
  );
  expect(query.parameters).toEqual([date]);
});

test("sql() throws not tagged error", async () => {
  const sql = stl({debug: false});

  let error;
  try {
    // access to trigger error
    sql("select 1").string;
  } catch (e) {
    error = e.cause.code;
  }
  expect(error).toEqual("NOT_TAGGED_CALL");
});


test("little bobby tables", async () => {
  const sql = stl({debug: false});

  const name = "Robert'); DROP TABLE students;--";
  const query = sql`
    insert into students (name) values (${name})
  `;
  expect(strip_ws(query.string)).toEqual(
    "insert into students (name) values ($1)"
  );
  expect(query.parameters).toEqual([name]);
});

/// dynamic sql
test("dynamic table name", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select * from ${sql("test")}
  `;
  expect(strip_ws(query.string)).toEqual(
    'select * from "test"'
  );
  expect(query.parameters).toEqual([]);
});

test("dynamic schema name", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select * from ${sql("public")}.test
  `;
  expect(strip_ws(query.string)).toEqual(
    'select * from "public".test'
  );
  expect(query.parameters).toEqual([]);
});

test("dynamic schema and table name", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select * from ${sql("public.test")}
  `;
  expect(strip_ws(query.string)).toEqual(
    'select * from "public"."test"'
  );
  expect(query.parameters).toEqual([]);
});

test("dynamic column name", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select 1 as ${sql("!not_valid")}
  `;
  expect(strip_ws(query.string)).toEqual(
    'select 1 as "!not_valid"'
  );
  expect(query.parameters).toEqual([]);
});

test("dynamic select as", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${sql({ a: 1, b: 2 })}
  `;
  expect(strip_ws(query.string)).toEqual(
    'select $1 as "a", $2 as "b"'
  );
  expect(query.parameters).toEqual([1, 2]);
});

test("dynamic select as pluck", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${sql({ a: 1, b: 2 }, "a")}
  `;
  expect(strip_ws(query.string)).toEqual(
    'select $1 as "a"'
  );
  expect(query.parameters).toEqual([1]);
});

test("dynamic insert", async () => {
  const sql = stl({debug: false});

  const x = { a: 42, b: "the answer" };
  const query = sql`
    insert into test ${sql(x)} returning *
  `;
  expect(strip_ws(query.string)).toEqual(
    'insert into test ("a", "b") values ($1, $2) returning *'
  );
  expect(query.parameters).toEqual([42, "the answer"]);
});

test("dynamic insert pluck", async () => {
  const sql = stl({debug: false});

  const x = { a: 42, b: "the answer" };
  const query = sql`
    insert into test ${sql(x, "a")} returning *
  `;
  expect(strip_ws(query.string)).toEqual(
    'insert into test ("a") values ($1) returning *'
  );
  expect(query.parameters).toEqual([42]);
});

test("dynamic in with empty array", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select * from test where null in ${sql([])}
  `;

  expect(strip_ws(query.string)).toEqual(
    'select * from test where null in (null)'
  );
  expect(query.parameters).toEqual([]);
});

test("dynamic in after insert", async () => {
  const sql = stl({debug: false});

  const query = sql`
    with x as (
      insert into test values (1, 'hej')
      returning *
    )
    select 1 in ${sql([1, 2, 3])} as x from x
  `;
  expect(strip_ws(query.string)).toEqual(
    strip_ws(`
      with x as ( insert into test values (1, 'hej') returning * ) 
      select 1 in ($1, $2, $3) as x from x
    `)
  );
  expect(query.parameters).toEqual([1, 2, 3]);
});

test("array insert", async () => {
  const sql = stl({debug: false});

  const query = sql`
    insert into test (a, b) values ${sql([1, 2])} returning *
  `;
  expect(strip_ws(query.string)).toEqual(
    'insert into test (a, b) values ($1, $2) returning *'
  );
  expect(query.parameters).toEqual([1, 2]);
});

test("where parameters in()", async () => {  
  const sql = stl({debug: false});

  const query = sql`
    select * from test where x in ${sql(["a", "b", "c"])}
  `;
  expect(strip_ws(query.string)).toEqual(
    "select * from test where x in ($1, $2, $3)"
  );
  expect(query.parameters).toEqual(["a", "b", "c"]);
});

test("where parameters in() values before", async () => {
  const sql = stl({debug: false});

  const query = sql`
    with rows(a) as (
      select * from (values (1), (2), (3), (4)) as x
    )
    select * from rows where a in ${sql([3, 4])}
  `;
  expect(strip_ws(query.string)).toEqual(
    strip_ws(`
      with rows(a) as ( 
        select * from (values (1), (2), (3), (4)) as x
      ) 
      select * from rows where a in ($1, $2)
    `)
  );
  expect(query.parameters).toEqual([3, 4]);
});

test("dynamic multi row insert", async () => {
  const sql = stl({debug: false});

  const x = { a: 42, b: "the answer" };
  const query = sql`
    insert into test ${sql([x, x])} returning *
  `;
  expect(strip_ws(query.string)).toEqual(
    'insert into test ("a", "b") values ($1, $2),($3, $4) returning *'
  );
  expect(query.parameters).toEqual(
    [42, "the answer", 42, "the answer"]
  );
});

test("dynamic update", async () => {
  const sql = stl({debug: false});

  const x = { a: 42, b: "the answer" };
  const query = sql`
    update test set ${sql(x)} returning *
  `;
  expect(strip_ws(query.string)).toEqual(
    'update test set "a"=$1, "b"=$2 returning *'
  );
  expect(query.parameters).toEqual(
    [42, "the answer"]
  );
});

test("dynamic update pluck", async () => {
  const sql = stl({debug: false});

  const query = sql`
    update test set ${sql(
      { a: 42, b: "the answer" },
      "a"
    )} returning *
  `;
  expect(strip_ws(query.string)).toEqual(
    'update test set "a"=$1 returning *'
  );
  expect(query.parameters).toEqual(
    [42]
  );
});

test("dynamic select array", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${sql(["a", "b"])} from test
  `;
  expect(strip_ws(query.string)).toEqual(
    'select "a", "b" from test'
  );
  expect(query.parameters).toEqual([]);
});

test("dynamic returning array", async () => {
  const sql = stl({debug: false});

  const cols = ["a", "b"];
  const query = sql`
    insert into test (a, b) values(42, 'yay') returning ${sql(cols)}
  `;
  expect(strip_ws(query.string)).toEqual(
    `insert into test (a, b) values(42, 'yay') returning "a", "b"`
  );
  expect(query.parameters).toEqual([]);
});

test("dynamic select args", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select ${sql("a", "b")} from test
  `;
  expect(strip_ws(query.string)).toEqual(
    'select "a", "b" from test'
  );
  expect(query.parameters).toEqual([]);
});

// v.a note sqlite does not support specification of column names
// in the `as` clause.
// todo: fix test
test("dynamic values single row", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select * from (values ${sql(["a", "b", "c"])}) as x(a, b, c)
  `;
  expect(strip_ws(query.string)).toEqual(
    'select * from (values ($1, $2, $3)) as x(a, b, c)'
  );
  expect(query.parameters).toEqual(["a", "b", "c"]);
});

// v.a note sqlite does not support specification of column names
// in the `as` clause. 
// todo: fix test
test("dynamic values multi row", async () => {
  const sql = stl({debug: false});

  const query = sql`
    select * from (values ${sql([
      ["a", "b", "c"],
      ["a", "b", "c"]
    ])}) as x(a, b, c)
  `;
  expect(strip_ws(query.string)).toEqual(
    'select * from (values ($1, $2, $3),($4, $5, $6)) as x(a, b, c)'
  );
  expect(query.parameters).toEqual(["a", "b", "c","a", "b", "c"]);
});

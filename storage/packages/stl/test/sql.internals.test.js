import { assert, expect, test } from "vitest";
import stl from "@m5nv/stl";

// strip whitespace
const strip_ws = (str) => str.replace(/\s+/g, " ").trim();
test("sqlite - ddl and miscellaneous", async () => {
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


test("sqlite - unsafe", async () => {
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


  query = sql.unsafe("truly fubared - don't do this");
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

test("sqlite - json", async () => {
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

test("sqlite - identifiers", async () => {
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

// Query parameters
test("sqlite - flow for query parameters", async () => {
  let sql = stl({ debug: false });
  const name = "Mur",
    age = 60;

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

// Values clause in a select
test("sqlite - flow for values in a select", async () => {
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

// Dynamic column selection
// TODO: check for sql injection
test("sqlite - flow for dynamic column selection", async () => {
  let sql = stl({ debug: false });
  const columns = ["name", "age"];
  const id = "id";
  let query = sql`
    select ${id},
      ${sql(columns)}
    from users
  `;

  expect(strip_ws(query.string)).toEqual('select $1, "name", "age" from users');
  expect(query.parameters).to.have.ordered.members(["id"]);

  sql = stl({ debug: false });
  const aliases = {
    fullname: "name",
    realage: "age",
  };

  // const name = "name",
  //   age = "age",
  //   cname = "fullname";
  // const user2 = { name, age };
  query = sql`select ${sql(aliases)} from fubar`;

  expect(strip_ws(query.string)).toEqual(
    'select $1 as "fullname", $2 as "realage" from fubar'
  );
  expect(query.parameters).to.have.ordered.members(["name", "age"]);
});

// Dynamic inserts
test("sqlite - flow for dynamic inserts", async () => {
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

// Dynamic inserts - multiple inserts in one query
test("sqlite - flow for multiple inserts in one query", async () => {
  let sql = stl({ debug: false });
  const data = [
    { id: 1, age: 50, name: "Andrew" },
    { id: 2, age: 51, name: "Carol" },
    { id: 3, age: 52, name: "Bob" },
  ];

  let query = sql`
    insert into users ${sql(data, "name", "age")}
  `;

  expect(strip_ws(query.string)).toEqual(
    'insert into users ("name", "age") values ($1, $2),($3, $4),($5, $6)'
  );
  expect(query.parameters).to.have.ordered.members([
    "Andrew",
    50,
    "Carol",
    51,
    "Bob",
    52,
  ]);

  query = sql`insert into users ${sql(data)}`;
  expect(strip_ws(query.string)).toEqual(
    'insert into users ("id", "age", "name") values ($1, $2, $3),($4, $5, $6),($7, $8, $9)'
  );
});

// Dynamic columns in updates
test("sqlite - flow for dynamic columns in updates", async () => {
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

// Multiple updates in one query
test("sqlite - flow for multiple updates in one query", async () => {
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
    1,
    "John",
    34,
    2,
    "Jane",
    27,
  ]);
});

// Dynamic values and `where in`
test("sqlite - flow for dynamic values and `where in`", async () => {
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

  // OR
  // TODO: what does this do? and is it supported in sqlite3?
  // See: https://stackoverflow.com/questions/43913457/how-do-i-name-columns-in-a-values-clause
  // ^^^ is it the same?
  sql = stl({ debug: false });
  query = sql`
    select *
    from (values ${sql(["a", "b", "c"])}) as x(a, b, c)
  `;
  expect(strip_ws(query.string)).toEqual(
    "select * from (values ($1, $2, $3)) as x(a, b, c)"
  );
  expect(query.parameters).to.have.ordered.members(["a", "b", "c"]);

  sql = stl({ debug: false });
  const tname = "user";
  const data = [
    [1, 35, 565],
    [3, 89, 224],
    [6, 11, 456],
    [14, 87, 475],
  ];
  query = sql`
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

/// Building queries
// partial queries
test("sqlite - flow for partial queries", async () => {
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

// TODO:
// should we even allow fragments to be riefied?
test("sqlite - flow for fragment", async () => {
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
    const data= [
      { id: 1, name: "John", age: 34 },
      { id: 2, name: "Jane", age: 27 },
    ];
    sql`${sql(data, "id", "name")}`.string;
  } catch(e) {
    error = e.cause.code;
  }
  expect(error).toEqual("DATA_LACKS_CONTEXT");
});

// dynamic filters
test("sqlite - flow for dynamic filters", async () => {
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

// SQL functions
test("sqlite - flow for SQL functions", async () => {
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

// table names
test("sqlite - flow for table names and column names as identifiers", async () => {
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

  const query2 = sql`VALUES (1, json_encode(${data}))`;

  const query = sql`
    select ${sql(column)} as ${sql(alias)} 
    from (values ${sql(data2)} ) as ${sql(table)}
    where name = ${data.name}
  `;

  expect(strip_ws(query.string)).toEqual(
    'select "id" as "foo" from (values ($1, $2),($3, $4),($5, $6) ) as "users" where name = $7'
  );
  expect(query.parameters).to.have.ordered.members([
    50,
    "Andrew",
    51,
    "Carol",
    52,
    "Bob",
    "Bad Alice",
  ]);
});

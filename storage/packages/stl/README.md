# Stl - Sql function tagged template literal library

`STL` is a dependency free JS library that simplifies the creation of
parameterized SQL statements. It shares the interface and a significant portion
of logic from [Porsager's Postgres.js library][1-ppl] for constructing both safe
and unsafe SQL. The key distinction with _STL_ is that it doesn't handle
database connectivity. This gives developers the freedom to combine it with
their preferred database library.

Although _STL_ is database agnostic, it is tested extensively with `SQLite` and
and occasionally with `Postgres`. It is biased towards `SQLite` being the
storage layer of choice.

## Quick start

### Install `stl`

```bash
$ npm install @m5nv/stl
```

### Use it

For `stl` to work effectively, it requires integration with a database library
of your choice. Essentially, `stl` is compatible with any database library that
supports parameterized SQL statements. In the code snippet below, simply swap
out `<your-favorite-database-library>` with the actual database library you're
using.

```js
import stl from "@m5nv/stl";
import db from "<your-favorite-database-library>";

const sql = stl({ debug: false });
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

const result = await db.all(query.string, query.parameters);
```

## Development and testing

- run `npm i` to install dev dependencies
- `cd test` && `npm link @m5nv/stl` to link to `src` in development
- `npm run test` || `npm run test:coverage` to test

## Queries

> [!NOTE]\
> The content below is adapted from the [Porsager's README][1-ppl] file. Thank
> you!

<!-- references -->

[1-ppl]: https://github.com/porsager/postgres
[2-ttf]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates

### Identifiers and keywords in SQL:

- 'keyword' A keyword in single quotes is a `string literal`.
- "keyword" A keyword in double-quotes is an `identifier`.
- identifier is a string that names an object/entity.

### ``sql`...` -> {string, parameters}``

STL utilizes [tagged template functions][2-ttf] to process query parameters
**before** interpolation. Using tagged template literals benefits developers by:

1. **Enforcing** safe query generation
2. Giving the `sql` `` function powerful [utility](#dynamic-inserts) and
   [query building](#building-queries) features.

Any generic value will be serialized according to an inferred type, and replaced
by a SQLite protocol placeholder `$1, $2, ...`. The parameters are then sent
separately to the database which handles escaping and casting.

All queries constructed using the tag function return a custom object which can
be passed to a driver function that accepts a query string and bind parameters;
the default key names in the object to access these values are `string` and
`parameters`. The shape of the parameters and key names can be changed by using
the 'format' option.

For instance to use query returned by **sql`...`** function with `Turso`, set
the `format` option to `turso` when constructing the template literal function.

```js
import stl from "@m5nv/stl";
import { createClient } from "@libsql/client";

const client = createClient({
  url: ":memory:",
});

// Construct query object to be compatible with Turso's named sql format
const sql = stl({ debug: false, format: "turso" });
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

const result = await db.execute(query);
const xs = await db.execute(sql`
  insert into users (
    name, age
  ) values (
    'Murray', 68
  )
  returning *
`);
```

The result and xs variables above will be in whatever format the driver returns.
To get the result value as an array like in Porsager's library STL provides a
`Result` function; using Result function allows you to treat the return result
from a database uniformly:

```js
const result_as_array = Result(result);
```

The array consists of items with objects mapping column names to each row and
can be iterated using a `for..of` loop as below:

```js
for (item of result_as_array) {
  // do something with item; it is an object mapping selected column name
  // as the key, and the value in the database
  // e.g., {name: 'Murray', age: 68}
}
```

### Query parameters

Parameters are automatically extracted and handled by the database so that SQL
injection isn't possible. No special handling is necessary, simply use tagged
template literals as usual.

```js
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
const users = Result(db.execute(query));
// users = [{ name: 'Murray', age: 68 }]
```

> [!WARNING]\
> Be careful with quotation marks here. Because SQLite infers column types, you
> do not need to wrap your interpolated parameters in quotes like `'${name}'`.
> This will cause an error because the tagged template replaces `${name}` with
> `$1` in the query string, leaving SQLite to do the interpolation. If you wrap
> that in a string, SQLite will see `'$1'` and interpret it as a string as
> opposed to a parameter.

In the following sections we omit assigning the return value of sql\`...\`
expression for brevity. It is implied that you will pass it to the library that
gives you access to the SQLite database, as shown in the example above.

### Dynamic column selection

```js
const columns = ['name', 'age']

sql`
  select
    ${ sql(columns) }
  from users
`

// Which results in:
select "name", "age" from users
```

### Dynamic inserts

```js
const user = {
  name: 'Murray',
  age: 68
}

sql`
  insert into users ${
    sql(user, 'name', 'age')
  }
`

// Which results in:
insert into users ("name", "age") values ($1, $2)

// The columns can also be given with an array
const columns = ['name', 'age']

sql`
  insert into users ${
    sql(user, columns)
  }
`
```

**You can omit column names and simply execute `sql(user)` to get all the fields
from the object as columns**. Be careful not to allow users to supply columns
that you do not want to be inserted.

#### Multiple inserts in one query

If you need to insert multiple rows at the same time it's also much faster to do
it with a single `insert`. Simply pass an array of objects to `sql()`.

```js
const users = [{
  name: 'Murray',
  age: 68,
  garbage: 'ignore'
},
{
  name: 'Walter',
  age: 80
}]

sql`insert into users ${ sql(users, 'name', 'age') }`

// Is translated to:
insert into users ("name", "age") values ($1, $2), ($3, $4)

// Here you can also omit column names which will use object keys as columns
sql`insert into users ${ sql(users) }`

// Which results in:
insert into users ("name", "age") values ($1, $2), ($3, $4)
```

### Dynamic columns in updates

This is also useful for update queries

```js
const user = {
  id: 1,
  name: 'Murray',
  age: 68
}

sql`
  update users set ${
    sql(user, 'name', 'age')
  }
  where user_id = ${ user.id }
`

// Which results in:
update users set "name" = $1, "age" = $2 where user_id = $3

// The columns can also be given with an array
const columns = ['name', 'age']

sql`
  update users set ${
    sql(user, columns)
  }
  where user_id = ${ user.id }
`
```

### Multiple updates in one query

To create multiple updates in a single query, it is necessary to use arrays
instead of objects to ensure that the order of the items correspond with the
column names.

```js
const users = [
  [1, "John", 34],
  [2, "Jane", 27],
];

sql`
  update users set name = update_data.name, age = (update_data.age)::int
  from (values ${sql(users)}) as update_data (id, name, age)
  where users.id = (update_data.id)::int
  returning users.id, users.name, users.age
`;
```

### Dynamic values and `where in`

Value lists can also be created dynamically, making `where in` queries simple
too.

```js
sql`
  select
    *
  from users
  where age in ${sql([68, 75, 23])}
`;
```

or

```js
sql`
  select
    *
  from (values ${sql(["a", "b", "c"])}) as x(a, b, c)
`;
```

## Building queries

`STL` features a simple dynamic query builder by conditionally appending or
omitting query fragments. It works by nesting `sql` `fragments within other`
sql`` calls or fragments. This allows you to build dynamic queries safely
without risking sql injections through usual string concatenation.

### Partial queries

```js
const olderThan = x => sql`and age > ${ x }`

const filterAge = true

sql`
  select
   *
  from users
  where name is not null ${
    filterAge
      ? olderThan(50)
      : sql``
  }
`
// Which results in:
select * from users where name is not null
// Or
select * from users where name is not null and age > 50
```

### Dynamic filters

```js
sql`
  select
    *
  from users ${
    id
      ? sql`where user_id = ${ id }`
      : sql``
  }
`

// Which results in:
select * from users
// Or
select * from users where user_id = $1
```

### SQL functions

Using keywords or calling functions dynamically is also possible by using `sql`
`` fragments.

```js
const date = null

sql`
  update users set updated_at = ${ date || sql`now()` }
`

// Which results in:
update users set updated_at = now()
```

### Table names

Dynamic identifiers like table names and column names is also supported like so:

```js
const table = 'users', column = 'id'

sql`
  select ${ sql(column) } from ${ sql(table) }
`

// Which results in:
select "id" from "users"
```

### Quick primer on interpolation

Here's a quick oversight over all the ways to do interpolation in a query
template string:

| Interpolation syntax      | Usage                         | Example                                                         |
| ------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `${ sql`...`}`            | for keywords or sql fragments | `` await sql`SELECT * FROM users ${sql`order by age desc` }` `` |
| `${ sql(string) }`        | for identifiers               | `` await sql`SELECT * FROM ${sql('table_name')` ``              |
| `${ sql([] or {}, ...) }` | for helpers                   | `` await sql`INSERT INTO users ${sql({ name: 'Peter'})}` ``     |
| `${ 'somevalue' }`        | for values                    | `` await sql`SELECT * FROM users WHERE age = ${42}` ``          |

### Multiple statements in one query

Check your database library on how to execute multiple statements. STL tries to
emulate the behavior of the library that it takes inspiration from by
disallowing dynamic parameters. It will throw an error if the expression has
multiple statements and requires interpolation. The following example simply
returns the query as is since the statements are not `dynamic`.

```js
sql`select 1; select 2;`;
```

## Deviation from `porsager's` postgres library

1. Removed origin of `Error` reporting from `stl` layer since...
   - the original implementation's optimization leads to faulty origin
   - probably best implemented at the application layer
   - [Read more here](https://github.com/porsager/postgres/issues/17#issuecomment-581964196)

2. Error codes are specfied in `cause` of `Error` instead of in `code`...
   - to reuse platform provided ways and means...

3. Remove code for transforming data since...
   - new code is unlikely to use this feature (?)
   - better handled at the application layer

# References

## Database security and SQL Injection

- [SQL Injection Attack: What it is and how to prevent it](https://www.linode.com/docs/guides/sql-injection-attack/)
- [Wikipedia: SQL Injection](https://en.wikipedia.org/wiki/SQL_injection)
- [OWASP: SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Database Security: User Management](https://www.linode.com/docs/guides/sql-security/)

## The no ORM camp

- [Just write SQL](https://www.propelauth.com/post/drizzle-an-orm-that-lets-you-just-write-sql)
- [ORM vs Query Builders](https://neon.tech/blog/orms-vs-query-builders-for-your-typescript-application)

## SQLite

- [JSON improvements](https://tirkarthi.github.io/programming/2022/02/26/sqlite-json-improvements.html)
- [Virtual columns to speed up json data query](https://antonz.org/json-virtual-columns/)
- [Retrieving related rows in a single query](https://til.simonwillison.net/sqlite/related-rows-single-query)
- [Passing arrays as parameters using json trick](https://ricardoanderegg.com/posts/sqlite-list-array-parameter-query/)
- [SQLite CLI](https://www.sqlite.org/cli.html)

## SQL standard and differences

- [SQL that works on PostgreSQL, MySQL, and SQLite](https://evertpot.com/writing-sql-for-postgres-mysql-sqlite/)
- [Differences between engines](https://www.sqlite.org/sqllogictest/wiki?name=Differences+Between+Engines)

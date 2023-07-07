# Stl - Sql function tagged template literal library

`Stl` is a JS library that simplifies the creation of parameterized 
SQL statements. It shares the interface and a significant portion 
of logic from `porsarger's postgres.js` for constructing both
safe and unsafe SQL. The key distinction with `Stl` is that it doesn't
handle database connectivity. This gives developers the freedom to
combine it with their preferred database library.

This library exists so that we can build MVP and prototypes with little
to no friction when working with databases. It is biased towards 
`sqlite` being the storage layer of choice.  

## Quick start

### Install `stl`
```bash
$ npm install @m5nv/stl
```

### Use it
For `stl` to work effectively, it requires integration with a database 
library of your choice. Essentially, `stl` is compatible with any 
database library that supports parameterized SQL statements. In the
code snippet below, simply swap out `<your-favorite-database-library>` 
with the actual database library you're using.

```js
import stl from '@m5nv/stl'
import db from '<your-favorite-database-library>'

const sql = stl({debug: false});
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

## Detailed example
We'll be using the widely-used `sqlite3` library for Node.js in our
extended example. Please remember that the `db.js` file we're building
here is just for illustrative purposes. It's not an integral part
of stl, and we haven't put it through thorough testing or development
to ensure robustness or completeness.

### Install `sqlite3` for node
```bash
npm install sqlite3
```

### Create your database instance
The `db.js` should expose a database instance and ideally offer a
straight forward API interface for the application. 

```js
// db.js
import sqlite3 from 'sqlite3';
import {sql_tagged_literal} from '@m5nv/stl'

export class Query extends Promise {
  constructor(strings, args, options, db) {
    let resolve, reject;
    super((a, b) => { resolve = a; reject = b; });

    this.db = db;
    this.options = options;
    this.query = sql_tagged_literal(strings, args, options);
    this.executed = false;
    this.callback = (call=undefined) => {
      return function(error, result) {
        if (error) return reject(error);
        if (call === 'run') return resolve([this.lastID]);
        return resolve(result);
      }
    };
  }

  static get [Symbol.species]() {
    return Promise;
  }
  
  async handle(op, cb) {
    if (!this.executed) {
      this.executed = true;
      return this.db[op](this.query.string, this.query.parameters, cb);
    }
  }

  get() { this.handle('get', this.callback()); return this; }
  all() { this.handle('all', this.callback()); return this; }
  run() { this.handle('run', this.callback('run')); return this; }
}

export default function sqlite(options) {
  options = { debug: false, verbose: true, db: ':memory:', ...options };
  if (typeof options.debug !== "function") {
    options.debug = options.debug === true ? console.log : () => {};
  }

  let db;
  if (options.verbose) {
    db = new (sqlite3.verbose()).Database(options.db);
  } else {
    db = new sqlite3.Database(options.db);
  }

  // bootstrap
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY, name TEXT, age INTEGER
      )
    `);
  });

  function sqlHelper(strings, ...args) {
    return new Query(strings, args, options, db);
  }

  function unsafeHelper(string, args = []) {
    return new Query([string], args, options, db);
  }

  sqlHelper.unsafe = unsafeHelper;
  return sqlHelper;
}

```

```js
// users.js
import storage from './db.js'

const options = {
  debug: false,
  verbose: true,
  db: ':memory:',
};

const sql = storage(options);

export async function getUsersOver(age) {
  return sql`
    select name, age
    from users
    where age > ${ age }
  `.all();
}

export async function insertUser({ name, age }) {
  return sql`
    insert into users (name, age)
    values (${ name }, ${ age })
    returning name, age
  `.run();
}
```

## Notes
### identifiers and keywords in SQL:
- 'keyword' A keyword in single quotes is a `string literal`.
- "keyword" A keyword in double-quotes is an `identifier`.
- identifier is a string that names an object/entity.

### Overview of interpolation syntax
stl can interpolate the following use cases:

| Interpolation syntax       | Usage                         | Example                                                   |
| -------------              | -------------                 | -------------                                             |
| `${ sql`` }`               | for keywords or sql fragments | ``sql`SELECT * FROM users ${sql`order by age desc` }` ``  |
| `${ sql(string) }`         | for identifiers               | ``sql`SELECT * FROM ${sql('table_name')` ``               |
| `${ sql([] or {}, ...) }`  | for helpers                   | ``sql`INSERT INTO users ${sql({ name: 'Peter'})}` ``      |
| `${ 'somevalue' }`         | for literal values            | ``sql`SELECT * FROM users WHERE age = ${42}` ``           |

## Queries
Consult [porsager's queries section as a reference](https://github.com/porsager/postgres#queries).
Please file a bug report if you find any discrepancy with the interpolation.

## Deviation from `porsager's` postgres library
### Remove origin of `Error` reporting from `stl` layer
Rationale:
- the original implementation's optimization leads to faulty origin
- probably best implemented at the application layer
- [Read more here](https://github.com/porsager/postgres/issues/17#issuecomment-581964196)

### Error codes are specfied in `cause` of `Error` instead of in `code`
Rationale: 
- reuse platform provided ways and means...

### Remove code for transforming data
Rationale:
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


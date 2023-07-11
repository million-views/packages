# Stl - Sql function tagged template literal library

`Stl` is a JS library that simplifies the creation of parameterized 
SQL statements. It shares the interface and a significant portion 
of logic from `porsager's postgres.js` for constructing both
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

## Development and testing
- run `npm i` to install dev dependencies
- `cd test` && `npm link @m5nv/stl` to link to `src` in development
- `npm run test` || `npm run test:coverage` to test 


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


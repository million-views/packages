import storage from './db.js'
import stl from '@m5nv/stl'

const options = {
  debug: false,
  verbose: false,
  db: ':memory:'
};

const sql = stl(options);
const db = storage(options);

export async function getUsersOver(age) {
  const query = sql`
    select name, age
    from users
    where age > ${ age }
  `;
  return db.all(query.string, query.parameters);
}

export async function insertUser({ name, age }) {
  const query = sql`
    insert into users (name, age)
    values (${ name }, ${ age })
    returning name, age
  `;
  return db.run(query.string, query.parameters);
}
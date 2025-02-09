import storage from './db.js'

const options = {
  debug: false,
  verbose: true,
  db: 'users.db',
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

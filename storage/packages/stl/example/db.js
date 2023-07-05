import sqlite3 from 'sqlite3';

export default function sqlite(options) {
  options = { verbose: true, db: ':memory:', ...options };
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
        id PRIMARY KEY, name TEXT, age INTEGER
      )
    `);
  });

  function callback(resolve, reject, message=undefined) {
    return (error, result) => {
      if (error) return reject(error);
      if (message) return resolve(message);
      return resolve(result);
    }
  }

  function run(sql, params) {
    return new Promise((resolve, reject) => {
      db.run(sql, ...params, callback(resolve, reject, "ok!"));
    });
  }

  function get(sql, params) {
    return new Promise((resolve, reject) => {
      db.get(sql, ...params, callback(resolve, reject));
    });
  }

  function all(sql, params) {
    return new Promise((resolve, reject) => {
      db.all(sql, ...params, callback(resolve, reject));
    });
  }

  return {
    run, get, all
  };
}

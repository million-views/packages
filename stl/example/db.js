import sqlite3 from 'sqlite3';
import {sql_tagged_literal} from '@m5nv/stl'

// WARN: demo code to illustrate that it is feasible to provide a DX
// similar to that offered by porsarger's postgres.js library...
// needs more code and testing to become usable.
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

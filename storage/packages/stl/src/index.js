/**
 * STL: function tagged template literal to construct safe SQL
 */
export default function stl(options) {
  options = { debug: false, ...options };
  if (typeof options.debug !== "function") {
    options.debug = options.debug === true ? console.log : () => { };
  }

  function sqlHelper(strings, ...args) {
    return sql_tagged_literal(strings, args, options);
  }

  function unsafeHelper(string, args = []) {
    return sql_tagged_literal([string], args, { ...options, unsafe: true });
  }

  // escape hatches and convenience functions
  sqlHelper.unsafe = unsafeHelper;
  return sqlHelper;
}

/// transform stl query format for Turso
export function transform(query) {
  const args = query.parameters.reduce((acc, val, idx) => ({ ...acc, [`$${idx + 1}`]: val }), {});
  const sql = query.string;
  return { sql, args };
}

/// Result wraps either rows returned by the db driver or an Error object
/// so that the application layer is not littered with try/catch blocks. For
/// to work, the developer working with SQL should catch the error and wrap
/// it using Result function.
///
/// Note: class performs better than a function but I like creating objects
/// without using new at the callsite; class or otherwise, it is to be noted
/// that we are adding latency here for the sake of better ergonomics in 
/// dealing with database results uniformly.
///
/// At the moment this assumes the db driver is Turso. The use of this function
/// is optional; i.e the STL functionality doesn't depend on it.
export function Result(result = null) {
  if (!new.target) {
    return new Result(result);
  }

  const instance = Object.create(Result.prototype);
  Array.apply(instance);

  if (result) {
    if (result instanceof Error) {
      instance.error = result;
    } else {
      instance.count = result.rowsAffected;
      instance.columns = result.columns?.map((col, index) => ({
        name: col,
        type: result.columnTypes[index],
      }));
      instance.push(...result.rows);
    }
  }

  return instance;
}

// Inherit from Array
Object.setPrototypeOf(Result.prototype, Array.prototype);
Object.setPrototypeOf(Result, Array);

// Define properties
// Notes:
//  .count
//  The count property is the number of affected rows returned by the 
//  database. This is useful for insert, update and delete operations to
//  know the number of rows affected since .length will be 0 in these 
//  cases even when using returning clause unless the query explicitly
//  deals with conflict.... This also implies that .count may not agree
//  with .length
//
//  .command
//  The command run by the query (one of SELECT, UPDATE, INSERT, DELETE)
//  This is set depending on the implementation of the db client
//
//  .error
//  This is specific to our implementation; rather than throw an error,
//  api could set the error object to transfer the error received from
//  the database. The value is in a object that will contain `{
//  {cause: ...}} when set.  TODO: is this a good idea?
Object.defineProperties(Result.prototype, {
  [Symbol.toStringTag]: { value: "Result", writable: false },
  count: { value: null, writable: true },
  command: { value: null, writable: true },
  columns: { value: null, writable: true },
  error: { value: undefined, writable: true },
});


////////////////////////////////////////////////////////////////////////
const CTX = Symbol.for("@m5nv/storage/stl/context");
const STL = Symbol.for("@m5nv/storage/stl/context/type/query");
const VAR = Symbol.for("@m5nv/storage/stl/context/type/identifier");
const FUN = Symbol.for("@m5nv/storage/stl/context/type/builder");

const errors = {
  UNDEFINED_VALUE: "undefined values are not allowed",
  NOT_TAGGED_CALL: "query is not a tagged template literal",
  MAX_PARAMETERS_EXCEEDED: "max number of parameters (65534) exceeded",
  DATA_LACKS_CONTEXT: "context needed to transform data",
};

function throw_error_and_bail(code, context) {
  let msg = errors[code] ?? "oops! please file a bug report if you can";
  throw Error(msg, { cause: { code, context } });
}

// figure out how to handle the template literal or function invocation
function analyze_inputs(strings, args, options) {
  const tagged = Array.isArray(strings?.raw);
  let { unsafe = false } = options, type;
  if (tagged || unsafe) {
    type = STL;
  } else if (typeof strings === "string" && args.length == 0) {
    type = VAR;
  }
  else if (strings === null || strings === undefined) {
    throw_error_and_bail("UNDEFINED_VALUE");
  } else {
    type = FUN;
  }

  return [tagged, unsafe, type];
}

// main driver function to get things going
export function sql_tagged_literal(strings, args, options) {
  const [tagged, unsafe, type] = analyze_inputs(strings, args, options);

  return {
    get string() {
      return resolve(this[CTX], options).string;
    },

    get parameters() {
      return resolve(this[CTX], options).parameters;
    },

    [CTX]: {
      type,
      unsafe,
      tagged,
      strings,
      args,
    },
  };
}

function resolve(context, options) {
  options.debug({ fn: 'resolve.enter', context });
  if (context.tagged !== true && context.unsafe === false) {
    throw_error_and_bail("NOT_TAGGED_CALL");
  }

  if (context.resolved) return context.resolved;

  let parameters = [], string = fragment(context, parameters, options);

  if (context.unsafe) {
    // unsafe with arguments
    for (let arg of context.args) {
      handle_value(arg, parameters, context.options);
    }
  }

  // cache the result
  context.resolved = { string, parameters };

  options.debug({ fn: 'resolve.done', context });

  if (context.resolved.parameters.length >= 65534) {
    throw_error_and_bail("MAX_PARAMETERS_EXCEEDED");
  }

  return context.resolved;
}

// used to transform `sql([] | {}, ...)` helper function based on
// where it is invoked within a query fragment. Default is to consider
// the data values as identifiers.
function build(value, context, parameters, options) {
  // if (context.trim().length === 0) {
  if (/^\s*$/.test(context) === true) {
    throw_error_and_bail("DATA_LACKS_CONTEXT");
  }

  const helpers = builders.map(([x, fn]) => ({
    i: context.search(x) ?? -1,
    fn,
  }));

  // find the inner most keyword helper
  const helper = helpers.sort((a, b) => a.i - b.i).pop();

  return helper.i === -1
    ? escape_identifiers(value.strings)
    : helper.fn(value.strings, value.args, parameters, options);
}

function escape_identifier(str, options) {
  let escaped = "";
  for (let i = 0, imax = str.length; i < imax; i++) {
    if (str[i] === '"') {
      escaped += '""';
    } else if (str[i] === ".") {
      escaped += '"."';
    } else {
      escaped += str[i];
    }
  }

  return '"' + escaped + '"';
}

function escape_identifiers(xs, options) {
  return Array.isArray(xs)
    ? xs.map((x) => escape_identifier(x)).join(", ")
    : xs;
}

function handle_value(value, parameters, options) {
  // undefined values are not allowed
  if (value === undefined) {
    throw_error_and_bail("UNDEFINED_VALUE");
  }

  parameters.push(value);
  return "$" + parameters.length;
}

/// stringify first string and argument of the query
function fragment(q, parameters, options) {
  q = q?.[CTX] ?? q;
  let string = q.strings[0], value = q.args[0];

  for (let i = 1, imax = q.strings.length; i < imax; i++) {
    string +=
      stringify_value(string, value, parameters, options) + q.strings[i];
    value = q.args[i];
  }

  return string;
}

function stringify_value(string, value, parameters, options) {
  value = value?.[CTX] ?? value;
  options.debug({ fn: 'stringify_value', string, value });
  if (value) {
    const type = value?.type;
    if (type === FUN) {
      return build(value, string, parameters, options);
    } else if (type === STL) {
      return fragment(value, parameters, options);
    } else if (type === VAR) {
      return escape_identifier(value.strings, options);
    } else if (value[0]?.type == STL) {
      // todo: find a test case
      options.debug({ fn: "stringify_value.sub_query", value });
      return value.reduce(
        (acc, x) => acc + " " + fragment(x, parameters, options),
        ""
      );
    }
  }

  return handle_value(value, parameters, options);
}

function build_values(rows, parameters, cols, options) {
  let result = "";
  for (let i = 0, imax = rows.length; i < imax; i++) {
    let row = "";
    for (let j = 0, jmax = cols.length; j < jmax; j++) {
      const col = stringify_value(
        "values",
        rows[i][cols[j]],
        parameters,
        options
      );
      row += (j > 0 ? ", " : "") + col;
    }
    result += (i > 0 ? "," : "") + "(" + row + ")";
  }

  return result;
}

function rows_and_columns_for(fn, first, rest, options) {
  options.debug({ "racf.enter": fn, first, rest });
  let rows, columns;
  if (fn === "select" || fn === "update") {
    columns = rest.length ? rest.flat() : Object.keys(first);
    rows = first;
  } else {
    // fix (?) https://github.com/porsager/postgres/issues/321
    let multi =
      fn === "insert" ? Array.isArray(first) : Array.isArray(first[0]);
    columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first);
    rows = multi ? first : [first];
  }

  options.debug({ "racf.exit": fn, rows, columns });
  return [rows, columns];
}

/// begin: data transformation functions
/// 'values' builder
function dtf_values(first, rest, parameters, options) {
  const [rows, columns] = rows_and_columns_for("values", first, rest, options);
  return build_values(rows, parameters, columns, options);
}

/// 'select' builder
function dtf_select(first, rest, parameters, options) {
  if (typeof first === "string") {
    first = [first].concat(rest);
  }

  if (Array.isArray(first)) {
    return escape_identifiers(first);
  }

  const [rows, columns] = rows_and_columns_for("select", first, rest, options);
  let results = [];
  for (let cname of columns) {
    let cvalue, value = rows[cname];
    const type = value?.type;
    if (type === STL) {
      cvalue = fragment(value, parameters, options);
    } else if (type === VAR) {
      cvalue = value.strings;
    } else {
      cvalue = handle_value(value, parameters, options);
    }

    results.push(`${cvalue} as ${escape_identifier(cname, options)}`);
  }

  return results.join(", ");
}

// 'in' builder
function dtf_in(first, rest, parameters, options) {
  const [rows, columns] = rows_and_columns_for("in", first, rest, options);
  const result = build_values(rows, parameters, columns, options);
  return result === "()" ? "(null)" : result;
}

// 'update' builder
function dtf_update(first, rest, parameters, options) {
  const [rows, columns] = rows_and_columns_for("update", first, rest, options);
  let result = [];
  for (const column of columns) {
    const ident = escape_identifier(column, options);
    const value = stringify_value("values", rows[column], parameters, options);
    result.push(`${ident}=${value}`);
  }

  return result.join(", ");
}

// 'insert' builder
function dtf_insert(first, rest, parameters, options) {
  const [rows, columns] = rows_and_columns_for("insert", first, rest, options);
  const escapedIdentifiers = escape_identifiers(columns, options);
  const values = build_values(rows, parameters, columns, options);

  return `(${escapedIdentifiers}) values ${values}`;
}

const builders = Object.entries({
  values: dtf_values,
  in: dtf_in,
  select: dtf_select,
  as: dtf_select,
  returning: dtf_select,
  update: dtf_update,
  insert: dtf_insert,
}).map(([keyword, fn]) => {
  const kre = new RegExp(
    `((?:^|[\\s(])${keyword}(?:$|[\\s(]))(?![\\s\\S]*\\1)`,
    "i"
  );
  return [kre, fn];
});
